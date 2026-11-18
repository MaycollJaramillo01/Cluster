import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminHasPassword } from '@/lib/crm/admins';
import { dashboardUnlocked } from '@/lib/crm/access';
import { googleConfigured, PRIMARY_ADMIN } from '@/lib/crm/session';
import { LoginForm } from '@/components/dashboard/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await dashboardUnlocked()) redirect('/dashboard');
  const params = await searchParams;
  const firstTime = !(await adminHasPassword(PRIMARY_ADMIN));

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <p className="font-brand text-sm font-extrabold uppercase tracking-[0.22em]">Cluster</p>
        <div className="mt-6 bg-paper p-6 text-ink sm:p-8">
          <h1 className="font-display text-5xl tracking-wide">Entra al panel</h1>
          <p className="mt-2 text-base text-black/65">Para el equipo y los profesores de la academia.</p>
          {firstTime ? (
            <p className="mt-5 border border-black/15 bg-white px-4 py-3 text-sm text-black/70">
              Primera entrada del administrador: usa la contraseña del servidor. Queda guardada para esa cuenta.
            </p>
          ) : null}
          <div className="mt-8">
            <LoginForm initialError={params.error || ''} />
          </div>
          {googleConfigured() ? (
            <>
              <div className="my-6 flex items-center gap-3 text-sm text-black/45">
                <span className="h-px flex-1 bg-black/10" />o<span className="h-px flex-1 bg-black/10" />
              </div>
              <Link href="/dashboard/auth/google" className="flex h-12 w-full items-center justify-center border border-black/20 bg-white text-base transition-colors duration-150 hover:border-ink">
                Entrar con Google
              </Link>
            </>
          ) : null}
          <p className="mt-6 text-sm text-black/55">Después te pedimos el código de 6 dígitos de tu app de autenticación.</p>
        </div>
        <p className="mt-6 text-sm text-white/60">
          ¿Eres alumno? <Link href="/academia/entrar" className="text-white underline underline-offset-2">Entra a la academia</Link>
        </p>
      </div>
    </main>
  );
}
