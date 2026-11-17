import Link from 'next/link';
import { redirect } from 'next/navigation';
import { confirmMfa } from '@/lib/crm/access';
import { mfaEnrolled, pendingSecret } from '@/lib/crm/mfa';
import { pendingLogin } from '@/lib/crm/session';
import { otpauthUrl } from '@/lib/crm/totp';

export const dynamic = 'force-dynamic';

const errors: Record<string, string> = {
  codigo: 'El código no coincide o ya se usó. Espera el siguiente.',
  bloqueado: 'Demasiados códigos incorrectos. Espera 15 minutos.',
};

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const pending = await pendingLogin();
  if (!pending) redirect('/dashboard/login?error=vencido');
  const { error } = await searchParams;
  const enrolled = await mfaEnrolled(pending.email);
  const secret = enrolled ? '' : await pendingSecret(pending.email);

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <div className="w-full max-w-sm space-y-4 bg-paper p-8 text-ink">
        <p className="font-brand text-xs font-extrabold uppercase tracking-[0.22em]">Cluster</p>
        <h1 className="font-display text-5xl tracking-wide">Segundo paso</h1>
        {secret ? (
          <div className="space-y-3 text-sm text-black/70">
            <p>Primera vez: agrega esta cuenta en tu app de códigos (Google Authenticator, 1Password, Authy) con esta clave:</p>
            <p className="break-all border border-black/15 bg-white px-3 py-2 font-mono text-sm tracking-[0.12em] text-ink">
              {secret.match(/.{1,4}/g)?.join(' ')}
            </p>
            <p>
              En el celular también puedes <a className="underline" href={otpauthUrl(secret, pending.email)}>abrirla directo en la app</a>. Después escribe el código de 6 dígitos.
            </p>
          </div>
        ) : (
          <p className="text-sm text-black/60">Escribe el código de 6 dígitos de tu app de códigos.</p>
        )}
        <form action={confirmMfa} className="space-y-3">
          <input
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            autoFocus
            placeholder="000000"
            className="w-full border border-black/15 px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-brand"
          />
          {error ? <p className="text-sm">{errors[error] || 'No se pudo verificar.'}</p> : null}
          <button className="w-full bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Verificar</button>
        </form>
        <p className="text-xs text-black/50">
          ¿Perdiste el celular? Un superadmin puede reiniciar tu segundo factor desde Equipo. <Link className="underline" href="/dashboard/login">Volver</Link>
        </p>
      </div>
    </main>
  );
}
