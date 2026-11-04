import Link from 'next/link';
import { createCourse } from '@/lib/crm/lms-actions';
import { listCourses } from '@/lib/crm/lms';
import { money } from '@/lib/crm/format';
import { Empty, Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <div className="space-y-6">
      <PageTitle
        title="Cursos"
        action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/academia">Ver catálogo</Link>}
      />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form action={createCourse} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Título"><input className={fieldClass} name="title" required /></Field>
          <Field label="Descripción"><textarea className={fieldClass} name="description" rows={4} required /></Field>
          <Field label="Precio USD"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
          <Field label="Portada"><input className={fieldClass} name="cover_url" placeholder="https://" /></Field>
          <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
          <Field label="Video de la primera lección">
            <input className={fieldClass} name="video_url" placeholder="https://" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input name="published" type="checkbox" />
            Publicar en el catálogo
          </label>
          <button className={btn} type="submit">Crear curso</button>
        </form>
        {courses.length === 0 ? (
          <Empty title="Sin cursos">
            <p className="max-w-sm text-sm text-black/50">Un curso junta el temario, los alumnos y las notas.</p>
          </Empty>
        ) : (
          <div className="overflow-x-auto border border-black/10 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                  <th className="px-4 py-3 font-medium">Curso</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Lecciones</th>
                  <th className="px-4 py-3 font-medium">Alumnos</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/cursos/${course.id}`} className="font-medium hover:text-brand">{course.title}</Link>
                    </td>
                    <td className="px-4 py-3">{course.published ? 'Publicado' : 'Borrador'}</td>
                    <td className="px-4 py-3">{course.lessons}</td>
                    <td className="px-4 py-3">{course.students}</td>
                    <td className="px-4 py-3">{money(course.price_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
