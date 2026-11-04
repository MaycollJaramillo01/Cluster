import Link from 'next/link';
import { Cover, Page } from '@/components/academia/ui';
import { myCourses } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export default async function MyCoursesPage() {
  const personId = await academiaPersonId();
  const courses = await myCourses(personId);

  return (
    <Page>
      <h1 className="font-display text-5xl tracking-wide">Mis cursos</h1>
      {!personId ? (
        <p className="mt-4 text-sm text-black/60">
          Entra con el correo de tu compra para ver lo que ya tienes. <Link className="underline" href="/academia/entrar">Entrar</Link>
        </p>
      ) : courses.length === 0 ? (
        <p className="mt-4 text-sm text-black/60">Todavía no estás inscrito en un curso. <Link className="underline" href="/academia">Ver el catálogo</Link></p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const pct = course.lessons ? Math.round((course.done / course.lessons) * 100) : 0;
            return (
              <Link key={course.slug} href={`/academia/${course.slug}`} className="border border-black/10 bg-white">
                <Cover url={course.cover_url} title={course.title} />
                <div className="space-y-3 p-4">
                  <p className="font-medium leading-snug">{course.title}</p>
                  <p className="text-sm text-black/50">{course.teacher_name || 'Academia'}</p>
                  <div>
                    <div className="h-1 bg-black/10"><span className="block h-1 bg-brand" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-2 text-xs text-black/45">{pct}% · {course.done} de {course.lessons} clases</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Page>
  );
}
