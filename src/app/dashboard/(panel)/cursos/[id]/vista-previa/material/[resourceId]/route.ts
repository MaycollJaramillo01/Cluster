import { requireCourseEditor } from '@/lib/crm/course-access';
import { crm } from '@/lib/crm/db';
import { deliverAcademiaAsset } from '@/lib/valux/upload';

export async function GET(request: Request, context: { params: Promise<{ id: string; resourceId: string }> }) {
  const { id, resourceId } = await context.params;
  await requireCourseEditor(id);
  const sql = await crm();
  const [resource] = await sql`SELECT r.url FROM lms_resources r JOIN lms_lessons l ON l.id = r.lesson_id
    WHERE r.id = ${resourceId} AND l.course_id = ${id}`;
  if (!resource?.url) return new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  return deliverAcademiaAsset(String(resource.url), new URL(request.url).origin);
}
