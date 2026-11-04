import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminHasPassword } from '@/lib/crm/admins';
import { dashboardUnlocked, login } from '@/lib/crm/access';
import { googleConfigured, PRIMARY_ADMIN } from '@/lib/crm/session';

const errors: Record<string, string> = {
  cuenta: 'Ese correo no es administrador.',
  clave: 'La contraseña no coincide.',
  corta: 'La contraseña necesita al menos 8 caracteres.',
  google: 'Google no completó el ingreso.',
  config: 'Faltan las claves de Google.',
  lista: 'No hay correos autorizados.',
  state: 'La sesión de Google venció. Intenta de nuevo.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await dashboardUnlocked()) redirect('/dashboard');
  const params = await searchParams;
  const firstTime = !(await adminHasPassword(PRIMARY_ADMIN));

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <div className="w-full max-w-sm bg-paper p-8 text-ink">
        <p className="font-brand text-xs font-extrabold uppercase tracking-[0.22em]">Cluster</p>
        <h1 className="mt-3 font-display text-6xl tracking-wide">CRM</h1>
        <p className="mt-3 text-sm text-black/60">
          Administrador: {PRIMARY_ADMIN}
        </p>
        {firstTime ? (
          <p className="mt-2 text-sm text-black/60">Primera entrada: elige la contraseña de esa cuenta. Después se pide siempre.</p>
        ) : null}
        <form action={login} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Correo</span>
            <input className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand" name="email" type="email" required autoFocus defaultValue={PRIMARY_ADMIN} />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Contraseña</span>
            <input className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand" name="password" type="password" required minLength={8} />
          </label>
          {params.error ? <p className="text-sm">{errors[params.error] || 'No se pudo entrar.'}</p> : null}
          <button className="w-full bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">
            Entrar
          </button>
        </form>
        {googleConfigured() ? (
          <Link className="mt-4 block border border-black/15 px-4 py-2 text-center text-sm" href="/dashboard/auth/google">
            Entrar con Google
          </Link>
        ) : null}
      </div>
    </main>
  );
}
