import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
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
const stateLabel: Record<string, string> = { 'en-curso': 'En curso', 'sin-empezar': 'Sin empezar', completados: 'Completado', 'no-disponible': 'No disponible' };
const library = '/academia/mis-cursos';
type Course = Awaited<ReturnType<typeof myCourses>>[number];

function category(course: Course) {
  if (!course.available) return 'no-disponible';
  if (course.lessons > 0 && !course.nextLesson) return 'completados';
  return course.started ? 'en-curso' : 'sin-empezar';
}

function lessonPath(course: Course) {
  const path = `/academia/${encodeURIComponent(course.slug)}`;
  return course.nextLesson ? `${path}/${encodeURIComponent(course.nextLesson.slug)}` : path;
}

function CourseRow({ course }: { course: Course }) {
  const state = category(course);
  const title = state === 'completados' ? 'Repasar curso' : state === 'en-curso' ? 'Continuar curso' : course.nextLesson ? 'Empezar curso' : 'Ver ficha';
  const percent = course.lessons ? Math.round(100 * course.done / course.lessons) : 0;
  return (
    <article className="academy-panel grid min-w-0 gap-4 p-4 sm:grid-cols-[theme(spacing.40)_1fr] sm:p-5 lg:grid-cols-[theme(spacing.44)_1fr_auto] lg:items-center">
      <Link href={`/academia/${encodeURIComponent(course.slug)}`} tabIndex={-1} aria-hidden="true" className="hidden overflow-hidden rounded-academy sm:block">
        <Cover url={course.cover_url} title={course.title} slug={course.slug} />
      </Link>
      <VStack gap={3} className="min-w-0">
        <VStack gap={1}>
          <small className={`w-fit text-xs font-semibold ${state === 'completados' || state === 'en-curso' ? 'text-academy-primary' : 'text-academy-muted'}`}>{stateLabel[state]}</small>
          <Heading level={2} className="break-words text-lg font-bold leading-snug">{course.title}</Heading>
          <p className="text-sm text-academy-muted">
            {course.teacher_name || 'Academia'}
            {!course.enrolled && course.available ? ' · Incluido en tu membresía' : ''}
          </p>
        </VStack>
        {course.availability ? <p className="text-sm font-medium text-academy-muted">{course.availability}</p> : course.lessons > 0 ? (
          <VStack as="section" gap={1.5} aria-label={`Avance en ${course.title}`}>
            <HStack justify="between" gap={2} className="text-sm">
              <Text className="font-medium">{state === 'completados' ? 'Curso completado' : `${course.done} de ${course.lessons} clases`}</Text>
              <Text className="tabular-nums text-academy-muted">{percent}%</Text>
            </HStack>
            <progress aria-label={`Clases completadas en ${course.title}`} value={course.done} max={course.lessons} className="academy-progress w-full" />
          </VStack>
        ) : <p className="text-sm text-academy-muted">El curso todavía no tiene clases.</p>}
        {course.nextLesson && !course.availability ? <p className="break-words text-sm text-academy-muted">{state === 'en-curso' ? 'Siguiente clase' : 'Primera clase'}: <strong className="font-medium text-academy-ink">{course.nextLesson.title}</strong></p> : null}
      </VStack>
      {course.availability ? null : (
        <VStack gap={2} className="sm:col-start-2 lg:col-start-auto lg:w-48">
          <Link href={lessonPath(course)} prefetch={false} aria-label={`${title}: ${course.title}`} className={`academy-action justify-between ${state === 'en-curso' ? 'academy-action-primary' : 'academy-action-secondary'}`}>
            {title}<Icon name="arrow-right" size={17} aria-hidden="true" />
          </Link>
          {state === 'completados' ? <CertificateRequest slug={course.slug} /> : null}
        </VStack>
      )}
    </article>
  );
}

function Progress({ xp, counts }: { xp: number; counts: Record<string, number> }) {
  const level = levelFor(xp);
  const inLevel = xp - (level - 1) * 100;
  return (
    <VStack as="aside" gap={5} aria-labelledby="tu-avance" className="academy-panel p-5 lg:sticky lg:top-24">
      <Heading id="tu-avance" level={2} className="text-lg font-bold">Tu avance</Heading>
      <VStack as="section" gap={2} aria-label="Nivel" className="rounded-academy bg-academy-tint p-4">
        <HStack justify="between" className="text-sm font-semibold">
          <Text>Nivel {level}</Text>
          <Text className="tabular-nums text-academy-primary">{xp} XP</Text>
        </HStack>
        <progress aria-label={`XP dentro del nivel ${level}`} value={inLevel} max={100} className="academy-progress w-full" />
        <small className="text-xs text-academy-muted">{100 - inLevel} XP para el nivel {level + 1}. Ganas XP al completar clases y retos.</small>
      </VStack>
      <dl className="divide-y divide-academy-line text-sm">
        {(['en-curso', 'sin-empezar', 'completados'] as const).map((key) => (
          <HStack key={key} justify="between" className="py-2.5">
            <dt className="text-academy-muted">{stateLabel[key] === 'Completado' ? 'Completados' : stateLabel[key]}</dt>
            <dd className="font-semibold tabular-nums">{counts[key] || 0}</dd>
          </HStack>
        ))}
      </dl>
      <VStack as="nav" aria-label="Documentos" gap={1} className="border-t border-academy-line pt-3">
        {[['/academia/constancias', 'Mis constancias'], ['/academia/recibos', 'Mis recibos'], ['/academia/retos', 'Retos']].map(([href, label]) => (
          <Link key={href} href={href} className="academy-nav academy-focus justify-between px-2">{label}<Icon name="arrow-right" size={15} aria-hidden="true" /></Link>
        ))}
      </VStack>
    </VStack>
  );
}

export default async function MyCoursesPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const [personId, params] = await Promise.all([academiaPersonId(), searchParams]);
  const [courses, xp] = await Promise.all([myCourses(personId), personXp(personId)]);
  const filter = filters.find((item) => item.key === params.estado)?.key || 'todos';
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : '';
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const needle = normalize(query);
  const counts: Record<string, number> = { todos: courses.length };
  for (const course of courses) counts[category(course)] = (counts[category(course)] || 0) + 1;
  const shown = courses.filter((course) => (filter === 'todos' || category(course) === filter)
    && normalize(`${course.title} ${course.teacher_name || 'Academia'}`).includes(needle));
  const resume = filter === 'todos' && !query ? courses.find((course) => category(course) === 'en-curso') : null;

  return (
    <VStack as="main" gap={6} className="academy-page">
      <HStack as="header" align="end" justify="between" wrap="wrap" gap={3}>
        <VStack gap={2}>
          <Heading level={1} className="academy-title">Mis cursos</Heading>
          {personId && courses.length ? <p className="text-academy-muted">Retoma tus clases y consulta tu avance.</p> : null}
        </VStack>
        {personId ? <p className="rounded-academy bg-academy-tint px-3 py-2 text-sm font-semibold text-academy-primary">Nivel {levelFor(xp)} · {xp} XP</p> : null}
      </HStack>
      {!personId || !courses.length ? (
        <VStack as="section" gap={3} className="academy-panel items-start p-6 sm:p-10">
          <Heading level={2} className="academy-section-title">{personId ? 'Tu biblioteca está vacía' : 'Accede a tu biblioteca'}</Heading>
          <p className="max-w-prose text-academy-muted">{personId ? 'Cuando te inscribas en un curso aparecerá aquí, con tu avance clase por clase.' : 'Entra con el correo de tu compra o matrícula.'}</p>
          <Button as={Link} href={personId ? '/academia?vista=catalogo#catalogo' : '/academia/entrar'} label={personId ? 'Ver catálogo' : 'Entrar'} variant="primary" />
        </VStack>
      ) : (
        <>
          {resume?.nextLesson ? (
            <HStack as="section" gap={6} align="center" justify="between" wrap="wrap" className="academy-hero rounded-academy-xl p-6 text-white sm:p-8" aria-labelledby="retoma-titulo">
              <VStack gap={3} className="min-w-0 max-w-2xl flex-1">
                <p className="text-sm font-semibold text-academy-action">Retoma tu curso</p>
                <Heading id="retoma-titulo" level={2} className="break-words text-2xl font-bold text-white sm:text-3xl">{resume.title}</Heading>
                <p className="text-sm text-white/75">Siguiente clase: <strong className="font-semibold text-white">{resume.nextLesson.title}</strong></p>
                <VStack gap={1.5} className="max-w-md">
                  <progress aria-label={`Avance en ${resume.title}`} value={resume.done} max={resume.lessons} className="academy-progress w-full" />
                  <small className="text-xs text-white/70">{resume.done} de {resume.lessons} clases</small>
                </VStack>
              </VStack>
              <Link className="academy-action academy-action-primary" href={lessonPath(resume)}>
                Continuar <Icon name="arrow-right" size={17} aria-hidden="true" />
              </Link>
            </HStack>
          ) : null}
          <section className="grid items-start gap-6 lg:grid-cols-[1fr_theme(spacing.80)]">
            <VStack gap={4} className="min-w-0">
              <HStack as="section" aria-label="Filtrar cursos" gap={3} wrap="wrap" justify="between" align="center">
                <form method="get" action={library} role="search" className="flex w-full gap-2 sm:max-w-sm">
                  {filter !== 'todos' ? <input type="hidden" name="estado" value={filter} /> : null}
                  <label htmlFor="buscar-curso" className="sr-only">Buscar en mis cursos</label>
                  <input id="buscar-curso" type="search" name="q" defaultValue={query} placeholder="Buscar por curso o profesor" maxLength={120} className="academy-field min-w-0 flex-1" />
                  <Button type="submit" size="lg" label="Buscar" icon={<Icon name="search" size={17} />} />
                </form>
                <nav aria-label="Estado del curso" className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {filters.map(({ key, label }) => {
                    const url = new URLSearchParams();
                    if (key !== 'todos') url.set('estado', key);
                    if (query) url.set('q', query);
                    return <Link key={key} href={url.size ? `${library}?${url}` : library} aria-current={key === filter ? 'page' : undefined}
                      className="academy-filter academy-focus shrink-0 gap-2">{label}<small className="text-xs tabular-nums text-academy-muted">{counts[key] || 0}</small></Link>;
                  })}
                </nav>
              </HStack>
              {shown.length ? (
                <ul className="space-y-3" aria-label="Cursos de mi biblioteca">
                  {shown.map((course) => <li key={course.slug} className="min-w-0"><CourseRow course={course} /></li>)}
                </ul>
              ) : (
                <VStack as="section" gap={3} className="academy-panel items-start p-6">
                  <Heading level={2} className="text-xl font-bold">{query ? 'No encontramos cursos con esa búsqueda' : 'No hay cursos en este estado'}</Heading>
                  <p className="text-sm text-academy-muted">{query ? 'Revisa el nombre del curso o del profesor.' : 'Prueba con otro filtro.'}</p>
                  <Link href={library} className="academy-action academy-action-secondary">Ver todos mis cursos</Link>
                </VStack>
              )}
            </VStack>
            <Progress xp={xp} counts={counts} />
          </section>
        </>
      )}
    </VStack>
  );
}
