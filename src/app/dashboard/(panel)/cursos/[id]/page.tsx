import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  createLesson,
  createSection,
  deleteCourse,
  deleteSection,
  enrollContact,
  enrollPerson,
  removeEnrollment,
  saveFinalGrade,
  saveLessonScore,
  toggleCourse,
  updateCourseMeta,
} from '@/lib/crm/lms-actions';
import { getCourse } from '@/lib/crm/lms';
import { money } from '@/lib/crm/format';
import { listContacts } from '@/lib/crm/queries';
import { listPeople } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnGhost, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, contacts, people] = await Promise.all([getCourse(id), listContacts({}), listPeople()]);
  if (!detail) notFound();
  const { course, sections, lessons, enrollments, progress } = detail;
  const enrolledContacts = new Set(enrollments.map((item) => item.contact_id).filter(Boolean));
  const enrolledPeople = new Set(enrollments.map((item) => item.person_id).filter(Boolean));
  const available = contacts.filter((contact) => !enrolledContacts.has(contact.id));
  const availablePeople = people.filter((person) => !enrolledPeople.has(person.id));
  const loose = lessons.filter((lesson) => !lesson.section_id);

  return (
    <div className="space-y-8">
      <PageTitle
        title={course.title}
        action={
          <span className="flex gap-3">
            {course.published ? <Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href={`/academia/${course.slug}`}>Ver en el catálogo</Link> : null}
            <Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/dashboard/cursos">Volver</Link>
          </span>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white p-4">
        <p className="text-sm text-black/60">
          {course.published ? 'Publicado' : 'Borrador'} · {lessons.length} lecciones · {enrollments.length} alumnos · {money(course.price_cents)}
        </p>
        <div className="flex gap-2">
          <form action={toggleCourse}>
            <input type="hidden" name="id" value={course.id} />
            <button className={btnGhost} type="submit">{course.published ? 'Pasar a borrador' : 'Publicar'}</button>
          </form>
          <form action={deleteCourse}>
            <input type="hidden" name="id" value={course.id} />
            <button className={btnTiny} type="submit">Eliminar curso</button>
          </form>
        </div>
      </div>

      <form action={updateCourseMeta} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={course.id} />
        <Field label="Descripción"><textarea className={fieldClass} name="description" rows={3} defaultValue={course.description} /></Field>
        <Field label="Precio USD"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={(course.price_cents / 100).toFixed(2)} /></Field>
        <Field label="Portada"><input className={fieldClass} name="cover_url" defaultValue={course.cover_url || ''} placeholder="https://" /></Field>
        <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
        <Field label="Profesor">
          <select className={fieldClass} name="teacher_id" defaultValue={course.teacher_id || ''}>
            <option value="">Sin profesor</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </Field>
        <button className={btn} type="submit">Guardar ficha</button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-3xl tracking-wide">Secciones</h2>
        {sections.map((section) => (
          <div key={section.id} className="flex items-center justify-between border border-black/10 bg-white px-4 py-3">
            <p className="text-sm">{section.title}</p>
            <form action={deleteSection}>
              <input type="hidden" name="id" value={section.id} />
              <button className={btnTiny} type="submit">Quitar</button>
            </form>
          </div>
        ))}
        <form action={createSection} className="flex flex-wrap items-end gap-2 border border-black/10 bg-white p-4">
          <input type="hidden" name="course_id" value={course.id} />
          <Field label="Nueva sección"><input className={fieldClass} name="title" required /></Field>
          <button className={btn} type="submit">Agregar</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl tracking-wide">Temario</h2>
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{section.title}</p>
            <LessonList courseId={course.id} lessons={lessons.filter((lesson) => lesson.section_id === section.id)} />
          </div>
        ))}
        {loose.length > 0 ? <LessonList courseId={course.id} lessons={loose} /> : null}
        {lessons.length === 0 ? <p className="text-sm text-black/50">Todavía no hay lecciones.</p> : null}
        <form action={createLesson} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
          <input type="hidden" name="course_id" value={course.id} />
          <Field label="Nueva lección"><input className={fieldClass} name="title" required /></Field>
          <Field label="Sección">
            <select className={fieldClass} name="section_id" defaultValue="">
              <option value="">Sin sección</option>
              {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
            </select>
          </Field>
          <Field label="Video"><input className={fieldClass} name="video_url" placeholder="https://" /></Field>
          <Field label="Minutos"><input className={fieldClass} name="duration_min" type="number" min="1" /></Field>
          <Field label="Puntos"><input className={fieldClass} name="points" type="number" min="1" defaultValue="10" /></Field>
          <Field label="Contenido"><textarea className={fieldClass} name="content" rows={3} /></Field>
          <div className="flex items-end"><button className={btn} type="submit">Agregar</button></div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl tracking-wide">Alumnos</h2>
        <div className="grid gap-3 md:grid-cols-2">
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
        </div>
        {enrollments.length === 0 ? <p className="text-sm text-black/50">Nadie está inscrito.</p> : enrollments.map((enrollment) => {
          const mine = progress.filter((item) =>
            (enrollment.person_id && item.person_id === enrollment.person_id) ||
            (enrollment.contact_id && item.contact_id === enrollment.contact_id),
          );
          const done = lessons.filter((lesson) => mine.some((item) => item.lesson_id === lesson.id && item.completed_at)).length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          return (
            <article key={enrollment.id} className="space-y-4 border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-medium">{enrollment.contact_name}</p>
                  <p className="text-xs text-black/45">{enrollment.email}</p>
                </div>
                <p className="font-mono text-xs text-black/50">Progreso {pct}%{enrollment.final_grade != null ? ` · ${enrollment.final_grade}/100` : ''}</p>
              </div>
              <div className="h-1 bg-black/10"><span className="block h-1 bg-brand" style={{ width: `${pct}%` }} /></div>
              {lessons.map((lesson) => {
                const mark = mine.find((item) => item.lesson_id === lesson.id);
                return (
                  <form key={lesson.id} action={saveLessonScore} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="contact_id" value={enrollment.contact_id} />
                    <input type="hidden" name="person_id" value={enrollment.person_id || ''} />
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <span className="min-w-40 flex-1 text-sm">{lesson.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">{mark?.completed_at ? 'Completada' : 'Pendiente'}</span>
                    <input className={`${fieldClass} w-20`} name="score" type="number" min="0" max="100" defaultValue={mark?.score ?? ''} placeholder="Nota" />
                    <button className={btnTiny} type="submit">Guardar</button>
                  </form>
                );
              })}
              <form action={saveFinalGrade} className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                <input type="hidden" name="id" value={enrollment.id} />
                <Field label="Nota final"><input className={fieldClass} name="final_grade" type="number" min="0" max="100" defaultValue={enrollment.final_grade ?? ''} /></Field>
                <Field label="Notas"><input className={fieldClass} name="notes" defaultValue={enrollment.notes || ''} /></Field>
                <div className="flex items-end"><button className={btnGhost} type="submit">Guardar</button></div>
              </form>
              <form action={removeEnrollment}>
                <input type="hidden" name="id" value={enrollment.id} />
                <button className={btnTiny} type="submit">Quitar alumno</button>
              </form>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function LessonList({ courseId, lessons }: { courseId: string; lessons: { id: string; title: string; duration_min: number | null }[] }) {
  if (lessons.length === 0) return null;
  return (
    <ol className="space-y-2">
      {lessons.map((lesson, index) => (
        <li key={lesson.id} className="flex items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
          <p className="text-sm">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">{index + 1}</span>
            {lesson.title}
            {lesson.duration_min ? <span className="ml-2 text-xs text-black/40">{lesson.duration_min} min</span> : null}
          </p>
          <Link className={btnTiny} href={`/dashboard/cursos/${courseId}/lecciones/${lesson.id}`}>Editar</Link>
        </li>
      ))}
    </ol>
  );
}
