'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { crm } from '@/lib/crm/db';
import { requireDashboard } from '@/lib/crm/session';
import { academiaPersonId } from './session';
import { lessonContext } from './lesson-progress';

export async function postLessonQuestion(form: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const lessonId = String(form.get('lesson_id') ?? '');
  const lesson = await lessonContext(lessonId, personId);
  if (!lesson?.active || !lesson.allowed) redirect(lesson?.url ?? '/academia');
  const question = String(form.get('question') ?? '').trim();
  if (question.length < 5 || question.length > 2000) redirect(`${lesson.url}?pregunta=error#preguntas`);
  const sql = await crm();
  await sql`INSERT INTO lms_lesson_questions (id, lesson_id, person_id, question)
    VALUES (${crypto.randomUUID()}, ${lessonId}, ${personId}, ${question})`;
  revalidatePath(lesson.url);
  revalidatePath(`/dashboard/cursos/${lesson.courseId}/comunidad`);
  redirect(`${lesson.url}?pregunta=ok#preguntas`);
}

export async function answerLessonQuestion(form: FormData) {
  const courseId = String(form.get('course_id') ?? '');
  const path = `/dashboard/cursos/${courseId}/comunidad`;
  const answer = String(form.get('answer') ?? '').trim();
  const { session, teacherId } = await requireCourseEditor(courseId);
  if (!answer || answer.length > 4000) redirect(`${path}?resultado=error`);
  const sql = await crm();
  const [row] = await sql`UPDATE lms_lesson_questions q SET answer = ${answer}, answered_at = now(), answered_by = ${session.email}
    FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
    WHERE q.id = ${String(form.get('question_id') ?? '')} AND q.lesson_id = l.id AND c.id = ${courseId}
      AND c.published AND (${teacherId}::text IS NULL OR c.teacher_id = ${teacherId})
    RETURNING c.slug AS course_slug, l.slug AS lesson_slug`;
  if (!row) redirect(`${path}?resultado=error`);
  revalidatePath(`/academia/${row.course_slug}/${row.lesson_slug}`);
  revalidatePath(path);
  redirect(`${path}?filtro=respondidas&resultado=ok`);
}

export async function saveCourseReview(form: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const slug = String(form.get('slug') ?? '');
  const rating = Number(form.get('rating'));
  const body = String(form.get('body') ?? '').trim();
  const path = `/academia/${encodeURIComponent(slug)}`;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || body.length > 1500) redirect(`${path}?resena=error#resenas`);
  const sql = await crm();
  const [row] = await sql`INSERT INTO lms_course_reviews (course_id, person_id, rating, body)
    SELECT c.id, e.person_id, ${rating}, ${body} FROM lms_courses c
    JOIN lms_enrollments e ON e.course_id = c.id AND e.person_id = ${personId}
    JOIN valux_people v ON v.id = e.person_id AND v.is_active
    WHERE c.slug = ${slug} AND c.published AND c.teacher_id IS DISTINCT FROM v.id
      AND EXISTS (SELECT FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
        WHERE p.person_id = v.id AND l.course_id = c.id AND p.completed_at IS NOT NULL)
    ON CONFLICT (course_id, person_id) DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body,
      status = 'pendiente', updated_at = now() RETURNING course_id`;
  if (!row) redirect(`${path}?resena=acceso#resenas`);
  revalidatePath(path);
  revalidatePath(`/dashboard/cursos/${row.course_id}/comunidad`);
  redirect(`${path}?resena=ok#resenas`);
}

export async function moderateCourseReview(form: FormData) {
  await requireDashboard('contenido');
  const courseId = String(form.get('course_id') ?? '');
  const status = String(form.get('status') ?? '');
  const version = String(form.get('version') ?? '');
  const path = `/dashboard/cursos/${courseId}/comunidad`;
  if (status !== 'publicada' && status !== 'oculta') redirect(`${path}?resultado=error#moderacion`);
  const sql = await crm();
  const [row] = await sql`UPDATE lms_course_reviews r SET status = ${status}, updated_at = now()
    FROM lms_courses c WHERE c.id = r.course_id AND c.id = ${courseId} AND c.published
      AND r.person_id = ${String(form.get('person_id') ?? '')} AND r.updated_at::text = ${version} RETURNING c.slug`;
  if (!row) redirect(`${path}?resultado=error#moderacion`);
  revalidatePath(`/academia/${row.slug}`);
  revalidatePath(path);
  redirect(`${path}?resultado=resena#moderacion`);
}
