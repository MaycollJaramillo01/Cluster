import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { areaForPath, canDo, homeFor, isStaffRole } from '@/lib/crm/roles';

const intlMiddleware = createMiddleware(routing);

function base64url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Rol de la cookie del panel, con la misma firma que session.ts (HMAC-SHA256, base64url).
async function panelRole(token: string) {
  const secret = (process.env.CAREERS_AUTH_SECRET || process.env.DASHBOARD_AUTH_SECRET || process.env.CAREERS_ADMIN_PASSWORD || '').trim()
    || (process.env.NODE_ENV === 'production' ? '' : 'cluster-dev-only-secret');
  const [payload, sig] = token.split('.');
  if (!secret || !payload || !sig) return null;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = base64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  if (expected !== sig) return null;
  try {
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: string; mfa?: boolean; exp?: number };
    if (!data.mfa || typeof data.exp !== 'number' || data.exp < Date.now() || !isStaffRole(data.role || '')) return null;
    return data.role as Parameters<typeof homeFor>[0];
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Páginas del panel fuera del rol: también cubre la navegación interna, que no vuelve a pasar por el layout.
  // Las acciones y los datos se vuelven a validar en el servidor contra la base.
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const area = areaForPath(pathname);
    const role = area ? await panelRole(request.cookies.get('cluster_dashboard')?.value || '') : null;
    if (area && role && !canDo(role, area)) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
  }

  // CRM interno. Vive fuera de los prefijos de idioma.
  if (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/academia' ||
    pathname.startsWith('/academia/') ||
    pathname === '/p' ||
    pathname.startsWith('/p/')
  ) {
    return NextResponse.next();
  }
  const isInternalPodcastRewrite =
    request.nextUrl.searchParams.get('__podcast') === '1' &&
    (pathname === '/es/participa' ||
      pathname.startsWith('/es/participa/') ||
      pathname === '/es/participacion' ||
      pathname === '/es/patrocinios');

  // The rewrite is evaluated by middleware a second time in production. Let
  // that internal request reach the locale route instead of canonicalizing it
  // back to the public, unprefixed URL.
  if (isInternalPodcastRewrite) {
    return NextResponse.next();
  }

  const isSpanishPodcastRoute =
    pathname === '/participa' ||
    pathname.startsWith('/participa/') ||
    pathname === '/participacion' ||
    pathname === '/patrocinios';

  // These campaign URLs are intentionally unprefixed. A direct rewrite keeps
  // the public URL stable and avoids a default-locale redirect loop in Node.
  if (isSpanishPodcastRoute) {
    const target = request.nextUrl.clone();
    target.pathname = `/es${pathname}`;
    target.searchParams.set('__podcast', '1');
    return NextResponse.rewrite(target);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
