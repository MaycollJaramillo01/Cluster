import Link from 'next/link';
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
const action = 'inline-flex min-h-11 items-center justify-center gap-2 border border-ink px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
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
    <article className="flex h-full min-w-0 flex-col overflow-hidden border border-black/15 bg-white">
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
                  <span className="text-ink/70">{Math.round(100 * course.done / course.lessons)}%</span>
                </p>
                <progress aria-label={`Clases completadas en ${course.title}`} value={course.done} max={course.lessons} className="block h-2 w-full overflow-hidden rounded-full bg-paper-dim accent-brand [&::-webkit-progress-bar]:bg-paper-dim [&::-webkit-progress-value]:bg-brand" />
              </section>
            ) : <p className="text-sm text-ink/70">El curso todavía no tiene clases.</p>}
            {course.nextLesson ? <p className="break-words text-sm text-ink/75">{state === 'en-curso' ? 'Siguiente clase' : 'Primera clase'} · {course.nextLesson.title}</p> : null}
            <Link href={target} prefetch={false} aria-label={`${title}: ${course.title}`} className={`${action} mt-auto justify-between ${state === 'en-curso' ? 'bg-brand' : 'hover:bg-paper'}`}>
              {title}<Icon name="arrow-right" size={17} aria-hidden="true" />
            </Link>
            {state === 'completados' ? <CertificateRequest slug={course.slug} /> : null}
          </>
        )}
      </VStack>
    </article>
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

  return (
    <main className="mx-auto w-full max-w-6xl space-y-7 px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-black/15 pb-6">
        <Heading level={1} className="font-display text-5xl tracking-wide sm:text-6xl">Mis cursos</Heading>
        {personId ? <section className="flex flex-wrap items-center gap-4" aria-label="Avance y constancias">
          <p className="text-sm text-ink/75">Nivel {levelFor(xp)} · {xp} XP</p>
          <Link href="/academia/constancias" className={`${action} bg-white hover:bg-paper`}>Mis constancias</Link>
        </section> : null}
      </header>
      {!personId || !courses.length ? (
        <section className="space-y-4 border border-black/10 bg-white p-6 sm:p-8">
          <Heading level={2} className="font-brand text-xl font-semibold normal-case">{personId ? 'Tu biblioteca está vacía' : 'Accede a tu biblioteca'}</Heading>
          <p className="text-sm text-ink/75">{personId ? 'Explora el catálogo para empezar un curso.' : 'Entra con el correo de tu compra o matrícula.'}</p>
          <Link className={`${action} bg-ink text-white`} href={personId ? '/academia' : '/academia/entrar'}>{personId ? 'Ver catálogo' : 'Entrar'}</Link>
        </section>
      ) : (
        <>
          <section className="space-y-4" aria-label="Filtrar cursos">
            <form method="get" action={library} role="search" className="flex w-full gap-2 sm:max-w-md">
              {filter !== 'todos' ? <input type="hidden" name="estado" value={filter} /> : null}
              <label htmlFor="buscar-curso" className="sr-only">Buscar en mis cursos</label>
              <input id="buscar-curso" type="search" name="q" defaultValue={query} placeholder="Buscar por curso o profesor" maxLength={120} className="min-h-11 min-w-0 flex-1 border border-black/25 bg-white px-3 text-base focus-visible:outline focus-visible:outline-2" />
              <button type="submit" className={`${action} bg-white`}><Icon name="search" size={17} aria-hidden="true" />Buscar</button>
            </form>
            <nav aria-label="Estado del curso" className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => {
                const url = new URLSearchParams();
                if (key !== 'todos') url.set('estado', key);
                if (query) url.set('q', query);
                return <Link key={key} href={url.size ? `${library}?${url}` : library} aria-current={key === filter ? 'page' : undefined}
                  className={`${action} ${key === filter ? 'border-ink bg-ink text-white' : 'border-black/15 bg-white hover:border-ink'}`}>{label}</Link>;
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
    </main>
  );
}
