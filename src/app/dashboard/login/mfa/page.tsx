import Link from 'next/link';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { confirmMfa } from '@/lib/crm/access';
import { mfaEnrolled, pendingSecret } from '@/lib/crm/mfa';
import { pendingLogin } from '@/lib/crm/session';
import { otpauthUrl } from '@/lib/crm/totp';
import { SubmitButton } from '@/components/ui/SubmitButton';

export const dynamic = 'force-dynamic';

const errors: Record<string, string> = {
  codigo: 'El código no coincide o ya se usó. Espera el siguiente de tu app y vuelve a escribirlo.',
  bloqueado: 'Demasiados códigos incorrectos. Espera 15 minutos antes de intentar de nuevo.',
};

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const pending = await pendingLogin();
  if (!pending) redirect('/dashboard/login?error=vencido');
  const { error } = await searchParams;
  const enrolled = await mfaEnrolled(pending.email);
  const secret = enrolled ? '' : await pendingSecret(pending.email);
  const link = secret ? otpauthUrl(secret, pending.email) : '';
  // El QR se arma aquí, en el servidor: la clave nunca pasa por un servicio externo.
  const qr = link
    ? await QRCode.toString(link, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, color: { dark: '#111111', light: '#ffffff' } })
    : '';
  const message = error ? errors[error] || 'No se pudo verificar el código.' : '';

  const codeForm = (
    <form action={confirmMfa} className="space-y-5">
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">Código de 6 dígitos</label>
        <input
          id="code"
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          autoFocus={enrolled}
          aria-invalid={Boolean(message) || undefined}
          aria-describedby={message ? 'code-error' : undefined}
          className={`t-input h-16 w-full border bg-white text-center font-mono text-3xl tracking-[0.45em] outline-none transition-colors duration-150 focus:ring-1 ${message ? 'is-shaking border-[#b42318] focus:border-[#b42318] focus:ring-[#b42318]' : 'border-black/20 focus:border-ink focus:ring-ink'}`}
        />
        {message ? <p id="code-error" role="alert" className="mt-2 text-sm text-[#b42318]">{message}</p> : null}
      </div>
      <SubmitButton pending="Verificando…">{enrolled ? 'Verificar' : 'Activar y entrar'}</SubmitButton>
    </form>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <p className="font-brand text-sm font-extrabold uppercase tracking-[0.22em]">Cluster</p>
        <div className="mt-6 bg-paper p-6 text-ink sm:p-8">
          <h1 className="font-display text-5xl tracking-wide">{enrolled ? 'Segundo paso' : 'Protege tu cuenta'}</h1>
          {enrolled ? (
            <div className="mt-8">{codeForm}</div>
          ) : (
            <>
              <ol className="mt-8 space-y-8">
                <li>
                  <p className="text-sm font-medium">1. Escanea el código QR con tu app de autenticación</p>
                  <div className="mt-4 flex justify-center border border-black/10 bg-white p-3">
                    <div
                      role="img"
                      aria-label="Código QR para agregar Cluster a tu app de autenticación"
                      className="h-56 w-56 [&>svg]:h-full [&>svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: qr }}
                    />
                  </div>
                  <a
                    href={link}
                    className="mt-3 flex min-h-12 w-full items-center justify-center border border-black/20 bg-white px-4 py-2 text-center text-base transition-colors duration-150 hover:border-ink"
                  >
                    Abrir en mi app de autenticación
                  </a>
                  <details className="group mt-3 text-sm">
                    <summary className="cursor-pointer list-none text-black/60 underline underline-offset-2 hover:text-ink [&::-webkit-details-marker]:hidden">
                      ¿No puedes escanearlo? Escribe la clave a mano
                    </summary>
                    <div className="t-sheet mt-3 border border-black/10 bg-white px-4 py-3">
                      <p className="break-words font-mono text-base tracking-[0.12em]">{secret.match(/.{1,4}/g)?.join(' ')}</p>
                      <p className="mt-2 text-xs text-black/55">Cuenta: Cluster · Tipo: basada en tiempo · 6 dígitos</p>
                    </div>
                  </details>
                </li>
                <li>
                  <p className="mb-4 text-sm font-medium">2. Escribe el código que muestra la app</p>
                  {codeForm}
                </li>
              </ol>
            </>
          )}
          <p className="mt-8 text-sm">
            <Link className="font-medium text-ink underline underline-offset-2" href="/dashboard/login">Volver</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
