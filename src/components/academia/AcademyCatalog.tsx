import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon, type IconName } from '@/components/ui/Icon';
import { catalogTopicsFor } from '@/lib/valux/catalog';
import type { publishedCourses } from '@/lib/valux/data';
import { academyMoney } from '@/lib/valux/money';
import { whatsappLink } from '@/lib/site';
import { Cover, durationLabel, payNote } from './ui';
import { CatalogControls } from './CatalogControls';

type Course = Awaited<ReturnType<typeof publishedCourses>>[number];
type Rating = { average: number; count: number };
const catalogArt: Record<string, string> = {
  'meta-ads-negocios-locales': 'gratis', 'publicidad-facebook-instagram': 'marketing',
  'diseno-contenido-canva': 'diseno', 'ventas-por-whatsapp': 'ventas', 'ia-automatizacion-negocios': 'tecnologia',
};

function CatalogCover({ course, eager = false }: { course: Course; eager?: boolean }) {
  const art = catalogArt[course.slug];
  const defaultArt = !course.cover_url || course.cover_url.startsWith('/assets/stock/') || course.cover_url.startsWith('/assets/videos/services/') || course.cover_url === '/assets/academia/meta-ads-locales.webp';
  return <Cover url={defaultArt && art ? `/assets/academia/catalogo/${art}.webp` : course.cover_url} title={course.title} slug={course.slug} eager={eager} />;
}

function CatalogCourse({ course, rating, list }: { course: Course; rating?: Rating; list: boolean }) {
  const [topic] = catalogTopicsFor(course);
  const teacher = course.teacher_name || 'Academia Cluster';
  const initials = teacher.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join('');
  const href = `/academia/${course.slug}`;
  return (
    <VStack as="article" gap={0} className={`academy-panel h-full overflow-hidden ${list ? 'sm:flex-row' : ''}`}>
      <Link href={href} aria-label={`Ver ${course.title}`} className={`academy-focus group relative block overflow-hidden ${list ? 'shrink-0 sm:w-72' : ''}`}>
        <CatalogCover course={course} />
        {topic ? <Text className="absolute left-3 top-3 rounded-academy-full bg-academy-surface px-3 py-1 text-xs font-semibold text-academy-primary">{topic.label}</Text> : null}
        <Text color="inherit" className="absolute bottom-3 left-3 rounded-academy bg-black/80 px-2 py-1 font-mono text-xs text-white">{course.minutes ? `${durationLabel(course.minutes)} · ` : ''}{course.lessons} clases</Text>
      </Link>
      <VStack gap={3} className="min-w-0 flex-1 p-5">
        <HStack gap={2} align="center"><HStack align="center" justify="center" className="size-7 shrink-0 rounded-academy-full bg-academy-action text-academy-action-text"><Text color="inherit" className="text-xs font-semibold uppercase">{initials}</Text></HStack><Text className="text-xs font-medium text-academy-ink">{teacher}</Text></HStack>
        <Heading level={3} className="text-xl font-bold leading-snug"><Link href={href} className="academy-focus hover:text-academy-primary">{course.title}</Link></Heading>
        <Text as="p" maxLines={2} className="text-sm leading-relaxed text-academy-muted">{course.description}</Text>
        {rating ? <HStack gap={2} align="center"><Icon name="star" size={15} className="text-academy-primary" /><Text className="text-xs font-semibold">{rating.average.toLocaleString('es', { maximumFractionDigits: 1 })} / 5 · {rating.count} reseñas</Text></HStack> : null}
        <HStack gap={2} align="center"><Icon name="check" size={15} className="text-academy-success" aria-hidden="true" /><Text className="text-xs text-academy-muted">Aprende a tu ritmo</Text></HStack>
        <HStack gap={3} align="center" justify="between" wrap="wrap" className="mt-auto border-t border-academy-line pt-4"><VStack gap={0}><Text className="text-xs text-academy-muted">{course.price_cents ? 'Pago único' : 'Acceso gratuito'}</Text><Text className="text-2xl font-bold tabular-nums">{course.price_cents ? academyMoney(course.price_cents) : 'Gratis'}</Text></VStack><Button as={Link} href={href} label="Ver curso" aria-label={`Ver curso: ${course.title}`} variant="secondary" size="sm" icon={<Icon name="arrow-right" size={16} />} /></HStack>
      </VStack>
    </VStack>
  );
}

function CatalogAdvice() {
  return <VStack as="aside" gap={5} className="academy-panel order-last p-6 lg:order-none">
    <HStack align="center" justify="center" className="size-12 rounded-academy bg-academy-tint text-academy-primary"><Icon name="whatsapp" size={24} /></HStack>
    <VStack gap={3}><Heading level={3} className="text-xl font-bold">¿Asesoría para tu ruta?</Heading><Text as="p" className="text-sm leading-relaxed text-academy-muted">Cuéntanos qué quieres mejorar en tu negocio y te ayudamos a elegir un curso según tus objetivos.</Text></VStack>
    <VStack as="ul" gap={3}>{['Orientación para elegir tu curso', 'Una ruta según tus objetivos'].map((item) => <HStack as="li" key={item} gap={2} align="center"><Icon name="check" size={16} className="text-academy-success" /><Text className="text-sm">{item}</Text></HStack>)}</VStack>
    <Button as="a" href={whatsappLink('Hola, quisiera orientación para elegir un curso de Academia Cluster.')} label="Escríbenos por WhatsApp" variant="secondary" className="mt-auto" icon={<Icon name="arrow-right" size={17} />} />
  </VStack>;
}

export function AcademyCatalog({ courses, topics, ratings, total, q, category, price, order, duration, format, error }: {
  courses: Course[]; topics: { id: string; label: string; count: number }[]; ratings: Map<string, Rating>; total: number;
  q: string; category: string; price: string; order: string; duration: string; format: string; error?: string;
}) {
  const free = courses.find((course) => course.price_cents === 0);
  const others = courses.filter((course) => course.id !== free?.id);
  const list = format === 'lista';
  return (
    <VStack as="main" gap={0} id="catalogo" className="scroll-mt-20 bg-academy-page">
      <VStack as="header" gap={5} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Ruta del catálogo" className="flex items-center gap-2 text-xs text-academy-muted"><Link href="/academia" className="academy-focus py-2">Inicio</Link><Icon name="chevron-down" size={12} className="-rotate-90" /><Text className="text-xs font-medium">Catálogo de cursos</Text></nav>
        <HStack gap={2} wrap="wrap"><Text className="rounded-academy-full bg-academy-tint px-3 py-1 text-xs font-semibold text-academy-primary">Formación práctica</Text><Text className="rounded-academy-full bg-academy-surface px-3 py-1 text-xs font-medium">{total} cursos disponibles</Text></HStack>
        <VStack gap={3}><Heading level={1} className="text-3xl font-extrabold tracking-tight sm:text-4xl">Catálogo de Cursos</Heading><Text as="p" className="max-w-3xl text-base leading-relaxed text-academy-muted sm:text-lg">Formación práctica en habilidades digitales para impulsar tu negocio o dar el siguiente paso en tu carrera profesional.</Text></VStack>
      </VStack>
      <VStack as="section" aria-label="Búsqueda y filtros" className="border-y border-academy-line bg-academy-surface">
        <VStack className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><CatalogControls key={JSON.stringify([q, category, price, order, duration, format])} q={q} category={category} price={price} order={order} duration={duration} format={format} topics={topics.map(({ id, label, count }) => ({ id, label, count }))} total={total} /></VStack>
      </VStack>
      <VStack gap={10} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {error ? <Text as="p" role="alert" className="academy-notice">{payNote(error)}</Text> : null}
        {free ? <VStack as="article" gap={0} className="academy-panel overflow-hidden lg:flex-row">
          <VStack gap={4} className="flex-1 p-5 sm:p-8 lg:w-7/12">
            <Text className="w-fit rounded-academy-full bg-academy-tint px-3 py-1 text-xs font-bold uppercase tracking-wide text-academy-primary">Curso gratuito · Empieza a tu ritmo</Text>
            <Heading level={2} className="text-2xl font-bold sm:text-3xl">{free.title}</Heading><Text as="p" className="max-w-2xl text-sm leading-relaxed text-academy-muted">{free.description}</Text>
            <HStack gap={3} wrap="wrap">{[{ icon: 'video', text: `${free.lessons} clases` }, ...(free.minutes ? [{ icon: 'clock', text: durationLabel(free.minutes) }] : []), { icon: 'target', text: 'Formación práctica' }].map((item) => <HStack key={item.text} gap={2} align="center" className="rounded-academy bg-academy-page px-3 py-2"><Icon name={item.icon as IconName} size={17} className="text-academy-primary" /><Text className="text-xs font-medium">{item.text}</Text></HStack>)}</HStack>
            <HStack gap={3} align="center" justify="between" wrap="wrap" className="mt-auto border-t border-academy-line pt-4"><Text className="text-3xl font-extrabold text-academy-primary">GRATIS</Text><HStack gap={2} wrap="wrap"><Button as={Link} href={`/academia/${free.slug}#temario`} label="Ver temario" variant="secondary" /><Button as={Link} href={`/academia/${free.slug}`} label="Empezar gratis" variant="primary" icon={<Icon name="arrow-right" size={17} />} /></HStack></HStack>
          </VStack>
          <Link href={`/academia/${free.slug}`} aria-label={`Conocer ${free.title}`} className="academy-focus group relative block overflow-hidden lg:w-5/12 [&_img]:h-full"><CatalogCover course={free} eager /><VStack gap={3} align="center" justify="center" className="absolute inset-0 bg-black/40 text-white"><HStack justify="center" align="center" className="size-16 rounded-academy-full bg-white/20 backdrop-blur-sm"><Icon name="arrow-right" size={28} /></HStack><Text color="inherit" className="text-sm font-semibold">Conoce tu primer curso</Text></VStack></Link>
        </VStack> : null}
        {others.length ? <VStack as="section" gap={5} aria-labelledby="catalog-courses-title">
          <HStack gap={3} justify="between" align="end" wrap="wrap"><VStack gap={2}><Heading level={2} id="catalog-courses-title" className="text-2xl font-bold">{q ? `Cursos para «${q}»` : price === 'gratis' ? 'Más cursos gratuitos' : 'Explora tu próxima habilidad'} ({others.length})</Heading><Text as="p" className="text-sm text-academy-muted">Revisa el temario y elige lo que quieres aplicar en tu negocio.</Text></VStack><Text className="text-xs text-academy-muted">Precios en Lempiras</Text></HStack>
          <Grid columns={{ minWidth: list ? 600 : 290, max: list ? 1 : 3 }} gap={5}>
            {others.flatMap((course, index) => [<CatalogCourse key={course.id} course={course} rating={ratings.get(course.id)} list={list} />, ...(!list && index === Math.min(1, others.length - 1) ? [<CatalogAdvice key="advice" />] : [])])}
            {!list ? <VStack as="aside" gap={5} className="academy-panel order-last p-6 lg:order-none"><HStack gap={2} align="center" className="text-academy-primary"><Icon name="target" size={20} /><Text className="text-xs font-bold uppercase tracking-wide text-academy-primary">Metodología práctica</Text></HStack><Heading level={3} className="text-xl font-bold">Habilidades orientadas a la acción</Heading><Text as="p" className="text-sm leading-relaxed text-academy-muted">Sigue las clases, trabaja en los ejercicios disponibles y lleva tus ideas a un proyecto de tu negocio.</Text><HStack gap={3}><VStack gap={1} className="flex-1 rounded-academy bg-academy-page p-4"><Text className="text-lg font-bold text-academy-primary">A tu ritmo</Text><Text className="text-xs text-academy-muted">Desde donde estés</Text></VStack><VStack gap={1} className="flex-1 rounded-academy bg-academy-page p-4"><Text className="text-lg font-bold text-academy-primary">Tu avance</Text><Text className="text-xs text-academy-muted">Guardado en tu cuenta</Text></VStack></HStack><Text className="mt-auto border-t border-academy-line pt-4 text-xs text-academy-muted">Un siguiente paso claro para seguir aprendiendo.</Text></VStack> : null}
          </Grid>
        </VStack> : null}
        {!courses.length ? <VStack gap={4} className="academy-panel items-start p-8"><Heading level={2} className="text-xl font-bold">No encontramos cursos con esos filtros</Heading><Text as="p" className="text-academy-muted">Prueba otra búsqueda o explora el catálogo completo.</Text><Button as={Link} href="/academia?vista=catalogo#catalogo" label="Limpiar filtros" variant="secondary" /></VStack> : null}
        <HStack as="section" gap={6} wrap="wrap" justify="between" align="center" className="rounded-academy-lg bg-academy-deep p-6 text-white sm:p-8"><VStack gap={3}><Text color="inherit" className="text-xs font-semibold text-white/80">Construye tu propia ruta de aprendizaje</Text><Heading level={2} color="inherit" className="text-2xl font-bold">De una habilidad a tu próximo proyecto.</Heading><Text as="p" color="inherit" className="max-w-2xl text-sm leading-relaxed text-white/80">Combina marketing, diseño, ventas y tecnología según lo que tu negocio necesita ahora.</Text></VStack><Button as={Link} href="/academia?vista=catalogo#catalogo" label="Explorar todas las habilidades" variant="primary" icon={<Icon name="arrow-right" size={18} />} /></HStack>
        <HStack gap={4} align="center" justify="between" wrap="wrap" className="academy-panel px-5 py-4"><Text role="status" className="text-sm font-semibold">Mostrando {courses.length} de {total} cursos disponibles</Text><Text className="text-xs text-academy-muted">{q || category || price || duration ? 'Resultados según tus filtros' : 'Estás viendo el catálogo completo'}</Text></HStack>
      </VStack>
      <VStack as="section" gap={0} className="border-y border-academy-line bg-academy-surface"><Grid columns={{ minWidth: 240, max: 4 }} gap={5} className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{[{ icon: 'clock', title: 'Estudia a tu ritmo', body: 'Retoma las clases cuando tengas tiempo para aprender.' }, { icon: 'target', title: 'Formación práctica', body: 'Aplica las actividades disponibles a los retos de tu negocio.' }, { icon: 'shield', title: 'Tu avance, guardado', body: 'Encuentra tus cursos y continúa con la misma cuenta.' }, { icon: 'globe', title: 'Precios en Lempiras', body: 'Consulta el precio y las opciones de inscripción de cada curso.' }].map((item) => <VStack key={item.title} gap={3} className="rounded-academy-lg bg-academy-page p-5"><Icon name={item.icon as IconName} size={25} className="text-academy-primary" /><Heading level={3} className="text-lg font-bold">{item.title}</Heading><Text as="p" className="text-sm leading-relaxed text-academy-muted">{item.body}</Text></VStack>)}</Grid></VStack>
      <VStack as="section" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><HStack gap={6} align="center" justify="between" wrap="wrap" className="academy-panel p-6 sm:p-8"><VStack gap={3}><Text className="text-xs font-semibold text-academy-primary">Academia Cluster para tu equipo</Text><Heading level={2} className="text-2xl font-bold">¿Buscas capacitar a tu equipo de trabajo?</Heading><Text as="p" className="max-w-2xl text-sm leading-relaxed text-academy-muted">Cuéntanos qué habilidades necesitan desarrollar y conversemos sobre las opciones de formación.</Text></VStack><Button as="a" href={whatsappLink('Hola, quisiera información sobre formación para mi equipo con Academia Cluster.')} label="Consultar para mi equipo" variant="primary" /></HStack></VStack>
    </VStack>
  );
}
