import Link from 'next/link';
import Image from 'next/image';
import { enterAcademia } from '@/lib/valux/actions';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { LoginForm } from '@/components/dashboard/LoginForm';
import { AccessTabs } from '@/components/academia/AccessTabs';
import { Cover } from '@/components/academia/ui';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { dashboardSession, googleConfigured } from '@/lib/crm/session';
import { homeFor } from '@/lib/crm/roles';
import { redirect } from 'next/navigation';
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

  return (
    <main className="academy-page max-w-5xl">
    <section className="academy-panel grid overflow-hidden lg:grid-cols-2">
      <aside className="academy-hero relative hidden flex-col justify-end overflow-hidden text-white lg:flex" aria-label={course ? 'Curso seleccionado' : 'Academia Cluster'}>
        {course ? <Cover url={course.cover_url} title={course.title} slug={course.slug} /> : (
          <figure className="relative min-h-64 flex-1">
            <Image src="/assets/stock/workspace.jpg" alt="" fill sizes="480px" className="object-cover" />
          </figure>
        )}
        <VStack gap={2} className="p-8">
          <Heading level={2} className="text-3xl font-bold text-white">{course?.title || (teacher ? 'Panel docente' : 'Tu espacio de aprendizaje')}</Heading>
          <p className="text-sm leading-relaxed text-white/80">{course ? 'Entra o crea una cuenta para seguir con el curso.' : teacher ? 'Accede al editor, a tus alumnos y al avance de tus cursos.' : 'Retoma tus cursos y guarda tu avance con tu correo.'}</p>
        </VStack>
      </aside>
      <VStack gap={0} className="min-w-0 p-5 sm:p-8 lg:p-10">
      <Heading level={1} className="academy-title mb-4">{teacher ? 'Acceso para maestros' : register ? 'Crea tu cuenta' : 'Entra a la academia'}</Heading>
      {course ? <p className="mb-4 text-sm text-black/70">Para continuar con <Link href={`/academia/${course.slug}`} className="font-semibold text-ink underline underline-offset-4">{course.title}</Link>.</p> : <AccessTabs teacher={teacher} />}
      {teacher ? (
        <VStack gap={5} className="pt-5">
          <LoginForm initialError={query.error || ''} />
          {googleConfigured() ? <Link href="/dashboard/auth/google" className="flex h-12 items-center justify-center border border-black/20 text-sm hover:border-ink">Entrar con Google</Link> : null}
        </VStack>
      ) : <>
      {error ? (
        <p role="alert" className="mt-6 rounded-academy border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
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
              <input name="consent_whatsapp" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0" />
              Acepto recibir mensajes de la academia por WhatsApp.
            </label>
            <label className="flex items-start gap-3 text-sm text-black/75">
              <input name="consent_email" type="checkbox" value="1" className="mt-0.5 h-4 w-4 shrink-0" />
              Acepto recibir novedades y ofertas por correo.
            </label>
            </fieldset>
          </details>
        ) : null}
        <AcademySubmit pending="Enviando…" label={register ? 'Crear cuenta' : 'Enviarme un código'} fullWidth />
      </form>
      <p className="mt-4 text-sm text-black/70">
        {register ? '¿Ya tienes cuenta? ' : '¿Es tu primera vez? '}
        <Link href={`/academia/entrar?modo=${register ? 'entrar' : 'registro'}${context}`} className="font-semibold text-ink underline underline-offset-4">{register ? 'Entrar' : 'Crear cuenta'}</Link>
      </p>
      </>}
      </VStack>
    </section>
    </main>
  );
}
