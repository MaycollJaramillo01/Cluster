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
import { publishedCourse } from '@/lib/valux/data';
import { courseLoginQuery, loginCourse } from '@/lib/valux/login-course';

const input = 'h-12 w-full border border-black/20 bg-white px-3 text-base outline-none transition-colors duration-150 placeholder:text-black/35 focus:border-ink focus:ring-1 focus:ring-ink';
const label = 'mb-1.5 block text-sm font-medium';
export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string; modo?: string; acceso?: string; curso?: string }> }) {
  const query = await searchParams;
  const teacher = query.acceso === 'maestros';
  if (teacher) {
    const session = await dashboardSession();
    if (session) redirect(homeFor(session.role));
  }
  const register = query.modo === 'registro';
  const slug = loginCourse(query.curso);
  const course = !teacher && slug ? await publishedCourse(slug) : null;
  const context = courseLoginQuery(course?.slug);
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
    <AcademySurface className="mx-auto w-full max-w-lg px-4 py-6 md:py-12">
    <section className="w-full">
      <VStack gap={0} className="min-w-0 border border-black/10 bg-white p-5 sm:p-8">
      <Heading level={1} className="mb-3 text-balance font-display text-4xl">{teacher ? 'Acceso para maestros' : register ? 'Crea tu cuenta' : 'Entra a la academia'}</Heading>
      {course ? <p className="mb-4 text-sm text-black/70">Para continuar con <Link href={`/academia/${course.slug}`} className="font-semibold text-ink underline underline-offset-4">{course.title}</Link>.</p> : <AccessTabs teacher={teacher} />}
      {teacher ? (
        <VStack gap={5} className="pt-5">
          <LoginForm initialError={query.error || ''} />
          {googleConfigured() ? <Link href="/dashboard/auth/google" className="flex h-12 items-center justify-center border border-black/20 text-sm hover:border-ink">Entrar con Google</Link> : null}
        </VStack>
      ) : <>
      {error ? (
        <p role="alert" className="mt-6 border border-[#b42318]/30 bg-[#fef3f2] px-4 py-3 text-sm text-[#7a271a]">{error}</p>
      ) : null}

      <form action={enterAcademia} className="mt-5 space-y-4">
        <input type="hidden" name="modo" value={register ? 'registro' : 'entrar'} />
        <input type="hidden" name="curso" value={course?.slug || ''} />
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
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="tu@correo.com" className={input} />
        </VStack>
        {register ? (
          <details>
            <summary className="cursor-pointer py-2 text-sm text-black/70">Preferencias de avisos (opcional)</summary>
            <fieldset aria-label="Preferencias de avisos" className="space-y-3 pb-2">
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_whatsapp" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir mensajes de la academia por WhatsApp.
            </label>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_email" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]" />
              Acepto recibir novedades y ofertas por correo.
            </label>
            </fieldset>
          </details>
        ) : null}
        <SubmitButton pending="Enviando…">{register ? 'Crear cuenta' : 'Enviarme un código'}</SubmitButton>
      </form>
      <p className="mt-4 text-sm text-black/70">
        {register ? '¿Ya tienes cuenta? ' : '¿Es tu primera vez? '}
        <Link href={`/academia/entrar?modo=${register ? 'entrar' : 'registro'}${context}`} className="font-semibold text-ink underline underline-offset-4">{register ? 'Entrar' : 'Crear cuenta'}</Link>
      </p>
      </>}
      </VStack>
    </section>
    </AcademySurface>
  );
}
