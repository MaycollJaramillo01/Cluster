import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cover, LessonMark, PayMethod, durationLabel, payHint, payNote, payReady } from '@/components/academia/ui';
import { CourseCheckoutForm } from '@/components/academia/CourseCheckoutForm';
import { CertificateRequest } from '@/components/academia/CertificateRequest';
import { academyMoney as money } from '@/lib/valux/money';
import { buyCourse, buyUpsell } from '@/lib/valux/actions';
import { canReadCourse, getPerson, lessonAccess, ownsCourse, publishedCourse } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { paymentOptions } from '@/lib/valux/transfers';
import { advanceStage } from '@/lib/valux/events';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { VStack } from '@astryxdesign/core/VStack';
import { getCourseReviews } from '@/lib/valux/course-community';
import { saveCourseReview } from '@/lib/valux/community-actions';

const primaryAction = 'flex min-h-12 w-full items-center justify-center gap-2 bg-brand px-4 py-3 text-center text-sm font-semibold text-ink hover:bg-brand/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export default async function CourseCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string; terminado?: string; inscripcion?: string; constancia?: string; resena?: string }>;
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
  const hasAccess = Boolean(personId) && (course.price_cents <= 0 ? enrolled : await canReadCourse(personId, course));
  const coursePath = `/academia/${course.slug}`;
  const checkoutPath = `${coursePath}?inscripcion=1`;
  const paid = course.price_cents > 0;
  const priceLabel = paid ? money(course.price_cents) : 'Gratis';
  const bump = payReady(pay) ? course.bump : null;
  const registration = `/academia/entrar?modo=registro&curso=${encodeURIComponent(course.slug)}`;
  const person = !hasAccess ? await getPerson(personId) : null;
  const suspended = person?.is_active === false;
  const contact = person?.is_active ? { name: person.name || person.email, email: person.email } : undefined;

  if (!hasAccess && !suspended && (query.inscripcion === '1' || (paid && query.error && query.error !== 'reembolso'))) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href={coursePath} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">← Volver al curso</Link>
        <h1 className="my-5 font-display text-5xl tracking-wide text-ink sm:text-6xl">Inscripción</h1>
        <section className="grid items-start gap-5 md:grid-cols-3">
          <aside aria-label="Resumen del curso" className="overflow-hidden border border-black/10 bg-white">
            <section aria-hidden="true" className="hidden md:block"><Cover url={course.cover_url} title={course.title} slug={course.slug} eager /></section>
            <section className="p-5">
              <VStack gap={2}>
              <h2 className="text-balance font-brand text-lg font-semibold normal-case leading-snug">{course.title}</h2>
              <p className="text-sm text-black/65">{lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}</p>
              <p className="border-t border-black/10 pt-3 font-display text-4xl tracking-wide">{priceLabel}</p>
              </VStack>
            </section>
          </aside>
          <section aria-label="Datos de inscripción" className="space-y-5 border border-black/10 bg-white p-5 sm:p-8 md:col-span-2">
            {query.error && (payReady(pay) || query.error !== 'pasarela') ? <p role="alert" className="border border-black/15 bg-paper p-3 text-sm text-ink">{payNote(query.error)}</p> : null}
            {paid && !payReady(pay) ? (
              <p>{payNote('pasarela')}</p>
            ) : !paid && !contact ? (
              <Link href={registration} className={primaryAction}>Crear cuenta para inscribirme</Link>
            ) : (
              <>
                <CourseCheckoutForm
                  hidden={{ slug: course.slug }}
                  label={paid ? 'Continuar al pago' : 'Confirmar inscripción'}
                  pay={paid || bump ? pay : undefined}
                  bump={bump}
                  coupon={paid}
                  contact={contact}
                  note={paid ? payHint(pay) : undefined}
                />
              </>
            )}
          </section>
        </section>
      </main>
    );
  }
  const [access, reviews] = await Promise.all([
    hasAccess ? lessonAccess(personId, course) : null,
    getCourseReviews(course.id, personId),
  ]);
  const doneCount = access ? access.order.filter((lesson) => access.done.has(lesson.id)).length : 0;
  const nextLesson = access?.pending;
  const finished = Boolean(access) && lessonCount > 0 && !nextLesson;
  const pct = lessonCount ? Math.round((doneCount / lessonCount) * 100) : 0;
  const lessonUrl = (lesson: { slug: string }) => `/academia/${course.slug}/${lesson.slug}`;
  const sample = paid && !hasAccess ? course.lessons.find((lesson) => lesson.preview_public) : null;
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
    <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-8 lg:grid-cols-3 lg:gap-8">
        <section className="py-2 sm:py-4 lg:col-span-2">
          <p className="text-sm"><Link href="/academia" className="font-medium underline underline-offset-4">← Cursos</Link></p>
          <h1 className="mt-4 text-balance break-words font-brand text-3xl font-bold normal-case leading-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-black/75">{course.description}</p>
          {course.teacher_name ? <p className="mt-4 text-sm">Por {course.teacher_name}</p> : null}
          <p className="mt-3 text-sm text-black/65">
            {lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}
            {minutes ? ` · ${durationLabel(minutes)} de contenido` : ''}
            {course.students ? ` · ${course.students} ${course.students === 1 ? 'alumno' : 'alumnos'}` : ''}
          </p>
        </section>

      <article className="order-3 space-y-8 lg:col-span-2">
        {query.ok && hasAccess ? <p className="border border-brand/40 bg-white px-4 py-3 text-sm">Acceso listo.</p> : null}
        {query.terminado && finished ? (
          <p className="border border-brand/40 bg-white px-4 py-3 text-sm">
            Terminaste el curso: completaste {lessonCount === 1 ? 'la clase' : `las ${lessonCount} clases`}.
          </p>
        ) : null}
        {query.constancia === 'nombre' ? <p role="alert" className="border border-black/15 bg-white p-4 text-sm">
          Guarda tu nombre en <Link href="/academia/perfil" className="font-semibold underline underline-offset-4">Mi perfil</Link> tal como quieres que aparezca en la constancia.
        </p> : null}
        {query.constancia === 'acceso' ? <p role="alert" className="border border-black/15 bg-white p-4 text-sm">Necesitas una cuenta activa y acceso al curso para emitir la constancia.</p> : null}
        {query.constancia === 'incompleto' ? <p role="alert" className="border border-black/15 bg-white p-4 text-sm">Completa todas las clases y aprueba sus actividades para emitir la constancia.</p> : null}
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

        {course.learning_outcomes.length ? <section className="space-y-3">
          <h2 className="text-xl font-medium">Qué aprenderás</h2>
          <ul className="list-disc space-y-2 border border-black/10 bg-white py-4 pl-9 pr-5 text-sm leading-relaxed">
            {course.learning_outcomes.map((outcome, index) => <li className="break-words" key={index}>{outcome}</li>)}
          </ul>
        </section> : null}

        <section id="temario" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-medium">Contenido del curso</h2>
            <p className="text-sm text-black/65">{course.sections.length ? `${course.sections.length} secciones · ` : ''}{lessonCount} {lessonCount === 1 ? 'clase' : 'clases'}</p>
          </div>
          {!hasAccess && paid ? <p className="text-sm text-black/70">Las clases se habilitan al inscribirte.</p> : null}
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
                  {group.lessons.map((lesson) => {
                    const preview = paid && !hasAccess && lesson.preview_public;
                    const locked = !preview && (access ? !access.unlocked.has(lesson.id) : paid);
                    const row = 'flex min-h-11 items-center gap-3 px-4 py-3 text-sm';
                    const contents = <>
                      {(locked || access) ? <LessonMark done={Boolean(access?.done.has(lesson.id))} locked={locked} /> : null}
                      <span className="min-w-0 flex-1 break-words">{lesson.title}</span>
                      {preview ? <span className="shrink-0 text-xs font-semibold underline">Ver muestra</span> : null}
                      {lesson.duration_min ? <span className="shrink-0 text-xs text-black/65">{lesson.duration_min} min</span> : null}
                    </>;
                    return (
                      <li key={lesson.id} className="border-b border-black/5 last:border-0">
                        {locked ? <p className={`${row} text-black/70`}>{contents}</p> : (
                          <Link prefetch={false} href={lessonUrl(lesson)} className={`${row} hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset`}>{contents}</Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </section>

        {course.audience || course.prerequisites ? <section className="space-y-5">
          {course.audience ? <section className="space-y-2"><h2 className="text-xl font-medium">Para quién es</h2><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{course.audience}</p></section> : null}
          {course.prerequisites ? <section className="space-y-2"><h2 className="text-xl font-medium">Requisitos</h2><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{course.prerequisites}</p></section> : null}
        </section> : null}
        <section id="resenas" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-medium">Reseñas de alumnos</h2>
          <p className="text-sm text-black/70">{reviews.count ? `${reviews.average.toLocaleString('es-HN')} de 5 · ${reviews.count} ${reviews.count === 1 ? 'reseña' : 'reseñas'}` : 'Aún no hay reseñas publicadas.'}</p>
          {reviews.reviews.length ? <ul className="divide-y divide-black/10 border border-black/10 bg-white">
            {reviews.reviews.map((review, index) => <li key={index} className="space-y-2 p-4 text-sm">
              <p className="font-semibold">{review.rating} de 5 · Alumno verificado</p>
              {review.body ? <p className="whitespace-pre-wrap break-words">{review.body}</p> : null}
            </li>)}
          </ul> : null}
          {query.resena === 'error' || query.resena === 'acceso' ? <p role="alert" className="text-sm text-red-800">{query.resena === 'acceso' ? 'Inscríbete y completa una clase para dejar tu reseña.' : 'Selecciona una calificación del 1 al 5 y escribe hasta 1.500 caracteres.'}</p> : null}
          {reviews.eligible ? (
            <form action={saveCourseReview} className="space-y-3 border border-black/10 bg-white p-4">
              <input type="hidden" name="slug" value={course.slug} />
              <h3 className="font-semibold">Tu reseña</h3>
              {reviews.own ? <p role="status" className="text-sm">{reviews.own.status === 'pendiente' ? 'Tu reseña está en moderación.' : reviews.own.status === 'publicada' ? 'Tu reseña está publicada.' : 'Tu reseña está oculta. Puedes editarla para enviarla de nuevo.'}</p> : null}
              <label className="block text-sm font-medium">Calificación
                <select name="rating" defaultValue={reviews.own?.rating ?? ''} required className="mt-2 block min-h-11 border border-black/20 bg-white px-3 text-ink">
                  <option value="" disabled>Selecciona del 1 al 5</option>
                  {[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} de 5</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Tu experiencia (opcional)
                <textarea name="body" defaultValue={reviews.own?.body ?? ''} maxLength={1500} rows={3} className="mt-2 block w-full border border-black/20 bg-white p-3 text-ink" />
              </label>
              <SubmitButton pending="Guardando…" className="sm:w-auto">Enviar reseña</SubmitButton>
            </form>
          ) : null}
        </section>
      </article>

      <aside className="border border-black/10 bg-white lg:sticky lg:top-24 lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <section aria-hidden="true" className="hidden lg:block"><Cover url={course.cover_url} title={course.title} slug={course.slug} eager /></section>
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
                {access.person?.is_active ? <CertificateRequest slug={course.slug} /> : null}
                <Link prefetch={false} href={lessonUrl(access.order[0])} className="block text-center text-sm text-black/55 underline">Repasar desde la primera clase</Link>
              </>
            ) : nextLesson ? (
              <>
                <Link prefetch={false} href={lessonUrl(nextLesson)} className="block w-full bg-brand px-4 py-3 text-center text-sm font-medium text-ink">
                  {doneCount ? 'Continuar' : 'Empezar el curso'}
                </Link>
                <p className="text-sm text-black/55">{doneCount ? 'Sigue' : 'Primera clase'}: {nextLesson.title}</p>
              </>
            ) : null}
          </div>
        ) : (
        <section aria-label="Inscripción al curso" className="space-y-4 p-5 sm:p-6">
          <p className="font-display text-4xl tracking-wide sm:text-5xl">{priceLabel}</p>
          {suspended ? (
            <p role="status" className="text-sm leading-relaxed text-black/70">{payNote('suspendido')}</p>
          ) : paid && !payReady(pay) ? (
            <p className="text-sm leading-relaxed text-black/70">{payNote('pasarela')}</p>
          ) : !paid && contact && !bump ? (
            <form action={buyCourse}>
              <input type="hidden" name="slug" value={course.slug} />
              <SubmitButton className={primaryAction} pending="Inscribiendo…">Empezar gratis</SubmitButton>
            </form>
          ) : (
            <Link href={!paid && !contact ? registration : checkoutPath} className={primaryAction}>
              {paid ? 'Inscribirme ahora' : 'Empezar gratis'}
              <Icon name="arrow-right" size={17} aria-hidden="true" />
            </Link>
          )}
          {sample ? <Link href={lessonUrl(sample)} className="flex min-h-11 items-center justify-center border border-black/20 px-3 text-sm font-semibold">Ver clase de muestra</Link> : null}
        </section>
        )}
      </aside>
    </main>
  );
}
