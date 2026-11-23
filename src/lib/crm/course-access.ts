import { redirect } from 'next/navigation';
import { getPersonByEmail } from '@/lib/valux/data';
import { crm } from './db';
import { requireDashboard } from './session';

// Contenido edita cualquier curso; el profesor, solo los suyos (teacher_id = su persona).
export async function requireCourseEditor(courseId: string) {
  const session = await requireDashboard('curso');
  const teacher = session.role === 'profesor';
  if (!teacher) return { session, teacher, teacherId: null };
  const sql = await crm();
  const person = await getPersonByEmail(session.email);
  const rows = await sql`SELECT c.id FROM lms_courses c LEFT JOIN lms_courses original ON original.id = c.revision_of
    WHERE c.id = ${courseId} AND c.teacher_id = ${person?.id || ''}
      AND (c.revision_of IS NULL OR original.teacher_id = c.teacher_id)`;
  if (!rows.length) redirect('/dashboard/profesor');
  return { session, teacher, teacherId: person?.id ?? null };
}
