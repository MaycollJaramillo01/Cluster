import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createResource, deleteLesson, deleteResource, updateLesson } from '@/lib/crm/lms-actions';
import { getCourse, getLesson } from '@/lib/crm/lms';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const [lesson, detail] = await Promise.all([getLesson(id, lessonId), getCourse(id)]);
  if (!lesson || !detail) notFound();

  return (
    <div className="space-y-6">
      <PageTitle
        title={lesson.title}
        action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href={`/dashboard/cursos/${id}`}>Volver al curso</Link>}
      />
      <form action={updateLesson} className="max-w-2xl space-y-3 border border-black/10 bg-white p-4">
        <input type="hidden" name="id" value={lesson.id} />
        <input type="hidden" name="course_id" value={id} />
        <Field label="Título"><input className={fieldClass} name="title" defaultValue={lesson.title} required /></Field>
        <Field label="Sección">
          <select className={fieldClass} name="section_id" defaultValue={lesson.section_id || ''}>
            <option value="">Sin sección</option>
            {detail.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
          </select>
        </Field>
        <Field label="Contenido"><textarea className={fieldClass} name="content" rows={8} defaultValue={lesson.content} /></Field>
        <Field label="Video"><input className={fieldClass} name="video_url" defaultValue={lesson.video_url || ''} placeholder="https://" /></Field>
        <Field label="Minutos"><input className={fieldClass} name="duration_min" type="number" min="1" defaultValue={lesson.duration_min ?? ''} /></Field>
        <Field label="Puntos"><input className={fieldClass} name="points" type="number" min="1" defaultValue={lesson.points} /></Field>
        <button className={btn} type="submit">Guardar lección</button>
      </form>
      <section className="max-w-2xl space-y-3">
        <h2 className="font-display text-3xl tracking-wide">Recursos</h2>
        {lesson.resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3 text-sm">
            <p><span className="mr-2 font-mono text-[10px] uppercase text-black/40">{resource.kind}</span>{resource.title}</p>
            <form action={deleteResource}>
              <input type="hidden" name="id" value={resource.id} />
              <button className={btnTiny} type="submit">Quitar</button>
            </form>
          </div>
        ))}
        <form action={createResource} className="grid gap-3 border border-black/10 bg-white p-4">
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <Field label="Tipo">
            <select className={fieldClass} name="kind" defaultValue="enlace">
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="imagen">Imagen</option>
              <option value="enlace">Enlace</option>
              <option value="texto">Texto</option>
            </select>
          </Field>
          <Field label="Título"><input className={fieldClass} name="title" required /></Field>
          <Field label="URL"><input className={fieldClass} name="url" placeholder="https://" /></Field>
          <Field label="O sube el archivo"><input className={fieldClass} name="file" type="file" /></Field>
          <Field label="Texto"><textarea className={fieldClass} name="content" rows={3} /></Field>
          <button className={btn} type="submit">Agregar recurso</button>
        </form>
      </section>
      <form action={deleteLesson}>
        <input type="hidden" name="id" value={lesson.id} />
        <input type="hidden" name="course_id" value={id} />
        <button className={btnTiny} type="submit">Eliminar lección</button>
      </form>
    </div>
  );
}
