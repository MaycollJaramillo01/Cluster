import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover } from '@/components/academia/ui';
import { CertificateRequest } from '@/components/academia/CertificateRequest';
import { Icon } from '@/components/ui/Icon';
import { myCourses, personXp } from '@/lib/valux/data';
import { levelFor } from '@/lib/valux/mission';
import { academiaPersonId } from '@/lib/valux/session';

const filters = [
  { key: 'todos', label: 'Todos' },
  { key: 'en-curso', label: 'En curso' },
  { key: 'sin-empezar', label: 'Sin empezar' },
  { key: 'completados', label: 'Completados' },
] as const;
const library = '/academia/mis-cursos';
type Course = Awaited<ReturnType<typeof myCourses>>[number];

function category(course: Course) {
  if (!course.available) return 'no-disponible';
  if (course.lessons > 0 && !course.nextLesson) return 'completados';
  return course.started ? 'en-curso' : 'sin-empezar';
}

function CourseCard({ course }: { course: Course }) {
  const state = category(course);
  const path = `/academia/${encodeURIComponent(course.slug)}`;
  const target = course.nextLesson ? `${path}/${encodeURIComponent(course.nextLesson.slug)}` : path;
  const title = state === 'completados' ? 'Repasar curso' : state === 'en-curso' ? 'Continuar curso' : course.nextLesson ? 'Empezar curso' : 'Ver ficha';
  return (
    <Card padding={0} className="flex h-full min-w-0 flex-col overflow-hidden">
      {course.cover_url ? <Cover url={course.cover_url} title={course.title} slug={course.slug} /> : (
        <figure aria-hidden="true" className="grid aspect-video place-items-center border-b border-black/10 bg-paper-soft text-ink">
          <Icon name="play" size={44} strokeWidth={1.25} />
        </figure>
      )}
      <VStack gap={4} className="flex-1 p-5">
        <header className="space-y-1">
          <p className="text-sm text-ink/65">{course.teacher_name || 'Academia'}</p>
          <Heading level={2} className="break-words font-brand text-xl font-semibold normal-case leading-snug">{course.title}</Heading>
          {!course.enrolled && course.available ? <p className="text-sm text-ink/70">Incluido en tu membresía</p> : null}
        </header>
        {course.availability ? <p className="border-t border-black/10 pt-4 text-sm font-medium text-ink/75">{course.availability}</p> : (
          <>
            {course.lessons > 0 ? (
              <section aria-label={`Avance en ${course.title}`} className="space-y-2">
                <p className="flex justify-between gap-2 text-sm">
                  <strong className="font-medium">{state === 'completados' ? 'Curso completado' : `${course.done} de ${course.lessons} clases`}</strong>
                  <small className="text-sm text-academy-muted">{Math.round(100 * course.done / course.lessons)}%</small>
                </p>
                <progress aria-label={`Clases completadas en ${course.title}`} value={course.done} max={course.lessons} className="academy-progress w-full" />
              </section>
            ) : <p className="text-sm text-ink/70">El curso todavía no tiene clases.</p>}
            {course.nextLesson ? <p className="break-words text-sm text-ink/75">{state === 'en-curso' ? 'Siguiente clase' : 'Primera clase'} · {course.nextLesson.title}</p> : null}
            <Link href={target} prefetch={false} aria-label={`${title}: ${course.title}`} className={`academy-action mt-auto justify-between ${state === 'en-curso' ? 'academy-action-primary' : 'academy-action-secondary'}`}>
              {title}<Icon name="arrow-right" size={17} aria-hidden="true" />
            </Link>
            {state === 'completados' ? <CertificateRequest slug={course.slug} /> : null}
          </>
        )}
      </VStack>
    </Card>
  );
}

export default async function MyCoursesPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const [personId, params] = await Promise.all([academiaPersonId(), searchParams]);
  const [courses, xp] = await Promise.all([myCourses(personId), personXp(personId)]);
  const filter = filters.find((item) => item.key === params.estado)?.key || 'todos';
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : '';
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const needle = normalize(query);
  const shown = courses.filter((course) => (filter === 'todos' || category(course) === filter)
    && normalize(`${course.title} ${course.teacher_name || 'Academia'}`).includes(needle));
  const resume = filter === 'todos' && !query ? shown.find((course) => category(course) === 'en-curso') : null;

  return (
    <VStack as="main" gap={6} className="academy-page">
      <HStack as="header" align="center" justify="between" wrap="wrap" gap={3}>
        <Heading level={1} className="academy-title">Mis cursos</Heading>
        {personId ? <HStack as="section" gap={3} wrap="wrap" align="center" aria-label="Avance y constancias">
          <p className="rounded-academy bg-academy-tint px-3 py-2 text-sm font-semibold text-academy-primary">Nivel {levelFor(xp)} · {xp} XP</p>
          <Button as={Link} href="/academia/constancias" variant="secondary" label="Mis constancias" />
        </HStack> : null}
      </HStack>
      {!personId || !courses.length ? (
        <VStack as="section" gap={3} className="academy-panel items-start p-6 sm:p-8">
          <Heading level={2} className="academy-section-title">{personId ? 'Tu biblioteca está vacía' : 'Accede a tu biblioteca'}</Heading>
          <p className="text-academy-muted">{personId ? 'Explora el catálogo para empezar un curso.' : 'Entra con el correo de tu compra o matrícula.'}</p>
          <Button as={Link} href={personId ? '/academia' : '/academia/entrar'} label={personId ? 'Ver catálogo' : 'Entrar'} variant="primary" />
        </VStack>
      ) : (
        <>
          {resume?.nextLesson ? (
            <HStack as="section" gap={4} align="center" justify="between" wrap="wrap" className="academy-hero rounded-academy-lg p-5 text-white sm:p-7" aria-label="Continuar aprendizaje">
              <VStack gap={2}>
                <p className="text-sm font-semibold text-white/80">Retoma tu curso</p>
                <Heading level={2} className="text-2xl font-bold text-white">{resume.title}</Heading>
                <p className="text-sm text-white/80">{resume.nextLesson.title}</p>
              </VStack>
              <Link className="academy-action academy-action-inverse" href={`/academia/${encodeURIComponent(resume.slug)}/${encodeURIComponent(resume.nextLesson.slug)}`}>
                Continuar <Icon name="arrow-right" size={17} />
              </Link>
            </HStack>
          ) : null}
          <section className="space-y-4" aria-label="Filtrar cursos">
            <form method="get" action={library} role="search" className="flex w-full gap-2 sm:max-w-md">
              {filter !== 'todos' ? <input type="hidden" name="estado" value={filter} /> : null}
              <label htmlFor="buscar-curso" className="sr-only">Buscar en mis cursos</label>
              <input id="buscar-curso" type="search" name="q" defaultValue={query} placeholder="Buscar por curso o profesor" maxLength={120} className="academy-field min-w-0 flex-1" />
              <Button type="submit" size="lg" label="Buscar" icon={<Icon name="search" size={17} />} />
            </form>
            <nav aria-label="Estado del curso" className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => {
                const url = new URLSearchParams();
                if (key !== 'todos') url.set('estado', key);
                if (query) url.set('q', query);
                return <Link key={key} href={url.size ? `${library}?${url}` : library} aria-current={key === filter ? 'page' : undefined}
                  className="academy-filter academy-focus">{label}</Link>;
              })}
            </nav>
          </section>
          {shown.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cursos de mi biblioteca">
              {shown.map((course) => <li key={course.slug} className="min-w-0"><CourseCard course={course} /></li>)}
            </ul>
          ) : (
            <section className="space-y-3 border border-black/10 bg-white p-6">
              <Heading level={2} className="font-brand text-xl font-semibold normal-case">{query ? 'No encontramos cursos con esa búsqueda' : 'No hay cursos en este estado'}</Heading>
              <Link href={library} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Ver todos mis cursos</Link>
            </section>
          )}
        </>
      )}
    </VStack>
  );
}
