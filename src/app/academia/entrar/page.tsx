import Link from 'next/link';
import { enterAcademia } from '@/lib/valux/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { LoginForm } from '@/components/dashboard/LoginForm';
import { AcademySurface } from '@/components/academia/AcademySurface';
import { AccessTabs } from '@/components/academia/AccessTabs';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { dashboardSession, googleConfigured } from '@/lib/crm/session';
import { homeFor } from '@/lib/crm/roles';
import { redirect } from 'next/navigation';

const input = 'h-12 w-full border border-black/20 bg-white px-3 text-base outline-none transition-colors duration-150 placeholder:text-black/35 focus:border-ink focus:ring-1 focus:ring-ink';
const label = 'mb-1.5 block text-sm font-medium';
const tab = 'flex h-10 items-center justify-center text-sm transition-colors duration-150';

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string; modo?: string; acceso?: string }> }) {
  const query = await searchParams;
  const teacher = query.acceso === 'maestros';
  if (teacher) {
    const session = await dashboardSession();
    if (session) redirect(homeFor(session.role));
  }
  const register = query.modo === 'registro';
  const error = query.error === 'enlace'
    ? 'Ese enlace ya se usó o venció. Pide un código nuevo.'
    : query.error === 'datos'
      ? register
        ? 'Revisa tu nombre, el WhatsApp con código de país y el correo.'
        : 'Revisa el correo: parece incompleto.'
      : query.error === 'correo'
        ? 'No pudimos enviar el código. Intenta de nuevo en unos minutos.'
        : '';

  return (
    <AcademySurface className="mx-auto w-full max-w-lg px-4 py-10 md:py-16">
    <section className="w-full">
      <VStack gap={0} className="min-w-0 border border-black/10 bg-white p-5 sm:p-8">
      <Heading level={1} className="mb-6 font-display text-4xl">Entra a la academia</Heading>
      <AccessTabs teacher={teacher} />
      {teacher ? (
        <VStack gap={5} className="pt-8">
          <Heading level={2} className="font-display text-4xl tracking-wide">Acceso para maestros</Heading>
          <LoginForm initialError={query.error || ''} />
          {googleConfigured() ? <Link href="/dashboard/auth/google" className="flex h-12 items-center justify-center border border-black/20 text-sm hover:border-ink">Entrar con Google</Link> : null}
        </VStack>
      ) : <>
      <nav aria-label="Entrar o crear cuenta" className="mt-6 grid grid-cols-2 border border-black/15 bg-white p-1">
        <Link href="/academia/entrar" aria-current={register ? undefined : 'page'} className={`${tab} ${register ? 'text-black/60 hover:text-ink' : 'bg-ink font-medium text-white'}`}>
          Entrar
        </Link>
        <Link href="/academia/entrar?modo=registro" aria-current={register ? 'page' : undefined} className={`${tab} ${register ? 'bg-ink font-medium text-white' : 'text-black/60 hover:text-ink'}`}>
          Crear cuenta
        </Link>
      </nav>

      <Heading level={2} className="mt-8 font-display text-4xl tracking-wide">{register ? 'Crea tu cuenta' : 'Acceso para estudiantes'}</Heading>

      {error ? (
        <p role="alert" className="mt-6 border border-[#b42318]/30 bg-[#fef3f2] px-4 py-3 text-sm text-[#7a271a]">{error}</p>
      ) : null}

      <form action={enterAcademia} className="mt-8 space-y-5">
        <input type="hidden" name="modo" value={register ? 'registro' : 'entrar'} />
        {register ? (
          <>
            <VStack gap={0}>
              <label htmlFor="name" className={label}>Nombre</label>
              <input id="name" name="name" required autoComplete="name" className={input} />
            </VStack>
            <VStack gap={0}>
              <label htmlFor="phone" className={label}>WhatsApp</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+504 9999 9999" className={input} />
            </VStack>
          </>
        ) : null}
        <VStack gap={0}>
          <label htmlFor="email" className={label}>Correo</label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" autoFocus={!register} placeholder="tu@correo.com" className={input} />
        </VStack>
        {register ? (
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm text-black/55">Avisos (opcional)</legend>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_whatsapp" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir mensajes de la academia por WhatsApp.
            </label>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_email" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir novedades y ofertas por correo.
            </label>
          </fieldset>
        ) : null}
        <SubmitButton pending="Enviando…">{register ? 'Crear cuenta' : 'Continuar'}</SubmitButton>
      </form>

      </>}
      </VStack>
    </section>
    </AcademySurface>
  );
}
