import { crm } from '@/lib/crm/db';
import { canReadCourse, canReadProduct, getProduct, lessonAccess, publishedCourse } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { deliverAcademiaAsset, deliverTextTemplate, TEXT_TEMPLATE_KIND } from '@/lib/valux/upload';

const unavailable = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const personId = await academiaPersonId();
  const origin = new URL(request.url).origin;
  if (kind === 'producto') {
    const product = await getProduct(id);
    if (!product?.download_url || product.review_status !== 'publicado' || !(await canReadProduct(personId, product))) return unavailable();
    return deliverAcademiaAsset(product.download_url, origin);
  }
  if (kind !== 'recurso') return unavailable();
  const sql = await crm();
  const [resource] = await sql`
    SELECT r.url, r.kind, r.content, r.title, l.id AS lesson_id, c.slug AS course_slug
    FROM lms_resources r JOIN lms_lessons l ON l.id = r.lesson_id
    JOIN lms_courses c ON c.id = l.course_id
    WHERE r.id = ${id} AND c.published
  `;
  if (!resource || (!resource.url && resource.kind !== TEXT_TEMPLATE_KIND)) return unavailable();
  const course = await publishedCourse(String(resource.course_slug));
  if (!course || !(await canReadCourse(personId, course))) return unavailable();
  const access = await lessonAccess(personId, course);
  if (!access.unlocked.has(String(resource.lesson_id))) return unavailable();
  if (resource.kind === TEXT_TEMPLATE_KIND) return access.person?.is_active && resource.content
    ? deliverTextTemplate(String(resource.content), String(resource.title)) : unavailable();
  return deliverAcademiaAsset(String(resource.url), origin);
}
