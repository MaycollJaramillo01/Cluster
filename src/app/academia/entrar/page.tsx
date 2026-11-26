import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { enterAcademia } from '@/lib/valux/actions';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { AccessTabs } from '@/components/academia/AccessTabs';
import { AuthError, AuthShell } from '@/components/academia/AuthShell';
import { LoginForm } from '@/components/dashboard/LoginForm';
import { Icon } from '@/components/ui/Icon';
import { dashboardSession, googleConfigured } from '@/lib/crm/session';
import { homeFor } from '@/lib/crm/roles';
import { publishedCourse } from '@/lib/valux/data';
import { courseLoginQuery, loginCourse } from '@/lib/valux/login-course';

const input = 'academy-field w-full';
const label = 'mb-2 block text-sm font-semibold';

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
  const modeLink = (mode: 'entrar' | 'registro') => `/academia/entrar?modo=${mode}${context}`;

  return (
    <AuthShell step={1} course={course} teacher={teacher}>
      {course ? null : <AccessTabs teacher={teacher} />}
      {teacher ? (
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading level={1} className="academy-title">Acceso para maestros</Heading>
            <p className="text-academy-muted">Accede al editor, a tus alumnos y al avance de tus cursos.</p>
          </VStack>
          <LoginForm initialError={query.error || ''} />
          {googleConfigured() ? <Link href="/dashboard/auth/google" className="academy-action academy-action-secondary justify-center">Entrar con Google</Link> : null}
        </VStack>
      ) : (
        <VStack gap={6}>
          <nav aria-label="Tengo cuenta o soy nuevo" className="flex w-fit gap-1 rounded-academy border border-academy-line bg-academy-page p-1">
            <Link href={modeLink('entrar')} aria-current={register ? undefined : 'page'} className="academy-focus inline-flex min-h-10 items-center rounded-academy px-4 text-sm font-semibold text-academy-muted aria-[current=page]:bg-academy-surface aria-[current=page]:text-academy-ink aria-[current=page]:shadow-sm">Entrar</Link>
            <Link href={modeLink('registro')} aria-current={register ? 'page' : undefined} className="academy-focus inline-flex min-h-10 items-center rounded-academy px-4 text-sm font-semibold text-academy-muted aria-[current=page]:bg-academy-surface aria-[current=page]:text-academy-ink aria-[current=page]:shadow-sm">Crear cuenta</Link>
          </nav>
          <VStack gap={2}>
            <Heading level={1} className="academy-title">{register ? 'Crea tu cuenta' : 'Entra a la academia'}</Heading>
            <p className="text-academy-muted">
              {course
                ? <>Para continuar con <Link href={`/academia/${course.slug}`} className="font-semibold text-academy-ink underline underline-offset-4">{course.title}</Link>.</>
                : register ? 'Con tu cuenta guardas el avance de tus cursos y tus constancias.' : 'Escribe tu correo y te enviamos un código de acceso de 6 dígitos.'}
            </p>
          </VStack>
          {error ? <AuthError>{error}</AuthError> : null}
          <form action={enterAcademia} className="space-y-5">
            <input type="hidden" name="modo" value={register ? 'registro' : 'entrar'} />
            <input type="hidden" name="curso" value={course?.slug || ''} />
            {register ? (
              <section className="grid gap-5 sm:grid-cols-2">
                <VStack gap={0}>
                  <label htmlFor="name" className={label}>Nombre</label>
                  <input id="name" name="name" required autoComplete="name" className={input} />
                </VStack>
                <VStack gap={0}>
                  <label htmlFor="phone" className={label}>WhatsApp</label>
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+504 9999 9999" aria-describedby="phone-hint" className={input} />
                  <small id="phone-hint" className="mt-1.5 text-xs text-academy-muted">Con código de país.</small>
                </VStack>
              </section>
            ) : null}
            <VStack gap={0}>
              <label htmlFor="email" className={label}>Correo</label>
              <HStack as="span" align="center" className="relative">
                <Icon name="mail" size={18} aria-hidden="true" className="pointer-events-none absolute left-3 text-academy-muted" />
                <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="tu@correo.com" className={`${input} pl-10`} />
              </HStack>
            </VStack>
            {register ? (
              <details className="rounded-academy border border-academy-line px-4">
                <summary className="academy-focus flex min-h-11 cursor-pointer items-center text-sm font-semibold text-academy-ink">Preferencias de avisos (opcional)</summary>
                <fieldset aria-label="Preferencias de avisos" className="space-y-3 pb-4">
                  <label className="flex items-start gap-3 text-sm text-academy-muted">
                    <input name="consent_whatsapp" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0" />
                    Acepto recibir mensajes de la academia por WhatsApp.
                  </label>
                  <label className="flex items-start gap-3 text-sm text-academy-muted">
                    <input name="consent_email" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0" />
                    Acepto recibir novedades y ofertas por correo.
                  </label>
                </fieldset>
              </details>
            ) : null}
            <AcademySubmit pending="Enviando…" label={register ? 'Crear cuenta' : 'Enviarme un código'} fullWidth />
          </form>
          <p className="border-t border-academy-line pt-5 text-sm text-academy-muted">
            {register ? '¿Ya tienes cuenta? ' : '¿Es tu primera vez? '}
            <Link href={modeLink(register ? 'entrar' : 'registro')} className="font-semibold text-academy-ink underline underline-offset-4">{register ? 'Entrar' : 'Crear cuenta'}</Link>
          </p>
        </VStack>
      )}
    </AuthShell>
  );
}
