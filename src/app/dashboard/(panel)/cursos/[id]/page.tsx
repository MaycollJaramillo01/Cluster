import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import {
  deleteCourse,
  enrollContact,
  enrollPerson,
  removeEnrollment,
  updateCourseMeta,
} from '@/lib/crm/lms-actions';
import { getCourse, listCourses } from '@/lib/crm/lms';
import { courseReviewIssues } from '@/lib/crm/course-review';
import { findCourseRevision } from '@/lib/crm/course-revisions';
import { listContacts } from '@/lib/crm/queries';
import { listPeople, listPlans } from '@/lib/valux/data';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { parseMission } from '@/lib/valux/mission';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, Notice, Pill, SectionTitle, btn, btnGhost, btnSmall, fieldClass } from '@/components/dashboard/StaffUi';
import { TeacherCourseBuilder, type CourseWorkspaceView } from '@/components/dashboard/TeacherCourseBuilder';

function workspaceView(vista: string | undefined, teacher: boolean, error?: string): CourseWorkspaceView {
  if (error === 'correo-contacto' || error === 'identidad-contacto') return 'alumnos';
  if (vista === 'temario' || vista === 'revision' || vista === 'alumnos') return vista;
  if (vista === 'ajustes' && !teacher) return vista;
  return 'ficha';
}

export default async function CoursePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ vista?: string; error?: string; guardado?: string }> }) {
  const { id } = await params;
  const status = await searchParams;
  const { session, teacher } = await requireCourseEditor(id);
  const detail = await getCourse(id);
  if (!detail) notFound();
  const requested = workspaceView(status.vista, teacher, status.error);
  const view = detail.course.revision_of && (requested === 'ajustes' || requested === 'alumnos') ? 'ficha' : requested;
  const roster = view === 'alumnos' && !teacher;
  const settings = view === 'ajustes';
  const [contacts, people, courses, plans, revision] = await Promise.all([
    roster ? listContacts({}) : [],
    roster || settings ? listPeople() : [],
    settings ? listCourses() : [],
    settings ? listPlans() : [],
    detail.course.published ? findCourseRevision(id) : null,
  ]);
  const others = courses.filter((item) => item.id !== id);
  const { course, sections, lessons, enrollments, progress } = detail;
  const enrolledContacts = new Set(enrollments.map((item) => item.contact_id).filter(Boolean));
  const enrolledPeople = new Set(enrollments.map((item) => item.person_id).filter(Boolean));
  const available = contacts.filter((contact) => !enrolledContacts.has(contact.id));
  const availablePeople = people.filter((person) => !enrolledPeople.has(person.id));

  return (
    <TeacherCourseBuilder course={course} sections={sections} lessons={lessons} status={status} role={session.role} view={view} revision={revision} issues={view === 'revision' ? courseReviewIssues(detail) : []}>
      {settings ? <VStack as="section" gap={5} aria-labelledby="ajustes-titulo">
        <SectionTitle id="ajustes-titulo" title="Configuración comercial" description="Precio, profesor, membresía y las ofertas que aparecen al pagar este curso." />
        <form action={updateCourseMeta} className="academy-panel">
          <input type="hidden" name="id" value={course.id} />
          <VStack gap={8} className="p-5 sm:p-6">
            <fieldset className="grid min-w-0 gap-5 md:grid-cols-3">
              <legend className="pb-4 text-base font-bold">Venta</legend>
              <Field label="Precio (L)"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={(course.price_cents / 100).toFixed(2)} /></Field>
              <Field label="Profesor">
                <select className={fieldClass} name="teacher_id" defaultValue={course.teacher_id || ''}>
                  <option value="">Sin profesor</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
              </Field>
              <Field label="Incluido en membresía">
                <select className={fieldClass} name="plan_level" defaultValue={String(detail.course.plan_level)}>
                  <option value="0">Ninguna: solo se compra</option>
                  {plans.map((plan) => <option key={plan.id} value={plan.level}>Desde {plan.name}</option>)}
                </select>
              </Field>
            </fieldset>
            <fieldset className="grid min-w-0 gap-5 md:grid-cols-2">
              <legend className="pb-1 text-base font-bold">Ofertas del curso</legend>
              <p className="text-sm text-academy-muted md:col-span-2">El order bump se ofrece en el mismo pago; el upsell, justo después de pagar.</p>
              <Field label="Order bump: curso ofrecido en el checkout">
                <select className={fieldClass} name="bump_course_id" defaultValue={detail.course.bump_course_id || ''}>
                  <option value="">Sin bump</option>
                  {others.map((item) => <option key={item.id} value={item.id}>{item.title}{item.published ? '' : ' (borrador)'}</option>)}
                </select>
              </Field>
              <Field label="Precio del bump (L)">
                <input className={fieldClass} name="bump_price" type="number" min="0" step="0.01" defaultValue={(detail.course.bump_cents / 100).toFixed(2)} />
              </Field>
              <Field label="Upsell: oferta después de pagar">
                <select className={fieldClass} name="upsell_course_id" defaultValue={detail.course.upsell_course_id || ''}>
                  <option value="">Sin upsell</option>
                  {others.map((item) => <option key={item.id} value={item.id}>{item.title}{item.published ? '' : ' (borrador)'}</option>)}
                </select>
              </Field>
              <Field label="Precio del upsell (L)">
                <input className={fieldClass} name="upsell_price" type="number" min="0" step="0.01" defaultValue={(detail.course.upsell_cents / 100).toFixed(2)} />
              </Field>
            </fieldset>
          </VStack>
          <HStack as="footer" gap={3} align="center" className="rounded-b-academy-lg border-t border-academy-line bg-academy-page px-5 py-4 sm:px-6">
            <AcademySubmit label="Guardar configuración" pending="Guardando configuración…" />
          </HStack>
        </form>
        <details className="academy-panel p-5 sm:px-6">
          <summary className="academy-focus min-h-11 cursor-pointer py-3 text-sm font-semibold text-red-800">Eliminar curso</summary>
          <form action={deleteCourse} className="space-y-3 pt-2">
            <input type="hidden" name="id" value={course.id} />
            <p className="text-sm">Se eliminarán el temario, las matrículas y el progreso del curso.</p>
            <AcademySubmit label="Eliminar definitivamente" pending="Eliminando…" variant="destructive" />
          </form>
        </details>
      </VStack> : null}

      {view === 'alumnos' ? <VStack as="section" gap={5} aria-labelledby="alumnos-titulo">
        <SectionTitle
          id="alumnos-titulo"
          title="Alumnos"
          description={`${enrollments.length} ${enrollments.length === 1 ? 'inscrito' : 'inscritos'} en ${lessons.length} ${lessons.length === 1 ? 'clase' : 'clases'}.`}
          action={<Link className={btnGhost} href={`/dashboard/cursos/${id}/entregas`}>Entregas de tareas</Link>}
        />
        {status.error === 'correo-contacto' ? <Notice tone="error">El contacto necesita un correo válido para entrar a la Academia.</Notice> : null}
        {status.error === 'identidad-contacto' ? <Notice tone="error">El contacto ya está vinculado a otra cuenta en este curso. Verifica el correo antes de matricularlo.</Notice> : null}
        {teacher ? null : (
          <section className="grid gap-4 md:grid-cols-2" aria-label="Inscribir alumnos">
            <form action={enrollContact} className="academy-panel grid items-end gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
              <input type="hidden" name="course_id" value={course.id} />
              <Field label="Inscribir contacto">
                <select className={fieldClass} name="contact_id" required defaultValue="">
                  <option value="" disabled>{available.length ? 'Elige un contacto' : 'No hay contactos disponibles'}</option>
                  {available.map((contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>
                  ))}
                </select>
              </Field>
              <button className={btn} type="submit" disabled={available.length === 0}>Inscribir</button>
            </form>
            <form action={enrollPerson} className="academy-panel grid items-end gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
              <input type="hidden" name="course_id" value={course.id} />
              <Field label="Inscribir persona de la academia">
                <select className={fieldClass} name="person_id" required defaultValue="">
                  <option value="" disabled>{availablePeople.length ? 'Elige una persona' : 'No hay personas disponibles'}</option>
                  {availablePeople.map((person) => (
                    <option key={person.id} value={person.id}>{person.name} · {person.email}</option>
                  ))}
                </select>
              </Field>
              <button className={btn} type="submit" disabled={availablePeople.length === 0}>Inscribir</button>
            </form>
          </section>
        )}
        {enrollments.length === 0 ? <Empty title="Nadie está inscrito.">Los alumnos aparecen aquí al comprar el curso o cuando los inscribes.</Empty> : (
          <VStack as="ul" gap={4}>
            {enrollments.map((enrollment) => {
              const mine = progress.filter((item) =>
                (enrollment.person_id && item.person_id === enrollment.person_id) ||
                (enrollment.contact_id && item.contact_id === enrollment.contact_id),
              );
              const done = lessons.filter((lesson) => mine.some((item) => item.lesson_id === lesson.id && item.completed_at)).length;
              const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
              return (
                <li key={enrollment.id}>
                  <article aria-labelledby={`alumno-${enrollment.id}`} className="academy-panel overflow-hidden">
                    <VStack gap={3} className="p-4 sm:p-5">
                      <HStack gap={3} justify="between" align="start" wrap="wrap">
                        <VStack gap={0} className="min-w-0 break-words">
                          <Heading id={`alumno-${enrollment.id}`} level={3} className="text-base font-bold">{enrollment.contact_name}</Heading>
                          {teacher ? null : <p className="break-all text-sm text-academy-muted">{enrollment.email}</p>}
                        </VStack>
                        <p className="text-sm font-semibold tabular-nums">{done} de {lessons.length} clases · {pct}%</p>
                      </HStack>
                      <ProgressBar label={`Progreso de ${enrollment.contact_name}`} value={pct} isLabelHidden />
                    </VStack>
                    {lessons.length ? (
                      <details className="border-t border-academy-line">
                        <summary className="academy-focus flex min-h-11 cursor-pointer list-none items-center px-4 text-sm font-semibold text-academy-primary sm:px-5">Clases</summary>
                        <ul className="divide-y divide-academy-line border-t border-academy-line">
                          {lessons.map((lesson) => {
                            const mark = mine.find((item) => item.lesson_id === lesson.id);
                            const assignment = parseMission(lesson.mission).mission?.kind === 'assignment';
                            return (
                              <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                                <p className="min-w-0 flex-1 break-words text-sm">{lesson.title}</p>
                                {mark?.completed_at ? <Pill tone="ok">Completada</Pill> : <Pill tone="off">Pendiente</Pill>}
                                {assignment ? <Link className="academy-nav academy-focus" href={`/dashboard/cursos/${id}/entregas?leccion=${encodeURIComponent(lesson.id)}`}>Revisar entregas</Link> : null}
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    ) : null}
                    {teacher ? null : (
                      <form action={removeEnrollment} className="border-t border-academy-line bg-academy-page p-4 sm:p-5">
                        <input type="hidden" name="id" value={enrollment.id} />
                        <button className={`${btnSmall} text-red-800`} type="submit">Quitar alumno<small className="sr-only"> {enrollment.contact_name}</small></button>
                      </form>
                    )}
                  </article>
                </li>
              );
            })}
          </VStack>
        )}
      </VStack> : null}
    </TeacherCourseBuilder>
  );
}
