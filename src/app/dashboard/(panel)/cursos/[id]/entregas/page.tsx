import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { formatDateTime } from '@/lib/crm/format';
import { getCourse } from '@/lib/crm/lms';
import { reviewAssignment } from '@/lib/valux/assignment-actions';
import { listCourseAssignments } from '@/lib/valux/assignments';

const field = 'min-h-11 w-full border border-black/25 bg-white px-3 py-2 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';
const button = 'inline-flex min-h-11 items-center justify-center border px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';
const statusLabels = {
  pendiente: 'Pendiente de revisión',
  aprobada: 'Aprobada',
  cambios: 'Cambios solicitados',
};

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
    <main className="mx-auto w-full max-w-5xl [color-scheme:light]">
      <VStack gap={5}>
        <header className="space-y-2 border-b border-black/15 pb-5">
          <Link href={lesson ? `${base}/lecciones/${lesson.id}` : `${base}?vista=temario#temario`} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
            ← {lesson ? 'Volver a la clase' : 'Volver al temario'}
          </Link>
          <h1 className="font-brand text-3xl font-semibold normal-case leading-tight sm:text-4xl">Entregas de tareas</h1>
          <p className="break-words text-sm text-black/70">{course.course.title}{lesson ? ` · ${lesson.title}` : ''}</p>
        </header>

        <section className="grid items-end gap-3 border border-black/15 bg-white p-4 sm:grid-cols-2">
          <p className="text-sm font-semibold">{submissions.length} {submissions.length === 1 ? 'entrega' : 'entregas'} · {pending} {pending === 1 ? 'pendiente' : 'pendientes'}</p>
          {course.lessons.length ? (
            <form action={`${base}/entregas`} method="get" className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <label className="block space-y-2 text-sm font-medium">
                Filtrar por clase
                <select name="leccion" className={field} defaultValue={lesson?.id || ''}>
                  <option value="">Todas las clases</option>
                  {course.lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <button type="submit" className={`${button} border-black/20 bg-white hover:border-ink`}>Filtrar</button>
            </form>
          ) : null}
        </section>

        {query.guardado === '1' ? <p role="status" className="border-l-4 border-brand bg-white p-3 text-sm">Revisión guardada.</p> : null}
        {query.error === 'feedback' ? <p role="alert" className="border-l-4 border-red-700 bg-white p-3 text-sm text-red-800">Escribe qué debe corregir el alumno antes de solicitar cambios.</p> : null}
        {query.error === 'estado' ? <p role="alert" className="border-l-4 border-red-700 bg-white p-3 text-sm text-red-800">La entrega cambió antes de guardar la revisión. Comprueba la versión actual.</p> : null}
        {pending > 0 && !course.course.published ? <p className="border border-black/15 bg-paper p-3 text-sm">La revisión de entregas se reanudará cuando se publique el curso.</p> : null}

        {!submissions.length ? (
          <section className="border border-black/15 bg-white p-5">
            <h2 className="font-brand text-xl font-semibold normal-case">Sin entregas</h2>
            <p className="mt-2 text-sm text-black/70">{lesson ? 'Todavía no hay respuestas guardadas para esta clase.' : 'Las respuestas de los alumnos aparecerán aquí al enviar sus tareas.'}</p>
          </section>
        ) : (
          <ol className="space-y-4">
            {submissions.map((submission) => (
              <li key={`${submission.lesson_id}:${submission.person_id}:${submission.attempt}`}>
                <article className="border border-black/15 bg-white">
                  <HStack gap={3} justify="between" wrap="wrap" className="border-b border-black/10 p-4 sm:px-5">
                    <VStack gap={1} className="min-w-0">
                      <h2 className="break-words font-brand text-lg font-semibold normal-case">{submission.student_name || 'Alumno'}</h2>
                      <p className="break-words text-sm text-black/65">{submission.lesson_title} · Intento {submission.attempt} · {formatDateTime(submission.submitted_at)}</p>
                    </VStack>
                    <p className="border border-black/15 bg-paper px-3 py-1.5 text-sm font-semibold">{statusLabels[submission.status]}</p>
                  </HStack>
                  <VStack gap={4} className="p-4 sm:px-5">
                    <section className="space-y-2">
                      <h3 className="font-brand text-sm font-semibold normal-case">Respuesta</h3>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{submission.response}</p>
                    </section>
                    {submission.feedback ? (
                      <section className="space-y-2 border-t border-black/10 pt-4">
                        <h3 className="font-brand text-sm font-semibold normal-case">Observaciones</h3>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{submission.feedback}</p>
                      </section>
                    ) : null}
                    {submission.status === 'pendiente' && course.course.published ? (
                      <form action={reviewAssignment} className="space-y-3 border-t border-black/10 pt-4">
                        <input type="hidden" name="course_id" value={id} />
                        <input type="hidden" name="lesson_id" value={submission.lesson_id} />
                        <input type="hidden" name="person_id" value={submission.person_id} />
                        <input type="hidden" name="attempt" value={submission.attempt} />
                        <label className="block space-y-2 text-sm font-medium">
                          Observaciones de la revisión
                          <textarea className={field} name="feedback" rows={3} maxLength={4000} required />
                          <small className="block font-normal text-black/70">Solo se requieren si solicitas cambios.</small>
                        </label>
                        <HStack gap={3} wrap="wrap">
                          <button name="decision" value="approve" type="submit" formNoValidate className={`${button} border-brand bg-brand text-ink hover:brightness-95`}>Aprobar entrega</button>
                          <button name="decision" value="changes" type="submit" className={`${button} border-black/20 bg-white hover:border-ink`}>Solicitar cambios</button>
                        </HStack>
                      </form>
                    ) : null}
                  </VStack>
                </article>
              </li>
            ))}
          </ol>
        )}
      </VStack>
    </main>
  );
}
