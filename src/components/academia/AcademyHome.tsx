import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import type { courseTopics } from '@/lib/valux/catalog';
import type { publishedCourses } from '@/lib/valux/data';
import { academyMoney } from '@/lib/valux/money';
import { CourseTile } from './CourseTile';
import { Cover, durationLabel } from './ui';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];
type Topic = (typeof courseTopics)[number] & { count: number };
type Rating = { average: number; count: number };

export const academyCatalogPath = '/academia?vista=catalogo#catalogo';

const topicDescriptions: Record<Topic['id'], string> = {
  marketing: 'Estrategia, anuncios y campañas para dar a conocer tu negocio y medir sus resultados.',
  diseno: 'Diseño, identidad y contenido para comunicar tus ideas con claridad.',
  ventas: 'Conversaciones, seguimiento y herramientas para convertir el interés en oportunidades.',
  tecnologia: 'Inteligencia artificial y automatización aplicadas al trabajo de todos los días.',
};

const learning = [
  { icon: 'clock', title: 'Aprende a tu ritmo', body: 'Retoma tus clases cuando tengas tiempo.' },
  { icon: 'target', title: 'Formación práctica', body: 'Lleva cada aprendizaje a tu negocio.' },
  { icon: 'link', title: 'Recursos del curso', body: 'Encuentra los materiales junto a tu clase.' },
  { icon: 'video', title: 'Desde cualquier lugar', body: 'Estudia en el celular o la computadora.' },
  { icon: 'shield', title: 'Tu avance, guardado', body: 'Consulta tus clases y tus constancias.' },
] as const;

const questions = [
  ['¿Cómo empiezo un curso?', 'Elige un curso, revisa su contenido e inscríbete. Usa el mismo correo para entrar a Mis cursos y encontrar tu acceso.'],
  ['¿Puedo ver una clase antes de inscribirme?', 'Los cursos con una clase de muestra la indican en su temario. También puedes explorar los cursos gratuitos para conocer la experiencia.'],
  ['¿En qué horario puedo estudiar?', 'Las clases grabadas están disponibles para estudiar a tu ritmo. Al volver, encontrarás tu avance guardado en Mis cursos.'],
  ['¿Dónde encuentro los materiales?', 'Los recursos disponibles aparecen dentro de cada clase, en la sección Materiales. Su contenido depende del curso que elijas.'],
  ['¿Cómo consigo mi constancia?', 'Completa las clases y aprueba las actividades requeridas. Después podrás consultar las condiciones y solicitar tu constancia desde el curso.'],
] as const;

export function AcademySearch({ q = '', type, category, hero = false }: { q?: string; type?: string; category?: string; hero?: boolean }) {
  const id = hero ? 'hero-course-search' : 'course-search';
  return (
    <form action="/academia#catalogo" role="search" aria-label={hero ? 'Buscar en Academia' : 'Buscar en el catálogo'} className={hero ? 'flex w-full max-w-xl items-center gap-2 rounded-academy border border-academy-surface bg-academy-surface p-2 shadow-sm' : 'flex w-full max-w-lg items-center gap-2'}>
      <input type="hidden" name="vista" value="catalogo" />
      {type ? <input type="hidden" name="tipo" value={type} /> : null}
      {category ? <input type="hidden" name="categoria" value={category} /> : null}
      {hero ? <HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy bg-academy-tint text-academy-primary"><Icon name="search" size={19} aria-hidden="true" /></HStack> : null}
      <label htmlFor={id} className="sr-only">Buscar cursos</label>
      <input id={id} type="search" name="q" autoComplete="off" defaultValue={q} placeholder={hero ? '¿Qué quieres aprender hoy? (ej. Facebook Ads, IA, Canva…)' : 'Busca por curso o tema…'} className={hero ? 'min-h-11 min-w-0 flex-1 scroll-mt-24 bg-transparent px-1 text-sm text-academy-ink placeholder:text-academy-muted' : 'academy-field min-w-0 flex-1 scroll-mt-24'} />
      <Button type="submit" variant="primary" size={hero ? 'sm' : 'lg'} label="Buscar" />
    </form>
  );
}

export function AcademyHome({ featured, topics, freeCourse, ratings, heroProgress }: { featured: Course[]; topics: Topic[]; freeCourse?: Course; ratings: Map<string, Rating>; heroProgress?: { done: number; lessons: number; nextLesson: { slug: string; title: string } | null } }) {
  const heroCourse = freeCourse ?? featured[0];
  const heroRating = heroCourse ? ratings.get(heroCourse.id) : undefined;
  const done = heroProgress?.done ?? 0;
  const lessons = heroProgress?.lessons ?? heroCourse?.lessons ?? 0;
  const percent = lessons ? Math.min(100, Math.round(done / lessons * 100)) : 0;
  const heroHref = heroProgress?.nextLesson && heroCourse ? `/academia/${heroCourse.slug}/${heroProgress.nextLesson.slug}` : heroCourse ? `/academia/${heroCourse.slug}` : academyCatalogPath;
  return (
    <VStack as="main" gap={0} className="bg-academy-page">
      <VStack as="section" aria-labelledby="academy-hero-title" className="border-b border-academy-line bg-academy-page bg-academy-hero">
        <Grid columns={{ minWidth: 360, max: 2 }} gap={10} align="center" className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
          <VStack gap={6} className="min-w-0 items-start">
            <HStack align="center" gap={2} className="w-fit rounded-academy-full bg-academy-tint px-3 py-1.5 text-academy-primary"><Text aria-hidden="true" className="text-sm leading-none">●</Text><Text className="text-xs font-semibold uppercase tracking-wide">Academia Cluster · Aprendizaje digital</Text></HStack>
            <VStack gap={3}>
              <Heading id="academy-hero-title" level={1} className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl">Aprende hoy.<Text type="inherit" className="block font-academy-heading text-academy-primary">Transforma tu futuro.</Text></Heading>
              <Text as="p" className="max-w-xl text-base leading-relaxed text-academy-muted sm:text-lg">Domina las habilidades digitales que están transformando los negocios. Aprende marketing, diseño, inteligencia artificial, ventas y tecnología con cursos prácticos diseñados para aplicar tus conocimientos desde el primer día.</Text>
            </VStack>
            <HStack gap={4} wrap="wrap">
              <Button as={Link} href={academyCatalogPath} label="Explorar cursos" variant="primary" size="lg" className="shadow-lg" icon={<Icon name="arrow-right" size={17} aria-hidden="true" />} />
              <Button as={Link} href={freeCourse ? `/academia/${freeCourse.slug}` : '/academia?tipo=gratis#catalogo'} label="Empezar gratis" variant="secondary" size="lg" className="bg-academy-tint" icon={<Icon name="play" size={16} className="text-academy-success" aria-hidden="true" />} />
            </HStack>
            <AcademySearch hero />
            <HStack gap={6} align="center" wrap="wrap" className="pt-2">
              <HStack gap={3} align="center">
                <HStack gap={0} aria-hidden="true" className="-space-x-2">
                  {(['megaphone', 'pen', 'bot'] as const).map((icon) => <HStack key={icon} align="center" justify="center" className="size-9 rounded-academy-full border-2 border-academy-page bg-academy-tint text-academy-primary"><Icon name={icon} size={16} /></HStack>)}
                </HStack>
                <VStack gap={0}>
                  {heroRating ? <><Text className="text-sm font-bold text-academy-primary">★ {heroRating.average.toLocaleString('es', { maximumFractionDigits: 1 })} / 5</Text><Text className="text-xs text-academy-muted">{heroRating.count} {heroRating.count === 1 ? 'reseña de estudiantes' : 'reseñas de estudiantes'}</Text></> : <><Text className="text-sm font-bold">Habilidades digitales</Text><Text className="text-xs text-academy-muted">Para tu próximo paso</Text></>}
                </VStack>
              </HStack>
              <VStack gap={0} className="border-l border-academy-line pl-6"><Text className="text-lg font-bold">Aprende haciendo</Text><Text className="text-xs text-academy-muted">Con ejercicios guiados</Text></VStack>
            </HStack>
          </VStack>
          <VStack gap={4} className="mx-auto w-full max-w-lg rounded-academy-lg border border-academy-surface bg-academy-surface p-4 shadow-xl lg:mr-0">
            <Link href={heroHref} className="academy-focus group relative overflow-hidden rounded-academy" aria-label={heroCourse ? `Conocer el curso ${heroCourse.title}` : 'Conocer los cursos de Academia'}>
              <Image src="/assets/academia/stitch/hero.webp" width={1200} height={675} priority sizes="(min-width: 1024px) 480px, (min-width: 800px) 44vw, 100vw" alt="Espacio de aprendizaje digital con una estudiante preparando una campaña" className="aspect-video w-full object-cover" />
              <VStack gap={0} align="center" justify="center" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"><HStack gap={0} align="center" justify="center" className="size-14 rounded-academy-full bg-academy-action text-academy-action-text shadow-lg motion-safe:transition-transform motion-safe:group-hover:scale-105"><Icon name="play" size={23} aria-hidden="true" /></HStack></VStack>
              <Text color="inherit" className="absolute left-3 top-3 rounded-academy-full bg-black/75 px-3 py-1 text-xs font-medium text-white">Clases a tu ritmo · Formación práctica</Text>
              {heroCourse ? <Text color="inherit" className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white">{heroCourse.title}</Text> : null}
            </Link>
            <VStack gap={3} className="rounded-academy bg-academy-page p-4">
              <HStack gap={2} align="center" justify="between"><HStack gap={2} align="center"><Icon name="target" size={19} className="text-academy-primary" aria-hidden="true" /><Heading level={2} className="text-base font-bold">{heroProgress ? 'Tu ruta en progreso' : 'Tu ruta empieza aquí'}</Heading></HStack><Text className="text-xs font-bold tabular-nums text-academy-primary">{percent}%</Text></HStack>
              <ProgressBar label="Avance en el curso destacado" value={percent} isLabelHidden />
              <HStack gap={2} justify="between" wrap="wrap"><Text className="text-xs text-academy-muted">{heroProgress ? `${done} de ${lessons} clases completadas` : `${lessons} clases para comenzar`}</Text><Text className="text-xs font-medium text-academy-success">{heroProgress?.nextLesson ? 'Continúa a tu ritmo' : 'Ejercicios prácticos'}</Text></HStack>
            </VStack>
            <HStack gap={3} align="center" justify="between" className="px-1 pb-1"><HStack gap={3} align="center"><HStack align="center" justify="center" className="size-10 shrink-0 rounded-academy-full bg-academy-tint text-academy-primary"><Icon name="shield" size={20} aria-hidden="true" /></HStack><VStack gap={0}><Text className="text-sm font-semibold">Acceso al curso</Text><Text className="text-xs text-academy-muted">{heroCourse?.minutes ? `${lessons} clases · ${durationLabel(heroCourse.minutes)}` : 'Clases y actividades prácticas'}</Text></VStack></HStack>{heroCourse ? <Text className="text-xl font-bold tabular-nums text-academy-primary">{heroCourse.price_cents > 0 ? academyMoney(heroCourse.price_cents) : 'Gratis'}</Text> : null}</HStack>
          </VStack>
        </Grid>
      </VStack>
      <VStack as="section" aria-label="Cómo se aprende en Academia" className="bg-academy-surface">
        <HStack as="ul" gap={3} tabIndex={0} aria-label="Beneficios de Academia" className="academy-focus mx-auto w-full max-w-7xl overflow-x-auto px-4 py-5 sm:hidden">
          {learning.map((item) => <HStack as="li" key={item.title} gap={2} align="center" className="shrink-0 rounded-academy-full border border-academy-line px-4 py-2"><Icon name={item.icon} size={17} className="text-academy-primary" aria-hidden="true" /><Text className="whitespace-nowrap text-sm font-semibold">{item.title}</Text></HStack>)}
        </HStack>
        <Grid columns={{ minWidth: 180, max: 5 }} gap={5} className="mx-auto hidden w-full max-w-7xl px-4 py-8 sm:grid sm:px-6 lg:px-8">
          {learning.map((item) => <VStack key={item.title} gap={2} className="rounded-academy-lg bg-academy-page p-4"><HStack align="center" justify="center" className="mb-1 size-10 rounded-academy bg-academy-tint text-academy-primary"><Icon name={item.icon} size={21} aria-hidden="true" /></HStack><Heading level={2} className="text-base font-bold">{item.title}</Heading><Text as="p" className="text-sm leading-relaxed text-academy-muted">{item.body}</Text></VStack>)}
        </Grid>
      </VStack>
      {topics.length ? (
        <VStack as="section" gap={8} aria-labelledby="academy-topics-title" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <HStack gap={4} align="end" justify="between" wrap="wrap"><VStack gap={3}><Text as="p" className="text-sm font-semibold text-academy-primary">Explora lo que puedes aprender</Text><Heading level={2} id="academy-topics-title" className="academy-section-title">Encuentra tu próxima habilidad</Heading><Text as="p" className="max-w-2xl text-academy-muted">Elige una ruta para llevar tus ideas al siguiente paso.</Text></VStack><Link href={academyCatalogPath} className="academy-nav academy-focus">Ver todo el catálogo <Icon name="arrow-right" size={16} aria-hidden="true" /></Link></HStack>
          <Grid columns={{ minWidth: 260, max: 2 }} gap={5}>
            {topics.map((topic) => (
              <Link href={`/academia?categoria=${topic.id}#catalogo`} prefetch={false} key={topic.id} className={`academy-focus group flex min-w-0 flex-col gap-5 rounded-academy-lg border p-6 transition-shadow hover:shadow-md sm:p-7 ${topic.id === 'tecnologia' ? 'border-academy-deep bg-academy-deep text-white' : 'border-academy-line bg-academy-surface'}`}>
                <HStack align="center" justify="between" gap={3}><HStack align="center" justify="center" className="size-11 rounded-academy bg-academy-tint text-academy-primary"><Icon name={topic.icon} size={23} aria-hidden="true" /></HStack><Text className={`text-sm ${topic.id === 'tecnologia' ? 'text-white/75' : 'text-academy-muted'}`}>{topic.count} {topic.count === 1 ? 'curso disponible' : 'cursos disponibles'}</Text></HStack>
                <VStack gap={2}><Heading level={3} color="inherit" className="text-2xl font-bold">{topic.label}</Heading><Text as="p" color="inherit" className={`max-w-lg leading-relaxed ${topic.id === 'tecnologia' ? 'text-white/80' : 'text-academy-muted'}`}>{topicDescriptions[topic.id]}</Text></VStack>
                <HStack justify="between" align="center" className="mt-auto pt-2"><Text color="inherit" className="text-sm font-semibold">Explorar cursos</Text><Icon name="arrow-right" size={20} aria-hidden="true" /></HStack>
              </Link>
            ))}
          </Grid>
        </VStack>
      ) : null}
      <VStack as="section" id="catalogo" gap={8} aria-labelledby="academy-featured-title" className="border-y border-academy-line bg-academy-surface">
        <VStack gap={8} className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <HStack gap={4} align="end" justify="between" wrap="wrap"><VStack gap={3}><Text as="p" className="text-sm font-semibold text-academy-primary">Cursos de Academia Cluster</Text><Heading level={2} id="academy-featured-title" className="academy-section-title">Habilidades reales. Resultados reales.</Heading><Text as="p" className="max-w-2xl text-academy-muted">Elige un curso, conoce a tu docente y empieza a trabajar en lo que quieres conseguir.</Text></VStack><Link href={academyCatalogPath} className="academy-nav academy-focus">Ver todos los cursos <Icon name="arrow-right" size={16} aria-hidden="true" /></Link></HStack>
          {featured.length ? <Grid columns={{ minWidth: 250, max: 4 }} gap={5}>{featured.map((course) => <CourseTile key={course.id} course={course} rating={ratings.get(course.id)} />)}</Grid> : <Text as="p" className="academy-notice">Estamos preparando los próximos cursos. Encontrarás aquí los cursos publicados.</Text>}
        </VStack>
      </VStack>
      {freeCourse ? (
        <VStack as="section" aria-labelledby="academy-free-title" className="bg-academy-deep text-white">
          <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="center" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <VStack gap={5}><Text as="p" color="inherit" className="text-sm font-semibold text-white/80">Tu primer paso puede ser gratis</Text><Heading level={2} id="academy-free-title" color="inherit" className="text-balance text-3xl font-bold text-white sm:text-4xl">{freeCourse.title}</Heading><Text as="p" color="inherit" className="max-w-xl leading-relaxed text-white/80">{freeCourse.description}</Text><HStack gap={4} wrap="wrap" className="text-white/80"><Text color="inherit" className="text-sm">{freeCourse.lessons} {freeCourse.lessons === 1 ? 'clase' : 'clases'}</Text>{freeCourse.minutes ? <Text color="inherit" className="text-sm">{durationLabel(freeCourse.minutes)}</Text> : null}</HStack><Button as={Link} href={`/academia/${freeCourse.slug}`} label="Empezar este curso gratis" variant="primary" size="lg" className="w-fit" icon={<Icon name="arrow-right" size={18} aria-hidden="true" />} /></VStack>
            <figure className="overflow-hidden rounded-academy-xl border border-white/20"><Cover url={freeCourse.cover_url} title={freeCourse.title} slug={freeCourse.slug} /></figure>
          </Grid>
        </VStack>
      ) : null}
      <VStack as="section" gap={8} aria-labelledby="academy-learning-title" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <VStack gap={3}><Heading level={2} id="academy-learning-title" className="academy-section-title">Construye tu futuro, paso a paso</Heading><Text as="p" className="max-w-2xl text-academy-muted">Del primer curso a un trabajo que puedes aplicar.</Text></VStack>
        <Grid columns={{ minWidth: 250, max: 3 }} gap={8}>
          {[
            { number: '1', title: 'Encuentra tu camino', body: 'Explora por tema, revisa el temario y elige una habilidad para tu negocio.' },
            { number: '2', title: 'Aprende y practica', body: 'Sigue las clases y aprovecha los ejercicios y materiales disponibles.' },
            { number: '3', title: 'Haz visible tu avance', body: 'Completa el curso, revisa tus resultados y consulta tus constancias.' },
          ].map((step) => <VStack key={step.number} gap={3} className="border-t border-academy-line pt-5"><Text className="text-3xl font-bold text-academy-primary">{step.number}</Text><Heading level={3} className="text-xl font-bold">{step.title}</Heading><Text as="p" className="leading-relaxed text-academy-muted">{step.body}</Text></VStack>)}
        </Grid>
      </VStack>
      <VStack as="section" className="border-y border-academy-line bg-academy-surface">
        <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="center" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <figure className="overflow-hidden rounded-academy-xl"><Image src="/assets/academia/stitch/aula.webp" width={1200} height={675} loading="lazy" sizes="(min-width: 1280px) 560px, (min-width: 800px) 48vw, 100vw" alt="Vista ilustrativa de una clase y sus recursos de aprendizaje" className="aspect-video w-full object-cover" /></figure>
          <VStack gap={5}><Text as="p" className="text-sm font-semibold text-academy-primary">Aprende haciendo</Text><Heading level={2} className="academy-section-title">No solo aprendas.<br />Ponlo en práctica.</Heading><Text as="p" className="max-w-xl leading-relaxed text-academy-muted">Trabaja con las actividades de cada curso, guarda tus notas y encuentra tus materiales en el mismo lugar.</Text><HStack gap={3} wrap="wrap"><Button as={Link} href="/academia/mis-cursos" label="Ir a mis cursos" variant="primary" size="lg" /><Button as={Link} href="/academia/marketplace" label="Explorar recursos" variant="secondary" size="lg" /></HStack></VStack>
        </Grid>
      </VStack>
      <VStack as="section" gap={8} aria-labelledby="academy-faq-title" className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <VStack gap={3}><Heading level={2} id="academy-faq-title" className="academy-section-title">Preguntas frecuentes</Heading><Text as="p" className="text-academy-muted">Lo que necesitas saber antes de comenzar.</Text></VStack>
        <VStack gap={0} className="overflow-hidden rounded-academy-lg border border-academy-line bg-academy-surface">
          {questions.map(([question, answer]) => <details key={question} className="group border-b border-academy-line last:border-b-0"><summary className="academy-focus flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-academy-tint focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">{question}<Icon name="chevron-down" size={18} className="shrink-0 text-academy-primary group-open:rotate-180" aria-hidden="true" /></summary><Text as="p" className="px-5 pb-5 text-sm leading-relaxed text-academy-muted">{answer}</Text></details>)}
        </VStack>
      </VStack>
      <VStack as="section" align="center" gap={5} className="border-t border-academy-line bg-academy-tint px-4 py-12 text-center sm:py-16">
        <Heading level={2} justify="center" className="max-w-3xl text-balance text-3xl font-bold sm:text-4xl">El futuro pertenece a quienes nunca dejan de aprender.</Heading>
        <Text as="p" className="max-w-xl text-academy-muted">Encuentra tu próxima habilidad y empieza a construirla hoy.</Text>
        <Button as={Link} href={academyCatalogPath} label="Encuentra tu próximo curso" variant="primary" size="lg" icon={<Icon name="arrow-right" size={18} aria-hidden="true" />} />
      </VStack>
    </VStack>
  );
}
