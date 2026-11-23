import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import {
  deleteCourse,
  enrollContact,
  enrollPerson,
  removeEnrollment,
  saveFinalGrade,
  saveLessonScore,
  updateCourseMeta,
} from '@/lib/crm/lms-actions';
import { getCourse, listCourses } from '@/lib/crm/lms';
import { courseReviewIssues } from '@/lib/crm/course-review';
import { listContacts } from '@/lib/crm/queries';
import { listPeople, listPlans } from '@/lib/valux/data';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { parseMission } from '@/lib/valux/mission';
import { Field, btn, btnGhost, btnTiny, fieldClass } from '@/components/dashboard/ui';
import { SubmitButton } from '@/components/ui/SubmitButton';
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
  const view = workspaceView(status.vista, teacher, status.error);
  const roster = view === 'alumnos' && !teacher;
  const settings = view === 'ajustes';
  const [detail, contacts, people, courses, plans] = await Promise.all([
    getCourse(id),
    roster ? listContacts({}) : [],
    roster || settings ? listPeople() : [],
    settings ? listCourses() : [],
    settings ? listPlans() : [],
  ]);
  if (!detail) notFound();
  const others = courses.filter((item) => item.id !== id);
  const { course, sections, lessons, enrollments, progress } = detail;
  const enrolledContacts = new Set(enrollments.map((item) => item.contact_id).filter(Boolean));
  const enrolledPeople = new Set(enrollments.map((item) => item.person_id).filter(Boolean));
  const available = contacts.filter((contact) => !enrolledContacts.has(contact.id));
  const availablePeople = people.filter((person) => !enrolledPeople.has(person.id));

  return (
    <TeacherCourseBuilder course={course} sections={sections} lessons={lessons} status={status} role={session.role} view={view} issues={view === 'revision' ? courseReviewIssues(detail) : []}>
      {settings ? <VStack as="section" gap={4}>
      <Heading level={2} className="font-brand text-xl font-semibold">Configuración comercial</Heading>
      <form action={updateCourseMeta} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={course.id} />
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
        <fieldset className="contents">
          <legend className="sr-only">Ofertas del curso</legend>
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
        <SubmitButton pending="Guardando configuración…" className="justify-self-start">Guardar configuración</SubmitButton>
      </form>
      <details className="border border-black/10 bg-white p-4">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Eliminar curso</summary>
        <form action={deleteCourse} className="space-y-3">
          <input type="hidden" name="id" value={course.id} />
          <p className="text-sm text-black/75">Se eliminarán el temario, las matrículas y el progreso del curso.</p>
          <button className={`${btnGhost} text-red-800`} type="submit">Eliminar definitivamente</button>
        </form>
      </details>
      </VStack> : null}

      {view === 'alumnos' ? <VStack as="section" gap={4}>
        <HStack gap={3} justify="between" align="center" wrap="wrap">
          <Heading level={2} className="font-brand text-xl font-semibold">Alumnos</Heading>
          <Link className={`${btnGhost} min-h-11`} href={`/dashboard/cursos/${id}/entregas`}>Entregas de tareas</Link>
        </HStack>
        {status.error === 'correo-contacto' ? <p role="alert" className="text-sm text-red-800">El contacto necesita un correo válido para entrar a la Academia.</p> : null}
        {status.error === 'identidad-contacto' ? <p role="alert" className="text-sm text-red-800">El contacto ya está vinculado a otra cuenta en este curso. Verifica el correo antes de matricularlo.</p> : null}
        {teacher ? null : (
        <section className="grid gap-3 md:grid-cols-2" aria-label="Matricular alumnos">
          <form action={enrollContact} className="flex flex-wrap items-end gap-2 border border-black/10 bg-white p-4">
            <input type="hidden" name="course_id" value={course.id} />
            <Field label="Inscribir contacto">
              <select className={fieldClass} name="contact_id" required defaultValue="">
                <option value="" disabled>Elegir</option>
                {available.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>
                ))}
              </select>
            </Field>
            <button className={btn} type="submit" disabled={available.length === 0}>Inscribir</button>
          </form>
          <form action={enrollPerson} className="flex flex-wrap items-end gap-2 border border-black/10 bg-white p-4">
            <input type="hidden" name="course_id" value={course.id} />
            <Field label="Inscribir persona de la academia">
              <select className={fieldClass} name="person_id" required defaultValue="">
                <option value="" disabled>Elegir</option>
                {availablePeople.map((person) => (
                  <option key={person.id} value={person.id}>{person.name} · {person.email}</option>
                ))}
              </select>
            </Field>
            <button className={btn} type="submit" disabled={availablePeople.length === 0}>Inscribir</button>
          </form>
        </section>
        )}
        {enrollments.length === 0 ? <p className="text-sm text-black/50">Nadie está inscrito.</p> : enrollments.map((enrollment) => {
          const mine = progress.filter((item) =>
            (enrollment.person_id && item.person_id === enrollment.person_id) ||
            (enrollment.contact_id && item.contact_id === enrollment.contact_id),
          );
          const done = lessons.filter((lesson) => mine.some((item) => item.lesson_id === lesson.id && item.completed_at)).length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          return (
            <article key={enrollment.id} className="space-y-4 border border-black/10 bg-white p-4">
              <HStack gap={3} justify="between" wrap="wrap">
                <VStack gap={1} className="min-w-0 break-words">
                  <p className="font-medium">{enrollment.contact_name}</p>
                  {teacher ? null : <p className="text-xs text-black/45">{enrollment.email}</p>}
                </VStack>
                <p className="font-mono text-xs text-black/50">Progreso {pct}%{enrollment.final_grade != null ? ` · ${enrollment.final_grade}/100` : ''}</p>
              </HStack>
              <progress className="block h-2 w-full accent-brand" aria-label={`Progreso de ${enrollment.contact_name}`} max={100} value={pct} />
              {lessons.map((lesson) => {
                const mark = mine.find((item) => item.lesson_id === lesson.id);
                const completion = mark?.completed_at ? 'Completada' : 'Pendiente';
                if (lesson.mission.trim()) {
                  const assignment = parseMission(lesson.mission).mission?.kind === 'assignment';
                  return <HStack key={lesson.id} wrap="wrap" justify="between" align="center" gap={2} className="border-b border-black/10 py-2">
                    <p className="min-w-0 break-words text-sm">{lesson.title}</p>
                    <p className="text-xs text-black/65">{completion}</p>
                    {assignment ? <Link className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" href={`/dashboard/cursos/${id}/entregas?leccion=${encodeURIComponent(lesson.id)}`}>Revisar entregas</Link> : null}
                  </HStack>;
                }
                return (
                  <form key={lesson.id} action={saveLessonScore} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="contact_id" value={enrollment.contact_id} />
                    <input type="hidden" name="person_id" value={enrollment.person_id || ''} />
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <p className="min-w-32 flex-1 break-words text-sm">{lesson.title}</p>
                    <p className="text-xs text-black/65">{completion}</p>
                    <input className={`${fieldClass} min-h-11 max-w-24`} name="score" aria-label={`Nota de ${lesson.title}`} type="number" min="0" max="100" defaultValue={mark?.score ?? ''} placeholder="Nota" />
                    <button className={`${btnTiny} min-h-11`} type="submit">Guardar</button>
                  </form>
                );
              })}
              {teacher ? null : (
              <>
              <form action={saveFinalGrade} className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                <input type="hidden" name="id" value={enrollment.id} />
                <Field label="Nota final"><input className={fieldClass} name="final_grade" type="number" min="0" max="100" defaultValue={enrollment.final_grade ?? ''} /></Field>
                <Field label="Notas"><input className={fieldClass} name="notes" defaultValue={enrollment.notes || ''} /></Field>
                <button className={`${btnGhost} self-end`} type="submit">Guardar</button>
              </form>
              <form action={removeEnrollment}>
                <input type="hidden" name="id" value={enrollment.id} />
                <button className={btnTiny} type="submit">Quitar alumno</button>
              </form>
              </>
              )}
            </article>
          );
        })}
      </VStack> : null}
    </TeacherCourseBuilder>
  );
}
