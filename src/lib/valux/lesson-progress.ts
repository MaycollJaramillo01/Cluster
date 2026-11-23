import { crm } from '@/lib/crm/db';
import { canReadCourse, lessonAccess, publishedCourse } from './data';
import { parseMission } from './mission';

export async function lessonContext(lessonId: string, personId: string) {
  const sql = await crm();
  const [row] = await sql`
    SELECT l.slug AS lesson_slug, l.points, l.mission, c.slug AS course_slug
    FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
    WHERE l.id = ${lessonId}
  `;
  if (!row) return null;
  const course = await publishedCourse(String(row.course_slug));
  if (!course) return null;
  const url = `/academia/${course.slug}/${row.lesson_slug}`;
  const [open, access] = await Promise.all([canReadCourse(personId, course), lessonAccess(personId, course)]);
  const index = access.order.findIndex((lesson) => lesson.id === lessonId);
  const next = access.order[index + 1] || access.order.find((item) => item.id !== lessonId && !access.done.has(item.id));
  return {
    url,
    nextUrl: next ? `/academia/${course.slug}/${next.slug}` : `/academia/${course.slug}?terminado=1`,
    courseId: course.id,
    free: course.price_cents <= 0,
    allowed: open && access.unlocked.has(lessonId),
    active: access.person?.is_active === true,
    done: access.done.has(lessonId),
    points: Math.max(0, Number(row.points) || 0),
    mission: parseMission(String(row.mission || '')).mission,
    rawMission: String(row.mission || ''),
  };
}
