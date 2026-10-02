import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isInternalPodcastRewrite =
    request.nextUrl.searchParams.get('__podcast') === '1' &&
    (pathname === '/es/participa' ||
      pathname.startsWith('/es/participa/') ||
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
