import { crm } from './db';

export async function getReportCourse(courseId: string) {
  const sql = await crm();
  const [course] = await sql`SELECT title FROM lms_courses WHERE id = ${courseId} AND published AND revision_of IS NULL`;
  return course;
}

export async function courseLessonReports(courseId: string) {
  const sql = await crm();
  return sql`
    WITH lessons AS (
      SELECT l.id, l.title, l.sort_order, l.mission, s.sort_order AS section_order, s.title AS section,
        c.teacher_id
      FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
      LEFT JOIN lms_sections s ON s.id = l.section_id
      WHERE l.course_id = ${courseId} AND c.published
    ), starts AS (
      SELECT l.id AS lesson_id, e.person_id, MIN(e.created_at) AS first_started
      FROM lessons l JOIN academia_events e ON e.data::jsonb ->> 'lesson' = l.id AND e.name = 'lesson_started'
      JOIN valux_people v ON v.id = e.person_id AND v.role <> 'junta'
      WHERE e.person_id IS DISTINCT FROM l.teacher_id GROUP BY l.id, e.person_id
    ), activity AS (
      SELECT lesson_id, COUNT(*) AS started, COUNT(*) FILTER (
        WHERE s.first_started <= now() - INTERVAL '7 days'
          AND NOT EXISTS (SELECT FROM lms_progress p WHERE p.person_id = s.person_id
            AND p.lesson_id = s.lesson_id AND p.completed_at IS NOT NULL)
      ) AS stalled
      FROM starts s GROUP BY lesson_id
    ), completions AS (
      SELECT l.id, COUNT(*) AS finished FROM lessons l JOIN lms_progress p ON p.lesson_id = l.id
      LEFT JOIN valux_people v ON v.id = p.person_id
      WHERE (p.person_id IS NULL OR p.person_id IS DISTINCT FROM l.teacher_id)
        AND COALESCE(v.role, '') <> 'junta' AND p.completed_at IS NOT NULL
      GROUP BY l.id
    ), quiz_attempts AS (
      SELECT l.id, e.person_id, (e.data::jsonb ->> 'correct')::numeric AS correct,
        (e.data::jsonb ->> 'total')::numeric AS total
      FROM lessons l JOIN academia_events e ON e.data::jsonb ->> 'lesson' = l.id AND e.name = 'mission_submitted'
      JOIN valux_people v ON v.id = e.person_id AND v.role <> 'junta'
      WHERE e.person_id IS DISTINCT FROM l.teacher_id AND (
        e.data::jsonb ->> 'kind' = 'quiz' OR
        (e.data::jsonb ->> 'kind' IS NULL AND btrim(COALESCE(l.mission, '')) <> '' AND ltrim(l.mission) NOT LIKE '[%')
      ) AND jsonb_typeof(e.data::jsonb -> 'total') = 'number' AND jsonb_typeof(e.data::jsonb -> 'correct') = 'number'
    ), quizzes AS (
      SELECT id, COUNT(*) AS attempts, COUNT(DISTINCT person_id) AS participants,
        COUNT(DISTINCT person_id) FILTER (WHERE correct = total) AS passed,
        ROUND(AVG(CASE WHEN total > 0 THEN 100 * correct / total END)) AS average
      FROM quiz_attempts WHERE total > 0 GROUP BY id
    )
    SELECT l.id, l.title, l.section, l.mission, COALESCE(a.started, 0)::int AS started,
      COALESCE(c.finished, 0)::int AS finished, COALESCE(a.stalled, 0)::int AS stalled,
      COALESCE(q.attempts, 0)::int AS attempts, COALESCE(q.participants, 0)::int AS participants,
      COALESCE(q.passed, 0)::int AS passed, q.average::int
    FROM lessons l LEFT JOIN activity a ON a.lesson_id = l.id LEFT JOIN completions c ON c.id = l.id
    LEFT JOIN quizzes q ON q.id = l.id
    ORDER BY l.section_order NULLS LAST, l.section, l.sort_order, l.title, l.id
  `;
}

export async function courseStudentProgress(courseId: string) {
  const sql = await crm();
  return sql`
    WITH lessons AS (SELECT id FROM lms_lessons WHERE course_id = ${courseId}),
    students AS (
      SELECT e.person_id, CASE WHEN e.person_id IS NULL THEN e.contact_id END AS contact_id,
        MIN(e.created_at) AS enrolled
      FROM lms_enrollments e JOIN lms_courses c ON c.id = e.course_id
      LEFT JOIN valux_people v ON v.id = e.person_id
      WHERE e.course_id = ${courseId} AND c.published AND (e.person_id IS NOT NULL OR e.contact_id IS NOT NULL)
        AND (e.person_id IS NULL OR e.person_id IS DISTINCT FROM c.teacher_id) AND COALESCE(v.role, '') <> 'junta'
      GROUP BY 1, 2
    )
    SELECT COALESCE(NULLIF(v.name, ''), NULLIF(c.name, ''), 'Alumno') AS student, s.enrolled::date::text AS enrolled,
      (SELECT count(*) FROM lessons)::int AS lessons,
      COUNT(DISTINCT p.lesson_id) FILTER (WHERE p.completed_at IS NOT NULL)::int AS completed,
      MAX(p.completed_at)::date::text AS last_completion
    FROM students s LEFT JOIN valux_people v ON v.id = s.person_id LEFT JOIN contacts c ON c.id = s.contact_id
    LEFT JOIN lms_progress p ON (p.person_id = s.person_id OR (p.person_id IS NULL AND p.contact_id = s.contact_id))
      AND p.lesson_id IN (SELECT id FROM lessons)
    GROUP BY s.person_id, s.contact_id, v.id, c.id, s.enrolled ORDER BY student, enrolled
  `;
}

export function progressCsv(rows: Awaited<ReturnType<typeof courseStudentProgress>>) {
  const header = ['Alumno', 'Fecha de inscripción', 'Clases completadas', 'Clases del curso', 'Avance (%)', 'Última clase completada'];
  const lines = rows.map((row) => [
    row.student, row.enrolled, row.completed, row.lessons,
    row.lessons ? Math.round(100 * row.completed / row.lessons) : 0, row.last_completion,
  ]);
  return '\uFEFF' + [header, ...lines].map((line) => line.map((value) => {
    const raw = String(value ?? '');
    const safe = /^\s*[=+@-]|^[\t\r\n]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n') + '\r\n';
}
