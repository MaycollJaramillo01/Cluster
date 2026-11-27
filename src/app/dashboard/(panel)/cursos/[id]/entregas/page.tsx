import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { formatDateTime } from '@/lib/crm/format';
import { getCourse } from '@/lib/crm/lms';
import { reviewAssignment } from '@/lib/valux/assignment-actions';
import { listCourseAssignments } from '@/lib/valux/assignments';
import { Empty, Notice, PageTitle, Pill, btn, btnGhost, fieldClass, labelClass } from '@/components/dashboard/StaffUi';

const statusLabels = {
  pendiente: { label: 'Pendiente de revisión', tone: 'wait' },
  aprobada: { label: 'Aprobada', tone: 'ok' },
  cambios: { label: 'Cambios solicitados', tone: 'bad' },
} as const;

export default async function CourseAssignmentsPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ leccion?: string; guardado?: string; error?: string }>;
}) {
  const { id } = await params;
  await requireCourseEditor(id);
  const query = await searchParams;
  const course = await getCourse(id);
  if (!course) notFound();
  const lesson = course.lessons.find((item) => item.id === query.leccion);
  if (query.leccion && !lesson) notFound();
  const submissions = await listCourseAssignments(id, lesson?.id);
  const base = `/dashboard/cursos/${id}`;
  const pending = submissions.filter((submission) => submission.status === 'pendiente').length;

  return (
    <VStack gap={6} className="mx-auto w-full max-w-5xl">
      <PageTitle
        back={lesson ? { href: `${base}/lecciones/${lesson.id}`, label: 'Volver a la clase' } : { href: `${base}?vista=temario#temario`, label: 'Volver al temario' }}
        eyebrow={course.course.title}
        title="Entregas de tareas"
        description={lesson ? `Clase: ${lesson.title}` : undefined}
      />

      <HStack gap={4} align="end" justify="between" wrap="wrap" className="academy-panel p-4 sm:p-5">
        <HStack gap={3} align="center" wrap="wrap">
          <p className="font-academy-heading text-2xl font-bold tabular-nums">{submissions.length}</p>
          <p className="text-sm text-academy-muted">{submissions.length === 1 ? 'entrega' : 'entregas'}</p>
          <Pill tone={pending ? 'wait' : 'off'}>{pending} {pending === 1 ? 'pendiente' : 'pendientes'}</Pill>
        </HStack>
        {course.lessons.length ? (
          <form action={`${base}/entregas`} method="get" className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:w-auto sm:min-w-80">
            <label className={labelClass}>
              Filtrar por clase
              <select name="leccion" className={fieldClass} defaultValue={lesson?.id || ''}>
                <option value="">Todas las clases</option>
                {course.lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>
            <button type="submit" className={btnGhost}>Filtrar</button>
          </form>
        ) : null}
      </HStack>

      {query.guardado === '1' ? <Notice tone="ok">Revisión guardada.</Notice> : null}
      {query.error === 'feedback' ? <Notice tone="error">Escribe qué debe corregir el alumno antes de solicitar cambios.</Notice> : null}
      {query.error === 'estado' ? <Notice tone="error">La entrega cambió antes de guardar la revisión. Comprueba la versión actual.</Notice> : null}
      {pending > 0 && !course.course.published ? <Notice>La revisión de entregas se reanudará cuando se publique el curso.</Notice> : null}

      {!submissions.length ? (
        <Empty title="Sin entregas">{lesson ? 'Todavía no hay respuestas guardadas para esta clase.' : 'Las respuestas de los alumnos aparecerán aquí al enviar sus tareas.'}</Empty>
      ) : (
        <VStack as="ol" gap={4}>
          {submissions.map((submission) => {
            const status = statusLabels[submission.status];
            const key = `${submission.lesson_id}:${submission.person_id}:${submission.attempt}`;
            return (
              <li key={key}>
                <article aria-labelledby={`entrega-${key}`} className="academy-panel overflow-hidden">
                  <HStack gap={3} justify="between" align="center" wrap="wrap" className="border-b border-academy-line p-4 sm:px-5">
                    <VStack gap={1} className="min-w-0">
                      <Heading id={`entrega-${key}`} level={2} className="break-words text-lg font-bold">{submission.student_name || 'Alumno'}</Heading>
                      <p className="break-words text-sm text-academy-muted">{submission.lesson_title} · Intento {submission.attempt} · {formatDateTime(submission.submitted_at)}</p>
                    </VStack>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </HStack>
                  <VStack gap={4} className="p-4 sm:px-5">
                    <VStack as="section" gap={2} aria-label="Respuesta del alumno">
                      <Heading level={3} className="text-sm font-bold">Respuesta</Heading>
                      <p className="whitespace-pre-wrap break-words rounded-academy bg-academy-page p-4 text-sm leading-relaxed">{submission.response}</p>
                    </VStack>
                    {submission.feedback ? (
                      <VStack as="section" gap={2} aria-label="Observaciones" className="border-t border-academy-line pt-4">
                        <Heading level={3} className="text-sm font-bold">Observaciones</Heading>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{submission.feedback}</p>
                      </VStack>
                    ) : null}
                    {submission.status === 'pendiente' && course.course.published ? (
                      <form action={reviewAssignment} className="space-y-3 border-t border-academy-line pt-4">
                        <input type="hidden" name="course_id" value={id} />
                        <input type="hidden" name="lesson_id" value={submission.lesson_id} />
                        <input type="hidden" name="person_id" value={submission.person_id} />
                        <input type="hidden" name="attempt" value={submission.attempt} />
                        <VStack gap={1}>
                          <label className={labelClass}>
                            Observaciones de la revisión
                            <textarea className={fieldClass} name="feedback" rows={3} maxLength={4000} required />
                          </label>
                          <small className="text-xs text-academy-muted">Solo se requieren si solicitas cambios.</small>
                        </VStack>
                        <HStack gap={3} wrap="wrap">
                          <button name="decision" value="approve" type="submit" formNoValidate className={btn}>Aprobar entrega</button>
                          <button name="decision" value="changes" type="submit" className={btnGhost}>Solicitar cambios</button>
                        </HStack>
                      </form>
                    ) : null}
                  </VStack>
                </article>
              </li>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}
