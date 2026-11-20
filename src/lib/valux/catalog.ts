import { crm } from '@/lib/crm/db';

export const FEATURED_KEY = 'academia_featured_courses';

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
