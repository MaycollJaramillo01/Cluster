import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { AcademyTheme } from '@/components/academia/AcademySurface';
import { AuthShell } from '@/components/academia/AuthShell';
import { confirmMfa } from '@/lib/crm/access';
import { mfaEnrolled, pendingSecret } from '@/lib/crm/mfa';
import { pendingLogin } from '@/lib/crm/session';
import { otpauthUrl } from '@/lib/crm/totp';

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
      <VStack gap={2}>
        <label htmlFor="code" className="text-sm font-semibold">Código de 6 dígitos</label>
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
          aria-describedby={message ? 'code-error code-help' : 'code-help'}
          className={`academy-field t-input h-16 w-full text-center font-mono text-3xl tracking-widest ${message ? 'is-shaking' : ''}`}
        />
        {message ? <p id="code-error" role="alert" className="text-sm font-medium text-red-800">{message}</p> : null}
        <small id="code-help" className="text-sm text-academy-muted">La app cambia el código cada 30 segundos.</small>
      </VStack>
      <AcademySubmit pending="Verificando…" label={enrolled ? 'Verificar y entrar' : 'Activar y entrar'} fullWidth />
    </form>
  );

  return (
    <AcademyTheme className="min-h-screen">
      <HStack as="header" gap={3} align="center" className="h-16 border-b border-academy-line bg-academy-surface px-4 sm:px-6">
        <HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy bg-academy-ink">
          <Image src="/assets/logo-white.webp" alt="" width={28} height={18} />
        </HStack>
        <p className="text-base font-bold">Academia</p>
        <p className="border-l border-academy-line pl-3 text-sm font-medium text-academy-muted">Acceso del equipo</p>
      </HStack>
      <AuthShell step={2} teacher>
        <VStack gap={2}>
          <p className="w-fit rounded-academy-full bg-academy-tint px-3 py-1 text-xs font-semibold text-academy-primary">Paso 2 de 3</p>
          <Heading level={1} className="academy-title">{enrolled ? 'Verificación en dos pasos' : 'Protege tu cuenta'}</Heading>
          <p className="text-academy-muted">{enrolled ? 'Abre tu aplicación de autenticación y escribe el código que muestra para Cluster.' : 'Activa la verificación en dos pasos con una aplicación de autenticación. Solo se hace una vez.'}</p>
        </VStack>
        {enrolled ? codeForm : (
          <ol className="space-y-8">
            <li className="space-y-4">
              <HStack gap={3} align="center">
                <strong className="grid size-7 shrink-0 place-items-center rounded-academy-full bg-academy-ink text-sm text-academy-surface">1</strong>
                <Heading level={2} className="text-base font-bold">Escanea el código QR con tu app</Heading>
              </HStack>
              <HStack justify="center" className="rounded-academy-lg border border-academy-line bg-academy-surface p-3">
                <figure
                  role="img"
                  aria-label="Código QR para agregar Cluster a tu app de autenticación"
                  className="size-56 [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              </HStack>
              <a href={link} className="academy-action academy-action-secondary w-full">Abrir en mi app de autenticación</a>
              <details className="text-sm">
                <summary className="academy-focus cursor-pointer font-semibold text-academy-muted underline underline-offset-4 hover:text-academy-ink">¿No puedes escanearlo? Escribe la clave a mano</summary>
                <VStack gap={2} className="t-sheet mt-3 rounded-academy border border-academy-line bg-academy-page px-4 py-3">
                  <p className="break-words font-mono text-base tracking-wider">{secret.match(/.{1,4}/g)?.join(' ')}</p>
                  <p className="text-xs text-academy-muted">Cuenta: Cluster · Tipo: basada en tiempo · 6 dígitos</p>
                </VStack>
              </details>
            </li>
            <li className="space-y-4">
              <HStack gap={3} align="center">
                <strong className="grid size-7 shrink-0 place-items-center rounded-academy-full bg-academy-ink text-sm text-academy-surface">2</strong>
                <Heading level={2} className="text-base font-bold">Escribe el código que muestra la app</Heading>
              </HStack>
              {codeForm}
            </li>
          </ol>
        )}
        <p className="border-t border-academy-line pt-5 text-sm">
          <Link className="font-semibold text-academy-ink underline underline-offset-4" href="/dashboard/login">Volver</Link>
        </p>
      </AuthShell>
    </AcademyTheme>
  );
}
