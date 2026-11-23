'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { crm } from '@/lib/crm/db';
import { academiaPersonId } from './session';
import { lessonContext } from './lesson-progress';
import { trackEvent } from './events';

function read(form: FormData, name: string) {
  return String(form.get(name) ?? '').trim();
}

export async function submitAssignment(form: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const lessonId = read(form, 'lesson_id');
  const lesson = await lessonContext(lessonId, personId);
  if (!lesson) redirect('/academia');
  if (lesson.mission?.kind !== 'assignment' || !lesson.allowed || lesson.done || !lesson.active) redirect(lesson.url);
  const response = read(form, 'response');
  const attempt = Number(read(form, 'attempt'));
  if (!response || response.length > 12000 || !Number.isInteger(attempt) || attempt < 0 || attempt >= 2147483647) {
    redirect(`${lesson.url}?mision=respuesta#mision`);
  }
  const sql = await crm();
  const [saved] = await sql`
    INSERT INTO lms_assignment_submissions (lesson_id, person_id, response)
    SELECT l.id, ${personId}, ${response} FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
    WHERE l.id = ${lessonId} AND c.published AND l.mission = ${lesson.rawMission}
      AND (${attempt}::integer = 0 OR EXISTS (SELECT FROM lms_assignment_submissions
        WHERE lesson_id = ${lessonId} AND person_id = ${personId} AND attempt = ${attempt}))
    ON CONFLICT (lesson_id, person_id) DO UPDATE SET response = EXCLUDED.response, status = 'pendiente',
      submitted_at = now(), reviewed_at = NULL, reviewed_by = NULL, attempt = lms_assignment_submissions.attempt + 1
    WHERE lms_assignment_submissions.status = 'cambios' AND lms_assignment_submissions.attempt = ${attempt}
    RETURNING attempt
  `;
  if (!saved) redirect(`${lesson.url}#mision`);
  await trackEvent('mission_submitted', { id: `assignment_submitted:${personId}:${lessonId}:${saved.attempt}`, personId, data: { lesson: lessonId, kind: 'tarea' } });
  revalidatePath('/dashboard', 'layout');
  revalidatePath(lesson.url);
  redirect(`${lesson.url}#mision`);
}

export async function reviewAssignment(form: FormData) {
  const courseId = read(form, 'course_id');
  const lessonId = read(form, 'lesson_id');
  const personId = read(form, 'person_id');
  const attempt = Number(read(form, 'attempt'));
  const decision = read(form, 'decision');
  const feedback = read(form, 'feedback');
  const { session, teacherId } = await requireCourseEditor(courseId);
  const path = `/dashboard/cursos/${courseId}/entregas?leccion=${encodeURIComponent(lessonId)}`;
  if (feedback.length > 4000 || (decision === 'changes' && !feedback)) redirect(`${path}&error=feedback`);
  if (!personId || !lessonId || !Number.isInteger(attempt) || attempt < 1 || attempt >= 2147483647 || !['approve', 'changes'].includes(decision)) redirect(`${path}&error=estado`);
  const approval = decision === 'approve';
  const sql = await crm();
  const [reviewed] = await sql`
    WITH reviewed AS (
      UPDATE lms_assignment_submissions a SET status = ${approval ? 'aprobada' : 'cambios'},
        feedback = ${feedback}, reviewed_at = now(), reviewed_by = ${session.email}
      FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
      WHERE a.lesson_id = l.id AND l.id = ${lessonId} AND c.id = ${courseId} AND c.published
        AND (${teacherId}::text IS NULL OR c.teacher_id = ${teacherId})
        AND lower(btrim(split_part(l.mission, chr(10), 1), chr(13))) = '[tarea]'
        AND a.person_id = ${personId} AND a.status = 'pendiente' AND a.attempt = ${attempt}
      RETURNING l.id AS lesson_id, a.person_id, c.id AS course_id, c.price_cents, l.points
    ), enrolled AS (
      INSERT INTO lms_enrollments (id, course_id, person_id)
      SELECT ${crypto.randomUUID()}, course_id, person_id FROM reviewed WHERE ${approval}::boolean AND price_cents <= 0
      ON CONFLICT (course_id, person_id) WHERE person_id IS NOT NULL DO NOTHING
    ), completed AS (
      INSERT INTO lms_progress (id, person_id, lesson_id, completed_at, graded_at, score)
      SELECT ${crypto.randomUUID()}, person_id, lesson_id, now(), now(), 100 FROM reviewed WHERE ${approval}::boolean
      ON CONFLICT (person_id, lesson_id) WHERE person_id IS NOT NULL DO UPDATE SET
        completed_at = COALESCE(lms_progress.completed_at, EXCLUDED.completed_at), graded_at = EXCLUDED.graded_at, score = EXCLUDED.score
    ), awarded AS (
      INSERT INTO lms_xp (person_id, lesson_id, xp)
      SELECT person_id, lesson_id, GREATEST(points, 0) FROM reviewed WHERE ${approval}::boolean
      ON CONFLICT (person_id, lesson_id) DO NOTHING
    )
    SELECT points FROM reviewed
  `;
  if (!reviewed) redirect(`${path}&error=estado`);
  if (approval) {
    await trackEvent('lesson_completed', { id: `lesson_completed:${personId}:${lessonId}`, personId, data: { lesson: lessonId } });
    await trackEvent('mission_validated', { id: `mission_validated:${personId}:${lessonId}`, personId, data: { lesson: lessonId, xp: Number(reviewed.points) } });
  }
  revalidatePath('/academia', 'layout');
  revalidatePath('/dashboard', 'layout');
  redirect(`${path}&guardado=1`);
}
