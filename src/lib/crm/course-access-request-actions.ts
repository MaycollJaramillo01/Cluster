'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCourseEditor } from './course-access';
import { crm } from './db';
import { requireDashboard } from './session';

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function requestCourseAccessChange(form: FormData) {
  const courseId = field(form, 'course_id');
  if (!courseId) return;
  const { teacherId } = await requireCourseEditor(courseId);
  const back = `/dashboard/cursos/${encodeURIComponent(courseId)}?vista=alumnos`;
  if (!teacherId) redirect(back);
  const personId = field(form, 'person_id');
  const action = field(form, 'action');
  const reason = field(form, 'reason');
  if (!personId || !['pause', 'resume'].includes(action) || !reason || reason.length > 1000) {
    redirect(`${back}&error=solicitud-acceso`);
  }
  const sql = await crm();
  const rows = await sql`
    INSERT INTO lms_course_access_requests (course_id, person_id, request_id, action, status, reason, requested_by)
    SELECT c.id, e.person_id, ${crypto.randomUUID()}, ${action}, 'pending', ${reason}, ${teacherId}
    FROM lms_courses c JOIN lms_enrollments e ON e.course_id = c.id
    WHERE c.id = ${courseId} AND c.teacher_id = ${teacherId} AND c.published AND c.revision_of IS NULL
      AND e.person_id = ${personId}
      AND (${action} = 'pause' OR EXISTS (
        SELECT FROM lms_course_access_requests r WHERE r.course_id = c.id AND r.person_id = e.person_id AND r.paused
      ))
    ON CONFLICT (course_id, person_id) DO UPDATE SET request_id = EXCLUDED.request_id,
      action = EXCLUDED.action, reason = EXCLUDED.reason, requested_by = EXCLUDED.requested_by,
      status = 'pending', requested_at = now(), reviewed_by = NULL, reviewed_at = NULL
    WHERE lms_course_access_requests.status <> 'pending'
      AND lms_course_access_requests.paused = (${action} = 'resume')
    RETURNING request_id
  `;
  revalidatePath('/dashboard/cursos');
  redirect(`${back}&${rows.length ? 'guardado=solicitud-acceso' : 'error=estado-acceso'}`);
}

export async function resolveCourseAccessChange(form: FormData) {
  const reviewer = await requireDashboard('contenido');
  const courseId = field(form, 'course_id');
  const personId = field(form, 'person_id');
  const requestId = field(form, 'request_id');
  const decision = field(form, 'decision');
  if (!courseId || !personId || !requestId || !['approved', 'rejected'].includes(decision)) return;
  const sql = await crm();
  const rows = await sql`
    UPDATE lms_course_access_requests r SET status = ${decision}, reviewed_by = ${reviewer.email}, reviewed_at = now(),
      paused = CASE WHEN ${decision} = 'approved' THEN r.action = 'pause' ELSE r.paused END
    WHERE r.course_id = ${courseId} AND r.person_id = ${personId} AND r.request_id = ${requestId}
      AND r.status = 'pending'
      AND (${decision} = 'rejected' OR EXISTS (
        SELECT FROM lms_enrollments e WHERE e.course_id = r.course_id AND e.person_id = r.person_id
      ))
    RETURNING request_id
  `;
  revalidatePath('/dashboard/cursos');
  redirect(`/dashboard/cursos/${encodeURIComponent(courseId)}?vista=alumnos&${rows.length ? 'guardado=solicitud-resuelta' : 'error=estado-acceso'}`);
}
