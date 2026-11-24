import { crm } from '@/lib/crm/db';

export const FEATURED_KEY = 'academia_featured_courses';

export const courseTopics = [
  { id: 'marketing', label: 'Marketing digital', icon: 'megaphone', match: /\b(marketing|publicidad|meta ads|facebook|instagram|seo|campanas)\b/ },
  { id: 'diseno', label: 'Diseño y contenido', icon: 'pen', match: /\b(diseno|canva|contenido|branding|fotografia|edicion)\b/ },
  { id: 'ventas', label: 'Ventas y negocios', icon: 'chart', match: /\b(ventas|whatsapp|emprendimiento|negociacion|comercio|ecommerce)\b/ },
  { id: 'tecnologia', label: 'IA y tecnología', icon: 'sparkles', match: /\b(ia|inteligencia artificial|automatizacion|chatgpt|tecnologia|programacion|web|software)\b/ },
] as const;

export function catalogSearchText(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
}

export function matchesCourseTopic(course: { slug: string; title: string }, topic: (typeof courseTopics)[number]) {
  return topic.match.test(catalogSearchText(`${course.slug.replace(/-/g, ' ')} ${course.title}`));
}

export async function catalogCourseRatings(courseIds: string[]) {
  if (!courseIds.length) return new Map<string, { average: number; count: number }>();
  const sql = await crm();
  const rows = await sql`SELECT r.course_id, COUNT(*)::int AS count, ROUND(AVG(r.rating), 1) AS average
    FROM lms_course_reviews r JOIN valux_people v ON v.id = r.person_id AND v.is_active
    JOIN lms_enrollments e ON e.course_id = r.course_id AND e.person_id = r.person_id
    WHERE r.course_id = ANY(${courseIds}) AND r.status = 'publicada'
    GROUP BY r.course_id`;
  return new Map(rows.map((row) => [String(row.course_id), { average: Number(row.average), count: Number(row.count) }]));
}

export async function featuredCourseIds(): Promise<string[] | null> {
  const sql = await crm();
  const rows = await sql`SELECT value FROM crm_meta WHERE key = ${FEATURED_KEY}`;
  if (!rows.length) return null;
  try {
    const ids: unknown = JSON.parse(String(rows[0].value));
    return Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === 'string'))].slice(0, 4) : [];
  } catch { return []; }
}

export function selectFeatured<T extends { id: string }>(courses: T[], ids: string[] | null): T[] {
  if (ids === null) return courses.slice(0, 4);
  return [...new Set(ids)].slice(0, 4).flatMap((id) => {
    const course = courses.find((item) => item.id === id);
    return course ? [course] : [];
  });
}
