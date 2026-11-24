import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademyHome, AcademySearch, academyCatalogPath } from '@/components/academia/AcademyHome';
import { CourseTile } from '@/components/academia/CourseTile';
import { payNote } from '@/components/academia/ui';
import { Icon } from '@/components/ui/Icon';
import { catalogCourseRatings, catalogSearchText, courseTopics, featuredCourseIds, matchesCourseTopic, selectFeatured } from '@/lib/valux/catalog';
import { site } from '@/lib/site';
import { publishedCourses } from '@/lib/valux/data';

export const metadata: Metadata = {
  title: 'Academia Cluster | Cursos de marketing, diseño y tecnología',
  description: 'Explora los cursos de Academia Cluster y aprende a tu ritmo con clases, actividades y recursos para tu negocio.',
  alternates: { canonical: `${site.url}/academia` },
};

type CourseSearch = { error?: string; q?: string; tipo?: string; categoria?: string; vista?: string };

export default async function AcademiaHomePage({ searchParams }: { searchParams: Promise<CourseSearch> }) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  const type = query.tipo === 'gratis' || query.tipo === 'pago' ? query.tipo : '';
  const topic = courseTopics.find((item) => item.id === query.categoria);
  const isCatalog = Boolean(q || type || topic || query.vista === 'catalogo' || query.error);
  const [all, featuredConfig] = await Promise.all([publishedCourses(), featuredCourseIds()]);
  const featured = selectFeatured(all, featuredConfig);
  const topics = courseTopics.map((item) => ({ ...item, count: all.filter((course) => matchesCourseTopic(course, item)).length })).filter((item) => item.count);

  if (!isCatalog) {
    const freeCourse = all.find((course) => course.price_cents === 0 && course.slug === 'meta-ads-negocios-locales') ?? all.find((course) => course.price_cents === 0);
    const ratings = await catalogCourseRatings(featured.map((course) => course.id));
    return <AcademyHome featured={featured} topics={topics} freeCourse={freeCourse} ratings={ratings} />;
  }

  const featuredIds = new Set(featured.map((course) => course.id));
  const ordered = [...featured, ...all.filter((course) => !featuredIds.has(course.id))];
  const search = catalogSearchText(q).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const courses = ordered.filter((course) => {
    if (type && (type === 'gratis' ? course.price_cents > 0 : course.price_cents === 0)) return false;
    if (topic && !matchesCourseTopic(course, topic)) return false;
    if (!search.length) return true;
    const labels = topics.filter((item) => matchesCourseTopic(course, item)).map((item) => item.label);
    const words = catalogSearchText([course.title, course.teacher_name, course.description, ...labels].join(' ')).split(/[^\p{L}\p{N}]+/u);
    return search.every((term) => words.some((word) => term.length <= 2 ? word === term : word.startsWith(term)));
  });
  const ratings = await catalogCourseRatings(courses.map((course) => course.id));
  const filterHref = (category: string, price: string) => {
    const params = new URLSearchParams({ vista: 'catalogo' });
    if (q) params.set('q', q);
    if (category) params.set('categoria', category);
    if (price) params.set('tipo', price);
    return `/academia?${params}#catalogo`;
  };

  return (
    <VStack as="main" id="catalogo" gap={6} className="academy-page scroll-mt-20">
      <Link href="/academia" className="academy-nav academy-focus w-fit"><Icon name="arrow-right" size={17} className="rotate-180" aria-hidden="true" /> Inicio de Academia</Link>
      <VStack gap={2}>
        <Heading level={1} className="academy-title">{topic?.label || 'Catálogo de cursos'}</Heading>
        <Text as="p" className="text-academy-muted">{courses.length} {courses.length === 1 ? 'curso' : 'cursos'}{q ? ` para «${q}»` : ' disponibles'}</Text>
      </VStack>
      {query.error ? <Text as="p" role="alert" className="academy-notice">{payNote(query.error)}</Text> : null}
      <VStack as="section" aria-label="Búsqueda y filtros" gap={4} className="academy-panel p-4 sm:p-5">
        <HStack gap={4} wrap="wrap" justify="between" align="center">
          <AcademySearch q={q} type={type} category={topic?.id} />
          <nav aria-label="Filtrar por precio" className="flex flex-wrap gap-2">
            {[['', 'Cualquier precio'], ['gratis', 'Gratis'], ['pago', 'De pago']].map(([value, label]) => (
              <Link key={label} href={filterHref(topic?.id || '', value)} prefetch={false} aria-current={type === value ? 'page' : undefined} className="academy-filter academy-focus">{label}</Link>
            ))}
          </nav>
        </HStack>
        {topics.length ? (
          <nav aria-label="Filtrar por tema" className="flex flex-wrap gap-2 border-t border-academy-line pt-3">
            <Link href={filterHref('', type)} prefetch={false} aria-current={!topic ? 'page' : undefined} className="academy-filter academy-focus">Todos los temas</Link>
            {topics.map((item) => <Link key={item.id} href={filterHref(item.id, type)} prefetch={false} aria-current={topic?.id === item.id ? 'page' : undefined} className="academy-filter academy-focus">{item.label}</Link>)}
          </nav>
        ) : null}
      </VStack>
      {courses.length ? (
        <Grid columns={{ minWidth: 248, max: 4 }} gap={5}>{courses.map((course) => <CourseTile key={course.id} course={course} headingLevel={2} rating={ratings.get(course.id)} />)}</Grid>
      ) : (
        <VStack gap={3} padding={8} className="academy-panel">
          <Heading level={2}>{q || type || topic ? 'No encontramos cursos con esos filtros' : 'Estamos preparando los próximos cursos'}</Heading>
          <Text as="p" color="secondary">{q || type || topic ? 'Prueba otro nombre o vuelve al catálogo completo.' : 'Los cursos publicados aparecerán aquí.'}</Text>
          {q || type || topic ? <Button as={Link} href={academyCatalogPath} label="Limpiar filtros" variant="secondary" className="w-fit" /> : null}
        </VStack>
      )}
    </VStack>
  );
}
