import { crm } from '@/lib/crm/db';

export async function getLessonQuestions(lessonId: string, personId: string) {
  const sql = await crm();
  return sql`SELECT id, question, answer FROM lms_lesson_questions
    WHERE lesson_id = ${lessonId} AND person_id = ${personId} ORDER BY created_at DESC LIMIT 100`;
}

export async function getCourseReviews(courseId: string, personId: string) {
  const sql = await crm();
  const [summary, reviews, own, eligibility] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count, ROUND(AVG(r.rating), 1) AS average
      FROM lms_course_reviews r JOIN valux_people v ON v.id = r.person_id AND v.is_active
      JOIN lms_enrollments e ON e.course_id = r.course_id AND e.person_id = r.person_id
      WHERE r.course_id = ${courseId} AND r.status = 'publicada'`,
    sql`SELECT r.rating, r.body FROM lms_course_reviews r JOIN valux_people v ON v.id = r.person_id AND v.is_active
      JOIN lms_enrollments e ON e.course_id = r.course_id AND e.person_id = r.person_id
      WHERE r.course_id = ${courseId} AND r.status = 'publicada' ORDER BY r.updated_at DESC, r.person_id LIMIT 20`,
    personId ? sql`SELECT rating, body, status FROM lms_course_reviews WHERE course_id = ${courseId} AND person_id = ${personId}` : [],
    personId ? sql`SELECT e.id FROM lms_enrollments e JOIN valux_people v ON v.id = e.person_id AND v.is_active
      JOIN lms_courses c ON c.id = e.course_id AND c.teacher_id IS DISTINCT FROM v.id
      WHERE e.course_id = ${courseId} AND e.person_id = ${personId}
        AND EXISTS (SELECT FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
          WHERE p.person_id = v.id AND l.course_id = c.id AND p.completed_at IS NOT NULL)` : [],
  ]);
  return { count: Number(summary[0]?.count ?? 0), average: Number(summary[0]?.average ?? 0), reviews, own: own[0], eligible: eligibility.length > 0 };
}

export async function listLessonQuestions(courseId: string, filter: string) {
  const sql = await crm();
  return sql`SELECT q.id, q.question, q.answer, l.title AS lesson_title, p.name AS student
    FROM lms_lesson_questions q JOIN lms_lessons l ON l.id = q.lesson_id JOIN valux_people p ON p.id = q.person_id
    WHERE l.course_id = ${courseId} AND (q.answered_at IS NOT NULL) = ${filter === 'respondidas'}
    ORDER BY q.created_at DESC, q.id LIMIT 100`;
}

export async function listReviewsForModeration(courseId: string) {
  const sql = await crm();
  return sql`SELECT r.person_id, r.rating, r.body, r.status, r.updated_at::text AS version, p.name AS student
    FROM lms_course_reviews r JOIN valux_people p ON p.id = r.person_id WHERE r.course_id = ${courseId}
    ORDER BY (r.status = 'pendiente') DESC, r.updated_at DESC LIMIT 100`;
}
