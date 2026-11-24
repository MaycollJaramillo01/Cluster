import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import type { courseTopics } from '@/lib/valux/catalog';
import type { publishedCourses } from '@/lib/valux/data';
import { CourseTile } from './CourseTile';
import { Cover, durationLabel } from './ui';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];
type Topic = (typeof courseTopics)[number] & { count: number };
type Rating = { average: number; count: number };

export const academyCatalogPath = '/academia?vista=catalogo#catalogo';

const topicArt: Record<Topic['id'], string> = {
  marketing: '/assets/stock/analytics.jpg',
  diseno: '/assets/stock/office.jpg',
  ventas: '/assets/stock/meeting.jpg',
  tecnologia: '/assets/videos/agent-ia/hero-automation-poster.webp',
};

const learning = [
  { icon: 'video', title: 'Aprende a tu ritmo', body: 'Entra desde el celular o la computadora y retoma donde quedaste.' },
  { icon: 'target', title: 'Pon la teoría en práctica', body: 'Aplica lo aprendido con ejercicios, misiones y materiales según el curso.' },
  { icon: 'check', title: 'Mide tu avance', body: 'Consulta tus clases completadas y encuentra tus constancias en tu cuenta.' },
] as const;

const questions = [
  ['¿Cómo empiezo un curso?', 'Abre la ficha del curso y elige la opción de inscripción. Usa el mismo correo para entrar a Mis cursos una vez que tengas acceso.'],
  ['¿Puedo ver una clase antes de inscribirme?', 'Si el curso ofrece una clase de muestra, la encontrarás marcada en el temario de su ficha.'],
  ['¿En qué horario puedo estudiar?', 'Los cursos grabados se pueden abrir a tu ritmo. Al volver, encontrarás tu avance guardado en Mis cursos.'],
  ['¿Dónde encuentro mi constancia?', 'Al terminar las clases y aprobar las actividades requeridas, puedes consultar tu constancia en la sección Mis constancias.'],
] as const;

export function AcademySearch({ q = '', type, category, hero = false }: { q?: string; type?: string; category?: string; hero?: boolean }) {
  const id = hero ? 'hero-course-search' : 'course-search';
  return (
    <form action="/academia#catalogo" role="search" aria-label={hero ? 'Buscar en Academia' : 'Buscar en el catálogo'} className={hero ? 'flex w-full max-w-lg items-center gap-1.5 rounded-academy-lg bg-white p-1.5' : 'flex w-full max-w-lg items-center gap-2'}>
      <input type="hidden" name="vista" value="catalogo" />
      {type ? <input type="hidden" name="tipo" value={type} /> : null}
      {category ? <input type="hidden" name="categoria" value={category} /> : null}
      <label htmlFor={id} className="sr-only">Buscar cursos</label>
      <input id={id} type="search" name="q" defaultValue={q} placeholder={hero ? '¿Qué quieres aprender?' : 'Busca por curso o tema'} className={hero ? 'min-h-11 min-w-0 flex-1 bg-transparent px-2.5 text-base text-academy-ink placeholder:text-academy-muted sm:px-3' : 'academy-field min-w-0 flex-1'} />
      <Button type="submit" variant="primary" size="lg" label="Buscar" icon={<Icon name="search" size={17} aria-hidden="true" />} />
    </form>
  );
}

export function AcademyHome({ featured, topics, freeCourse, ratings }: { featured: Course[]; topics: Topic[]; freeCourse?: Course; ratings: Map<string, Rating> }) {
  return (
    <VStack as="main" gap={0} className="bg-academy-surface">
      <VStack className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <VStack as="section" aria-labelledby="academy-hero-title" gap={0} justify="center" className="academy-hero relative isolate overflow-hidden rounded-academy-xl md:min-h-[22rem] lg:min-h-[25rem]">
          <figure className="relative order-last h-32 overflow-hidden sm:h-48 md:absolute md:inset-0 md:order-none md:h-auto md:after:absolute md:after:inset-0 md:after:bg-gradient-to-r md:after:from-black/60 md:after:via-black/25 md:after:to-transparent lg:after:hidden">
            <Image src="/assets/academia/inicio.webp" fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover object-right-top max-md:origin-top-right max-md:scale-125" alt="" />
          </figure>
          <VStack gap={3} className="relative w-full p-5 sm:p-8 md:w-3/5 lg:px-11 lg:py-7">
            <Heading id="academy-hero-title" level={1} className="max-w-xl text-balance text-4xl font-bold !leading-none tracking-tight text-white lg:text-6xl xl:text-7xl">Aprende hoy.<br />Aplícalo mañana.</Heading>
            <Text as="p" className="max-w-md text-base leading-relaxed text-white/85 sm:text-lg">Cursos prácticos de marketing, diseño y tecnología para hacer crecer tu negocio.</Text>
            <AcademySearch hero />
            <Link href={academyCatalogPath} className="academy-action academy-action-on-dark w-fit">Explorar todos los cursos <Icon name="arrow-right" size={17} aria-hidden="true" /></Link>
          </VStack>
        </VStack>
      </VStack>

      {topics.length ? (
        <VStack as="section" gap={3} aria-labelledby="academy-topics-title" className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <Heading level={2} id="academy-topics-title" className="academy-section-title">Explora por tema</Heading>
          <nav aria-labelledby="academy-topics-title" className="grid min-w-0 grid-flow-col auto-cols-[46%] snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:gap-4 md:grid-flow-row md:grid-cols-4 md:snap-none md:overflow-visible">
            {topics.map((topic) => (
              <Link href={`/academia?categoria=${topic.id}#catalogo`} prefetch={false} key={topic.id} className="academy-focus group flex min-w-0 snap-start flex-col overflow-hidden rounded-academy-lg border border-academy-line transition-colors hover:border-academy-primary">
                <figure className="relative aspect-[2/1] overflow-hidden bg-academy-tint">
                  <Image src={topicArt[topic.id]} alt="" fill sizes="(min-width: 1280px) 290px, (min-width: 768px) 24vw, 46vw" className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105" />
                </figure>
                <HStack gap={2} align="center" className="flex-1 px-3 py-3 sm:px-4">
                  <VStack gap={0} className="min-w-0 flex-1">
                    <Text className="break-words text-sm font-bold sm:text-base">{topic.label}</Text>
                    <Text className="text-xs text-academy-muted">{topic.count} {topic.count === 1 ? 'curso' : 'cursos'}</Text>
                  </VStack>
                  <Icon name="arrow-right" size={17} className="shrink-0 text-academy-primary" aria-hidden="true" />
                </HStack>
              </Link>
            ))}
          </nav>
        </VStack>
      ) : null}

      <VStack as="section" id="catalogo" gap={4} aria-labelledby="academy-featured-title" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        <HStack gap={2} align="end" justify="between" wrap="wrap">
          <Heading level={2} id="academy-featured-title" className="academy-section-title">{featured.length ? 'Cursos destacados' : 'Catálogo de cursos'}</Heading>
          <Button as={Link} href={academyCatalogPath} label="Ver catálogo completo" variant="secondary" size="lg" className="hidden sm:inline-flex" icon={<Icon name="arrow-right" size={17} aria-hidden="true" />} />
        </HStack>
        {featured.length ? (
          <ul className={`grid items-stretch gap-3 pb-3 sm:gap-5 ${featured.length > 1 ? 'grid-flow-col auto-cols-[80%] snap-x snap-mandatory overflow-x-auto md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:snap-none lg:grid-cols-4' : 'md:max-w-2xl'}`}>
            {featured.map((course) => <li key={course.id} className="min-w-0 snap-start"><CourseTile course={course} rating={ratings.get(course.id)} /></li>)}
          </ul>
        ) : null}
        <Button as={Link} href={academyCatalogPath} label="Ver catálogo completo" variant="secondary" size="lg" className="self-start sm:hidden" icon={<Icon name="arrow-right" size={17} aria-hidden="true" />} />
      </VStack>

      {freeCourse ? (
        <VStack as="section" aria-labelledby="academy-free-title" className="border-y border-academy-line bg-academy-tint">
          <HStack className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-2 lg:gap-12 lg:px-8">
            <figure className="overflow-hidden rounded-academy-xl border border-academy-line [&>img]:aspect-[2/1]">
              <Cover url={freeCourse.cover_url} title={freeCourse.title} slug={freeCourse.slug} />
            </figure>
            <VStack gap={3}>
              <Text as="p" className="text-sm font-bold text-academy-primary">Empieza con un curso gratis</Text>
              <Heading level={2} id="academy-free-title" className="academy-section-title">{freeCourse.title}</Heading>
              <Text as="p" className="max-w-prose text-base leading-relaxed text-academy-muted">{freeCourse.description}</Text>
              <Text as="p" className="text-sm font-semibold text-academy-muted">{freeCourse.lessons} {freeCourse.lessons === 1 ? 'clase' : 'clases'}{freeCourse.minutes ? ` · ${durationLabel(freeCourse.minutes)}` : ''}</Text>
              <HStack gap={2} wrap="wrap" className="pt-1">
                <Button as={Link} href={`/academia/${freeCourse.slug}`} label="Ver curso gratuito" variant="primary" size="lg" icon={<Icon name="arrow-right" size={17} aria-hidden="true" />} />
                <Link href="/academia?tipo=gratis#catalogo" prefetch={false} className="academy-nav academy-focus">Ver todos los gratuitos</Link>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      ) : null}

      <VStack as="section" gap={6} aria-labelledby="academy-learning-title" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Heading level={2} id="academy-learning-title" className="academy-section-title">Así se aprende en Academia</Heading>
        <ul className="grid gap-4 md:grid-cols-3">
          {learning.map((item) => (
            <li key={item.title}>
              <Card padding={0} className="h-full border-academy-line bg-academy-surface">
                <VStack gap={3} className="p-5 sm:p-6">
                  <HStack align="center" justify="center" className="size-10 rounded-academy bg-academy-tint text-academy-primary"><Icon name={item.icon} size={22} aria-hidden="true" /></HStack>
                  <Heading level={3} className="text-xl font-bold">{item.title}</Heading>
                  <Text as="p" color="secondary">{item.body}</Text>
                </VStack>
              </Card>
            </li>
          ))}
        </ul>
        <HStack align="center" justify="between" gap={4} wrap="wrap" className="rounded-academy-xl border border-academy-line bg-academy-tint p-5 sm:p-6">
          <VStack gap={1}>
            <Heading level={3} className="text-xl font-bold">Plantillas y recursos</Heading>
            <Text as="p" color="secondary">Encuentra materiales de trabajo en el Marketplace.</Text>
          </VStack>
          <Button as={Link} href="/academia/marketplace" label="Explorar Marketplace" variant="secondary" size="lg" icon={<Icon name="arrow-right" size={17} aria-hidden="true" />} />
        </HStack>
      </VStack>

      <VStack as="section" gap={5} aria-labelledby="academy-faq-title" className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-10 sm:px-6 sm:pb-16 md:grid-cols-[1fr_2fr] lg:px-8">
        <Heading level={2} id="academy-faq-title" className="academy-section-title">Preguntas frecuentes</Heading>
        <VStack gap={0} className="overflow-hidden rounded-academy-lg border border-academy-line">
          {questions.map(([question, answer]) => (
            <details key={question} className="group border-b border-academy-line last:border-b-0">
              <summary className="academy-focus flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold hover:bg-academy-tint focus-visible:-outline-offset-2 sm:px-5 [&::-webkit-details-marker]:hidden">
                {question}<Icon name="chevron-down" size={18} className="shrink-0 text-academy-primary group-open:rotate-180" aria-hidden="true" />
              </summary>
              <Text as="p" className="px-4 pb-4 text-sm leading-relaxed text-academy-muted sm:px-5">{answer}</Text>
            </details>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}
