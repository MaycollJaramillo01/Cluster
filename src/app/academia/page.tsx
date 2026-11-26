import type { Metadata } from 'next';
import { AcademyHome } from '@/components/academia/AcademyHome';
import { AcademyCatalog } from '@/components/academia/AcademyCatalog';
import { catalogCourseRatings, catalogSearchText, courseTopics, featuredCourseIds, matchesCourseTopic, selectFeatured } from '@/lib/valux/catalog';
import { site } from '@/lib/site';
import { myCourses, publishedCourses } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export const metadata: Metadata = {
  title: 'Academia Cluster | Cursos de marketing, diseño y tecnología',
  description: 'Explora los cursos de Academia Cluster y aprende a tu ritmo con clases, actividades y recursos para tu negocio.',
  alternates: { canonical: `${site.url}/academia` },
};

type CourseSearch = { error?: string; q?: string; tipo?: string; categoria?: string; vista?: string; orden?: string; duracion?: string; formato?: string };

export default async function AcademiaHomePage({ searchParams }: { searchParams: Promise<CourseSearch> }) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  const type = query.tipo === 'gratis' || query.tipo === 'pago' ? query.tipo : '';
  const topic = courseTopics.find((item) => item.id === query.categoria);
  const order = ['precio-asc', 'precio-desc', 'nombre'].includes(query.orden || '') ? query.orden! : 'relevancia';
  const duration = ['corta', 'larga'].includes(query.duracion || '') ? query.duracion! : '';
  const format = query.formato === 'lista' ? 'lista' : 'cuadricula';
  const isCatalog = Boolean(q || type || topic || query.vista === 'catalogo' || query.error || query.orden || query.duracion || query.formato);
  const [all, featuredConfig] = await Promise.all([publishedCourses(), featuredCourseIds()]);
  const featured = selectFeatured(all, featuredConfig);
  const topics = courseTopics.map((item) => ({ ...item, count: all.filter((course) => matchesCourseTopic(course, item)).length })).filter((item) => item.count);

  if (!isCatalog) {
    const freeCourse = all.find((course) => course.price_cents === 0 && course.slug === 'meta-ads-negocios-locales') ?? all.find((course) => course.price_cents === 0);
    const [ratings, enrolled] = await Promise.all([
      catalogCourseRatings([...new Set([...featured.map((course) => course.id), ...(freeCourse ? [freeCourse.id] : [])])]),
      academiaPersonId().then(myCourses),
    ]);
    const heroProgress = enrolled.find((course) => course.available && course.slug === (freeCourse ?? featured[0])?.slug);
    return <AcademyHome featured={featured} topics={topics} freeCourse={freeCourse} ratings={ratings} heroProgress={heroProgress} />;
  }

  const featuredIds = new Set(featured.map((course) => course.id));
  const ordered = [...featured, ...all.filter((course) => !featuredIds.has(course.id))];
  const search = catalogSearchText(q).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const courses = ordered.filter((course) => {
    if (type && (type === 'gratis' ? course.price_cents > 0 : course.price_cents === 0)) return false;
    if (topic && !matchesCourseTopic(course, topic)) return false;
    if (duration && (!course.minutes || (duration === 'corta' ? course.minutes > 120 : course.minutes <= 120))) return false;
    if (!search.length) return true;
    const labels = topics.filter((item) => matchesCourseTopic(course, item)).map((item) => item.label);
    const words = catalogSearchText([course.title, course.teacher_name, course.description, ...labels].join(' ')).split(/[^\p{L}\p{N}]+/u);
    return search.every((term) => words.some((word) => term.length <= 2 ? word === term : word.startsWith(term)));
  });
  if (order === 'precio-asc') courses.sort((a, b) => a.price_cents - b.price_cents);
  if (order === 'precio-desc') courses.sort((a, b) => b.price_cents - a.price_cents);
  if (order === 'nombre') courses.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  const ratings = await catalogCourseRatings(courses.map((course) => course.id));
  return <AcademyCatalog courses={courses} topics={topics} ratings={ratings} total={all.length} q={q} category={topic?.id || ''} price={type} order={order} duration={duration} format={format} error={query.error} />;
}
