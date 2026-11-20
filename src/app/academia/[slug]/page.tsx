import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Checkout, Cover, LessonMark, PayMethod, durationLabel, payHint, payNote, payReady } from '@/components/academia/ui';
import { academyMoney as money } from '@/lib/valux/money';
import { buyCourse, buyUpsell } from '@/lib/valux/actions';
import { canReadCourse, lessonAccess, ownsCourse, publishedCourse } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { paymentOptions } from '@/lib/valux/transfers';
import { advanceStage } from '@/lib/valux/events';

export default async function CourseCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string; terminado?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const course = await publishedCourse(slug);
  if (!course) notFound();
  const pay = await paymentOptions();
  const personId = await academiaPersonId();
  // Registrado que mira la ficha de un curso: pasa de nuevo a interesado (nunca retrocede).
  if (personId) await advanceStage({ personId }, 'interesado');
  // La oferta postcompra solo aparece a quien ya tiene este curso y aún no tiene el ofrecido.
  const upsell = query.ok && course.upsell && (await ownsCourse(personId, course.id)) && !(await ownsCourse(personId, course.upsell.id))
    ? course.upsell
    : null;
  const minutes = course.lessons.reduce((sum, lesson) => sum + (lesson.duration_min || 0), 0);
  const lessonCount = course.lessons.length;
  // Inscrito, o con acceso a un curso de pago por membresía o rol: ve su avance en vez del checkout.
  const enrolled = await ownsCourse(personId, course.id);
  const hasAccess = Boolean(personId) && (enrolled || (course.price_cents > 0 && (await canReadCourse(personId, course))));
  const access = hasAccess ? await lessonAccess(personId, course) : null;
  const doneCount = access ? access.order.filter((lesson) => access.done.has(lesson.id)).length : 0;
  const nextLesson = access?.order.find((lesson) => !access.done.has(lesson.id));
  const finished = Boolean(access) && lessonCount > 0 && !nextLesson;
  const pct = lessonCount ? Math.round((doneCount / lessonCount) * 100) : 0;
  const lessonUrl = (lesson: { slug: string }) => `/academia/${course.slug}/${lesson.slug}`;
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

        {query.ok ? <p className="border border-brand/40 bg-white px-4 py-3 text-sm">Acceso listo.</p> : null}
        {query.terminado && finished ? (
          <p className="border border-brand/40 bg-white px-4 py-3 text-sm">
            Terminaste el curso: completaste {lessonCount === 1 ? 'la clase' : `las ${lessonCount} clases`}.
          </p>
        ) : null}
        {upsell ? (
          <form action={buyUpsell} className="space-y-3 border-2 border-brand bg-white p-5">
            <input type="hidden" name="slug" value={course.slug} />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Oferta para ti</p>
            <p className="text-lg font-medium">Suma {upsell.title} por {money(upsell.cents)}</p>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="acepto" value="1" required className="mt-1" />
              <span>Autorizo un cargo nuevo de {money(upsell.cents)} por {upsell.title}. No se usa mi pago anterior: lo confirmo en la pantalla de pago.</span>
            </label>
            {query.error === 'acepto' ? <p className="text-sm">Marca la casilla para continuar.</p> : null}
            <PayMethod options={pay} />
            <div className="flex flex-wrap gap-3">
              <button className="bg-brand px-4 py-2.5 text-sm font-medium text-ink" type="submit">Sí, agregarlo</button>
              <Link href={`/academia/${course.slug}`} className="px-4 py-2.5 text-sm text-black/55 underline">No, gracias</Link>
            </div>
          </form>
        ) : null}
        {query.error && query.error !== 'acepto' ? <p className="border border-black/10 bg-white px-4 py-3 text-sm">{payNote(query.error)}</p> : null}

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
                      <Link href={lessonUrl(lesson)} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-black/[0.02]">
                        <span className="flex items-center gap-2">
                          <span className="mr-1 font-mono text-[10px] text-black/35">{index + 1}</span>
                          {access ? <LessonMark done={access.done.has(lesson.id)} locked={!access.unlocked.has(lesson.id)} /> : null}
                          <span>{lesson.title}</span>
                        </span>
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
        </section>
      </div>

      <aside className="border border-black/10 bg-white lg:sticky lg:top-6">
        <Cover url={course.cover_url} title={course.title} />
        {access ? (
          <div className="space-y-4 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
              {finished ? 'Curso terminado' : enrolled ? 'Tu progreso' : 'Tienes acceso a este curso'}
            </p>
            <div>
              <div className="h-1 bg-black/10" aria-hidden="true"><span className="block h-1 bg-brand" style={{ width: `${pct}%` }} /></div>
              <p className="mt-2 text-sm text-black/60">{pct}% · {doneCount} de {lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}</p>
            </div>
            {finished ? (
              <>
                <Link href="/academia" className="block w-full bg-brand px-4 py-3 text-center text-sm font-medium text-ink">Ver más cursos</Link>
                <Link href={lessonUrl(access.order[0])} className="block text-center text-sm text-black/55 underline">Repasar desde la primera clase</Link>
              </>
            ) : nextLesson ? (
              <>
                <Link href={lessonUrl(nextLesson)} className="block w-full bg-brand px-4 py-3 text-center text-sm font-medium text-ink">
                  {doneCount ? 'Continuar' : 'Empezar el curso'}
                </Link>
                <p className="text-sm text-black/55">{doneCount ? 'Sigue' : 'Primera clase'}: {nextLesson.title}</p>
              </>
            ) : null}
          </div>
        ) : (
        <div className="space-y-4 p-4">
          <p className="font-display text-5xl tracking-wide">{course.price_cents > 0 ? money(course.price_cents) : 'Gratis'}</p>
          {course.price_cents > 0 && !payReady(pay) ? (
            <p className="text-sm leading-relaxed text-black/70">{payNote('pasarela')}</p>
          ) : (
            <Checkout
              action={buyCourse}
              hidden={{ slug: course.slug }}
              label={course.price_cents > 0 ? 'Inscribirme ahora' : 'Empezar gratis'}
              pay={course.price_cents > 0 || course.bump ? pay : undefined}
              bump={course.bump}
              coupon={course.price_cents > 0}
            />
          )}
        </div>
        )}
      </aside>
    </div>
  );
}
