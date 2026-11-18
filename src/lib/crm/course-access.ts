import { redirect } from 'next/navigation';
import { getPersonByEmail } from '@/lib/valux/data';
import { crm } from './db';
import { requireDashboard } from './session';

// Contenido edita cualquier curso; el profesor, solo los suyos (teacher_id = su persona).
export async function requireCourseEditor(courseId: string) {
  const session = await requireDashboard('curso');
  const teacher = session.role === 'profesor';
  if (!teacher) return { session, teacher };
  const sql = await crm();
  const person = await getPersonByEmail(session.email);
  const rows = await sql`SELECT id FROM lms_courses WHERE id = ${courseId} AND teacher_id = ${person?.id || ''}`;
  if (!rows.length) redirect('/dashboard/profesor');
  return { session, teacher };
}
