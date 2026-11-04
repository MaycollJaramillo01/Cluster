import Link from 'next/link';
import { Cover, durationLabel, payNote } from '@/components/academia/ui';
import { money } from '@/lib/crm/format';
import { publishedCourses } from '@/lib/valux/data';

export default async function AcademiaHome({ searchParams }: { searchParams: Promise<{ error?: string; q?: string }> }) {
  const query = await searchParams;
  const q = (query.q || '').trim().toLowerCase();
  const courses = (await publishedCourses()).filter((course) => {
    if (!q) return true;
    return [course.title, course.teacher_name, course.description].join(' ').toLowerCase().includes(q);
  });

  return (
    <div>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl tracking-wide md:text-6xl">Cursos</h1>
            <p className="mt-2 max-w-lg text-sm text-black/60">Elige un curso, míralo a tu ritmo y sigue el temario clase por clase.</p>
          </div>
          <form action="/academia" className="flex w-full max-w-md">
            <input
              name="q"
              defaultValue={query.q || ''}
              placeholder="Buscar cursos"
              className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
            <button className="shrink-0 border border-l-0 border-ink bg-ink px-4 text-sm text-white" type="submit">Buscar</button>
          </form>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {query.error ? <p className="mb-6 border border-black/10 bg-white px-4 py-3 text-sm">{payNote(query.error)}</p> : null}
        {courses.length === 0 ? (
          <div className="border border-black/10 bg-white px-6 py-16 text-center">
            <p className="font-display text-4xl tracking-wide">{q ? 'Sin resultados' : 'Todavía no hay cursos'}</p>
            <p className="mt-2 text-sm text-black/50">{q ? 'Prueba con otro nombre.' : 'Cuando se publique uno, aparece aquí.'}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/academia/${course.slug}`} className="group border border-black/10 bg-white">
                <Cover url={course.cover_url} title={course.title} />
                <div className="space-y-2 p-4">
                  <p className="line-clamp-2 text-base font-medium leading-snug group-hover:text-brand">{course.title}</p>
                  <p className="text-sm text-black/50">{course.teacher_name || 'Academia'}</p>
                  <p className="text-xs text-black/45">
                    {course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}
                    {course.minutes ? ` · ${durationLabel(course.minutes)}` : ''}
                    {course.students ? ` · ${course.students} ${course.students === 1 ? 'alumno' : 'alumnos'}` : ''}
                  </p>
                  <p className="pt-1 text-sm font-medium">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
