import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { courseField, courseLabel } from '@/components/dashboard/TeacherCourseForm';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { crm } from '@/lib/crm/db';
import { canDo } from '@/lib/crm/roles';
import { listLessonQuestions, listReviewsForModeration } from '@/lib/valux/course-community';
import { answerLessonQuestion, moderateCourseReview } from '@/lib/valux/community-actions';

export default async function CourseCommunity({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filtro?: string; resultado?: string }>;
}) {
  const { id } = await params;
  const { filtro, resultado } = await searchParams;
  const { session } = await requireCourseEditor(id);
  const sql = await crm();
  const [course] = await sql`SELECT title FROM lms_courses WHERE id = ${id} AND published`;
  if (!course) notFound();
  const filter = filtro === 'respondidas' ? 'respondidas' : 'pendientes';
  const canModerate = canDo(session.role, 'contenido');
  const [questions, reviews] = await Promise.all([
    listLessonQuestions(id, filter),
    canModerate ? listReviewsForModeration(id) : [],
  ]);
  const base = `/dashboard/cursos/${id}`;
  return (
    <VStack as="section" aria-labelledby="curso-comunidad" gap={5} className="mx-auto w-full max-w-5xl [color-scheme:light]">
      <Link href={base} className="text-sm font-medium underline">← {course.title}</Link>
      <Heading id="curso-comunidad" level={1} className="font-brand text-3xl font-semibold">Comunidad del curso</Heading>
      {resultado === 'error' ? <p role="alert" className="text-sm text-red-800">Comprueba el texto o vuelve a abrir el elemento. Su estado pudo haber cambiado.</p> : null}
      {resultado === 'ok' ? <p role="status" className="text-sm font-semibold">Respuesta guardada.</p> : null}
      {resultado === 'resena' ? <p role="status" className="text-sm font-semibold">Estado de la reseña actualizado.</p> : null}
      <section aria-labelledby="bandeja" className="space-y-4">
        <h2 id="bandeja" className="text-xl font-semibold">Preguntas por lección</h2>
        <nav aria-label="Filtrar preguntas" className="flex flex-wrap gap-2">
          {['pendientes', 'respondidas'].map((value) => <Link key={value} aria-current={filter === value ? 'page' : undefined} href={`${base}/comunidad?filtro=${value}`} className={`inline-flex min-h-11 items-center border border-black/15 px-3 text-sm capitalize ${filter === value ? 'bg-ink font-semibold text-white' : 'bg-white'}`}>{value}</Link>)}
        </nav>
        {questions.length ? <ul className="divide-y divide-black/10 border border-black/10 bg-white">
          {questions.map((item) => <li key={item.id} className="space-y-3 p-4">
            <p className="break-words text-sm text-black/70">{item.lesson_title} · {item.student || 'Alumno'}</p>
            <p className="whitespace-pre-wrap break-words font-medium">{item.question}</p>
            <form action={answerLessonQuestion} className="space-y-3">
              <input type="hidden" name="course_id" value={id} />
              <input type="hidden" name="question_id" value={item.id} />
              <label className={courseLabel}>Respuesta<textarea name="answer" required maxLength={4000} rows={3} className={courseField} defaultValue={item.answer} /></label>
              <SubmitButton pending="Guardando…" className="sm:w-auto">{item.answer ? 'Actualizar respuesta' : 'Responder'}</SubmitButton>
            </form>
          </li>)}
        </ul> : <p className="border border-black/10 bg-white p-4 text-sm">No hay preguntas {filter}.</p>}
      </section>
      {canModerate ? (
        <section id="moderacion" className="space-y-4">
          <h2 className="text-xl font-semibold">Moderar reseñas</h2>
          {reviews.length ? <ul className="divide-y divide-black/10 border border-black/10 bg-white">
            {reviews.map((review) => <li className="space-y-3 p-4" key={review.person_id}>
              <p className="break-words text-sm font-semibold">{review.student || 'Alumno'} · {review.rating} de 5 · {review.status}</p>
              {review.body ? <p className="whitespace-pre-wrap break-words text-sm">{review.body}</p> : null}
              <form action={moderateCourseReview} className="flex flex-wrap gap-2">
                <input type="hidden" name="course_id" value={id} />
                <input type="hidden" name="person_id" value={review.person_id} />
                <input type="hidden" name="version" value={review.version} />
                {review.status !== 'publicada' ? <button name="status" value="publicada" className="min-h-11 bg-brand px-4 text-sm font-semibold">Publicar reseña</button> : null}
                {review.status !== 'oculta' ? <button name="status" value="oculta" className="min-h-11 border border-black/20 px-4 text-sm font-semibold">Ocultar reseña</button> : null}
              </form>
            </li>)}
          </ul> : <p className="border border-black/10 bg-white p-4 text-sm">Aún no hay reseñas.</p>}
        </section>
      ) : null}
    </VStack>
  );
}
