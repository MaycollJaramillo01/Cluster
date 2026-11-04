import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Checkout, Cover, durationLabel, payNote } from '@/components/academia/ui';
import { money } from '@/lib/crm/format';
import { buyCourse } from '@/lib/valux/actions';
import { publishedCourse } from '@/lib/valux/data';
import { paymentReady } from '@/lib/valux/stripe';

export default async function CourseCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const course = await publishedCourse(slug);
  if (!course) notFound();
  const minutes = course.lessons.reduce((sum, lesson) => sum + (lesson.duration_min || 0), 0);
  const lessonCount = course.lessons.length;
  const loose = course.lessons.filter((lesson) => !lesson.section_id);
  const groups = [
    ...course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      lessons: course.lessons.filter((lesson) => lesson.section_id === section.id),
    })),
    ...(loose.length ? [{ id: 'sueltas', title: course.sections.length ? 'Otras clases' : 'Contenido del curso', lessons: loose }] : []),
  ];

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-10">
        <section className="bg-ink px-6 py-10 text-white">
          <p className="text-sm text-white/50"><Link href="/academia" className="hover:text-white">Cursos</Link></p>
          <h1 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">{course.title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">{course.description}</p>
          <p className="mt-5 text-sm">
            Creado por <span className="text-brand">{course.teacher_name || 'Academia'}</span>
          </p>
          <p className="mt-2 text-sm text-white/55">
            {lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}
            {minutes ? ` · ${durationLabel(minutes)} de contenido` : ''}
            {course.students ? ` · ${course.students} ${course.students === 1 ? 'alumno' : 'alumnos'}` : ''}
          </p>
        </section>

        {query.ok ? <p className="border border-brand/40 bg-white px-4 py-3 text-sm">Acceso listo. Abre la primera clase del temario.</p> : null}
        {query.error ? <p className="border border-black/10 bg-white px-4 py-3 text-sm">{payNote(query.error)}</p> : null}

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-medium">Contenido del curso</h2>
            <p className="text-sm text-black/45">{course.sections.length ? `${course.sections.length} secciones · ` : ''}{lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}</p>
          </div>
          {groups.length === 0 ? <p className="border border-black/10 bg-white px-4 py-6 text-sm text-black/50">Este curso todavía no tiene clases.</p> : groups.map((group) => {
            const groupMinutes = group.lessons.reduce((sum, lesson) => sum + (lesson.duration_min || 0), 0);
            return (
              <details key={group.id} open className="border border-black/10 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium">
                  <span>{group.title}</span>
                  <span className="text-xs font-normal text-black/45">
                    {group.lessons.length} {group.lessons.length === 1 ? 'clase' : 'clases'}
                    {groupMinutes ? ` · ${durationLabel(groupMinutes)}` : ''}
                  </span>
                </summary>
                <ol className="border-t border-black/10">
                  {group.lessons.map((lesson, index) => (
                    <li key={lesson.id} className="border-b border-black/5 last:border-0">
                      <Link href={`/academia/${course.slug}/${lesson.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-black/[0.02]">
                        <span><span className="mr-3 font-mono text-[10px] text-black/35">{index + 1}</span>{lesson.title}</span>
                        {lesson.duration_min ? <span className="shrink-0 text-xs text-black/40">{lesson.duration_min} min</span> : null}
                      </Link>
                    </li>
                  ))}
                </ol>
              </details>
            );
          })}
        </section>

        <section className="border border-black/10 bg-white p-5">
          <h2 className="text-xl font-medium">Instructor</h2>
          <p className="mt-3 font-medium">{course.teacher_name || 'Academia'}</p>
          <p className="mt-1 text-sm text-black/55">Dicta este curso en la academia.</p>
        </section>
      </div>

      <aside className="border border-black/10 bg-white lg:sticky lg:top-6">
        <Cover url={course.cover_url} title={course.title} />
        <div className="space-y-4 p-4">
          <p className="font-display text-5xl tracking-wide">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</p>
          {course.price_cents > 0 && !paymentReady() ? (
            <p className="text-sm leading-relaxed text-black/70">{payNote('pasarela')}</p>
          ) : (
            <Checkout
              action={buyCourse}
              hidden={{ slug: course.slug }}
              label={course.price_cents > 0 ? 'Inscribirme ahora' : 'Empezar gratis'}
              note={course.price_cents > 0 ? 'El pago se abre en PayPal o Stripe.' : 'Acceso inmediato a las clases'}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
