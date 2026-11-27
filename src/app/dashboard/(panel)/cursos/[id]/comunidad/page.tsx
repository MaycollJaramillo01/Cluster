import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Notice, PageTitle, Pill, SectionTitle, Tabs, btn, btnGhost, fieldClass, labelClass } from '@/components/dashboard/StaffUi';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { crm } from '@/lib/crm/db';
import { canDo } from '@/lib/crm/roles';
import { listLessonQuestions, listReviewsForModeration } from '@/lib/valux/course-community';
import { answerLessonQuestion, moderateCourseReview } from '@/lib/valux/community-actions';

const REVIEW: Record<string, { label: string; tone: 'ok' | 'wait' | 'off' }> = {
  publicada: { label: 'Publicada', tone: 'ok' },
  oculta: { label: 'Oculta', tone: 'off' },
};

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
    <VStack gap={8} className="mx-auto w-full max-w-5xl">
      <PageTitle back={{ href: base, label: String(course.title) }} eyebrow="Comunidad" title="Comunidad del curso" description="Responde las preguntas que dejan los alumnos en cada clase y modera las reseñas." />
      {resultado === 'error' ? <Notice tone="error">Comprueba el texto o vuelve a abrir el elemento. Su estado pudo haber cambiado.</Notice> : null}
      {resultado === 'ok' ? <Notice tone="ok">Respuesta guardada.</Notice> : null}
      {resultado === 'resena' ? <Notice tone="ok">Estado de la reseña actualizado.</Notice> : null}

      <VStack as="section" gap={4} aria-labelledby="bandeja">
        <SectionTitle id="bandeja" title="Preguntas por clase" />
        <Tabs label="Filtrar preguntas" items={['pendientes', 'respondidas'].map((value) => ({ href: `${base}/comunidad?filtro=${value}`, label: value === 'pendientes' ? 'Pendientes' : 'Respondidas', current: filter === value }))} />
        {questions.length ? (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {questions.map((item) => (
              <li key={item.id} className="space-y-4 p-4 sm:p-5">
                <VStack gap={1}>
                  <p className="break-words text-sm text-academy-muted">{item.lesson_title} · {item.student || 'Alumno'}</p>
                  <p className="whitespace-pre-wrap break-words font-semibold">{item.question}</p>
                </VStack>
                <form action={answerLessonQuestion} className="space-y-3">
                  <input type="hidden" name="course_id" value={id} />
                  <input type="hidden" name="question_id" value={item.id} />
                  <label className={labelClass}>Respuesta<textarea name="answer" required maxLength={4000} rows={3} className={fieldClass} defaultValue={item.answer} /></label>
                  <AcademySubmit label={item.answer ? 'Actualizar respuesta' : 'Responder'} pending="Guardando…" />
                </form>
              </li>
            ))}
          </ul>
        ) : <Empty title={`No hay preguntas ${filter}.`} />}
      </VStack>

      {canModerate ? (
        <VStack as="section" id="moderacion" gap={4} aria-labelledby="moderar">
          <SectionTitle id="moderar" title="Moderar reseñas" />
          {reviews.length ? (
            <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
              {reviews.map((review) => {
                const status = REVIEW[review.status] || { label: review.status, tone: 'wait' as const };
                return (
                  <li className="space-y-3 p-4 sm:p-5" key={review.person_id}>
                    <HStack gap={3} align="center" wrap="wrap">
                      <p className="break-words font-semibold">{review.student || 'Alumno'}</p>
                      <p className="text-sm text-academy-muted">{review.rating} de 5</p>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </HStack>
                    {review.body ? <p className="whitespace-pre-wrap break-words text-sm">{review.body}</p> : null}
                    <form action={moderateCourseReview} className="flex flex-wrap gap-2">
                      <input type="hidden" name="course_id" value={id} />
                      <input type="hidden" name="person_id" value={review.person_id} />
                      <input type="hidden" name="version" value={review.version} />
                      {review.status !== 'publicada' ? <button name="status" value="publicada" className={btn}>Publicar reseña</button> : null}
                      {review.status !== 'oculta' ? <button name="status" value="oculta" className={btnGhost}>Ocultar reseña</button> : null}
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : <Empty title="Aún no hay reseñas." />}
        </VStack>
      ) : null}
    </VStack>
  );
}
