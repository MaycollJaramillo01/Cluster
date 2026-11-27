import { crm } from './db';

export async function courseAccessPaused(personId: string, courseId: string) {
  if (!personId) return false;
  const sql = await crm();
  const [row] = await sql`SELECT 1 FROM lms_course_access_requests
    WHERE course_id = ${courseId} AND person_id = ${personId} AND paused`;
  return Boolean(row);
}

export async function courseAccessRequests(courseId: string) {
  const sql = await crm();
  return sql`SELECT person_id, paused, request_id, action, status, reason
    FROM lms_course_access_requests WHERE course_id = ${courseId}`;
}

export async function pendingCourseAccessCounts() {
  const sql = await crm();
  return sql`SELECT r.course_id, count(*)::int AS pending FROM lms_course_access_requests r
    JOIN lms_enrollments e ON e.course_id = r.course_id AND e.person_id = r.person_id
    WHERE r.status = 'pending' GROUP BY r.course_id`;
}
