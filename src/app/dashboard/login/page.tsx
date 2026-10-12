import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { allowedEmails, dashboardSession, googleConfigured, googleRedirectUri } from '@/lib/crm/session';

const errors: Record<string, string> = {
  state: 'La entrada venció. Vuelve a intentar.',
  google: 'Google no completó el acceso.',
  cuenta: 'Esa cuenta de Google no tiene acceso al CRM.',
  config: 'Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.',
  lista: 'Falta la lista de correos que pueden entrar.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await dashboardSession()) redirect('/dashboard');
  const params = await searchParams;
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const redirectUri = googleRedirectUri(`${proto}://${host}`);
  const ready = googleConfigured() && allowedEmails().length > 0;

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <div className="w-full max-w-md bg-paper p-8 text-ink">
        <p className="font-brand text-xs font-extrabold uppercase tracking-[0.22em]">Cluster</p>
        <h1 className="mt-3 font-display text-6xl tracking-wide">CRM</h1>
        <p className="mt-4 text-sm leading-relaxed text-black/60">Entra con una cuenta de Google que esté en la lista del panel.</p>
        {params.error ? <p className="mt-4 text-sm">{errors[params.error] || 'No se pudo entrar.'}</p> : null}
        {ready ? (
          <a href="/dashboard/auth/google" className="mt-6 inline-flex bg-brand px-4 py-2 text-sm font-medium text-ink">
            Entrar con Google
          </a>
        ) : (
          <ol className="mt-6 space-y-3 text-sm leading-relaxed text-black/70">
            <li>1. En Google Cloud crea un cliente OAuth de tipo Web.</li>
            <li>
              2. En URIs de redirección autorizados pega <span className="font-mono text-xs text-ink">{redirectUri}</span>
            </li>
            <li>3. En .env.local define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y DASHBOARD_ALLOWED_EMAILS.</li>
            <li>4. Reinicia el servidor y vuelve a esta pantalla.</li>
          </ol>
        )}
      </div>
    </main>
  );
}
