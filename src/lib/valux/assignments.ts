import { crm } from '@/lib/crm/db';

export type AssignmentStatus = 'pendiente' | 'cambios' | 'aprobada';
type Submission = { response: string; status: AssignmentStatus; feedback: string; submitted_at: string; attempt: number };

export async function getAssignmentSubmission(lessonId: string, personId: string) {
  if (!personId) return null;
  const sql = await crm();
  const [submission] = await sql`
    SELECT response, status, feedback, submitted_at, attempt FROM lms_assignment_submissions
    WHERE lesson_id = ${lessonId} AND person_id = ${personId}
  `;
  return (submission as Submission | undefined) ?? null;
}

export async function listCourseAssignments(courseId: string, lessonId?: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT a.lesson_id, l.title AS lesson_title, a.person_id, v.name AS student_name, v.email AS student_email,
      a.response, a.status, a.feedback, a.submitted_at, a.attempt
    FROM lms_assignment_submissions a JOIN lms_lessons l ON l.id = a.lesson_id
    JOIN valux_people v ON v.id = a.person_id
    WHERE l.course_id = ${courseId} AND (${lessonId || ''} = '' OR a.lesson_id = ${lessonId || ''})
    ORDER BY (a.status = 'pendiente') DESC, a.submitted_at DESC, a.lesson_id, a.person_id
  `;
  return rows as (Submission & {
    lesson_id: string; lesson_title: string; person_id: string; student_name: string; student_email: string;
  })[];
}
