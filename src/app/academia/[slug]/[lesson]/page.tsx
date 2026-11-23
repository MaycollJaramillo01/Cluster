import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { academiaPersonId } from '@/lib/valux/session';
import { completeLesson, submitMission } from '@/lib/valux/actions';
import { canReadCourse, lessonAccess, personXp, publishedLesson } from '@/lib/valux/data';
import { levelFor, parseMission, publicMission } from '@/lib/valux/mission';
import { trackEvent } from '@/lib/valux/events';
import { bunnyVideo, directLessonVideo, lessonEmbed } from '@/lib/valux/video';
import { getLessonQuestions } from '@/lib/valux/course-community';
import { postLessonQuestion } from '@/lib/valux/community-actions';
import { LessonText } from '@/components/academia/ui';
import { LessonAssignment } from '@/components/academia/LessonAssignment';
import { LessonNotes } from '@/components/academia/LessonNotes';
import { MobileSyllabus } from '@/components/academia/MobileSyllabus';
import { getLessonNote } from '@/lib/valux/lesson-notes';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { ScrollTop } from '@/components/academia/ScrollTop';
import { Icon } from '@/components/ui/Icon';
import { TEXT_TEMPLATE_KIND } from '@/lib/valux/upload';

type Item = { id: string; slug: string; title: string; section_id: string; duration_min: number | null };

const primaryClass = 'inline-flex min-h-11 items-center justify-center gap-2 bg-brand px-4 py-2 text-sm font-semibold text-ink hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
const secondaryClass = 'inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-white px-4 py-2 text-sm font-medium hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function YoutubeLink({ embed }: { embed: string }) {
  const prefix = 'https://www.youtube.com/embed/';
  if (!embed.startsWith(prefix)) return null;
  return (
    <a className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4" href={`https://www.youtube.com/watch?v=${embed.slice(prefix.length)}`} target="_blank" rel="noopener noreferrer">
      <Icon name="play" size={16} aria-hidden="true" /> Ver en YouTube
    </a>
  );
}

function missionNote(code: string, kind: 'quiz' | 'checklist') {
  if (code === 'pendiente') return 'Responde la misión para completar esta clase.';
  const [correct, total] = code.split('-');
  return kind === 'checklist'
    ? `Marcaste ${correct} de ${total} pasos. Marca todos para aprobar la misión.`
    : `Acertaste ${correct} de ${total}. Repasa la clase y vuelve a intentarlo.`;
}

// Casilla de estado del temario: hecha, actual, disponible o cerrada.
function Status({ done, current, locked }: { done: boolean; current: boolean; locked: boolean }) {
  if (done) {
    return (
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center bg-brand text-ink">
        <Icon name="check" size={12} strokeWidth={3} />
        <span className="sr-only">Completada:</span>
      </span>
    );
  }
  if (locked) {
    return (
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <Icon name="lock" size={14} />
        <span className="sr-only">Cerrada:</span>
      </span>
    );
  }
  return <span className={`mt-0.5 size-4 shrink-0 border-2 ${current ? 'border-brand' : 'border-black/25'}`} aria-hidden="true" />;
}

function Syllabus({
  groups,
  current,
  done,
  isLocked,
  href,
  summary,
}: {
  groups: { id: string; title: string; lessons: Item[] }[];
  current: string;
  done: Set<string>;
  isLocked: (item: Item) => boolean;
  href: (item: Item) => string;
  summary: string;
}) {
  return (
    <nav aria-label="Contenido del curso" className="bg-white text-ink">
      <header className="border-b border-black/10 px-5 py-4">
        <p className="font-semibold">Contenido del curso</p>
        <p className="mt-1 text-sm text-ink/70">{summary}</p>
      </header>
      {groups.map((group) => (
        <section key={group.id} className="border-b border-black/10 pb-2">
          <header className="flex items-baseline justify-between gap-3 bg-paper px-5 py-3 text-sm">
            <h2 className="min-w-0 break-words font-semibold normal-case">{group.title}</h2>
            <span className="shrink-0 tabular-nums text-ink/65">
              {group.lessons.filter((item) => done.has(item.id)).length}/{group.lessons.length}
            </span>
          </header>
          <ol>
            {group.lessons.map((item) => {
              const isCurrent = item.slug === current;
              const locked = isLocked(item);
              const body = (
                <>
                  <Status done={done.has(item.id)} current={isCurrent} locked={locked} />
                  <span className="min-w-0 flex-1 break-words">{item.title}</span>
                  {item.duration_min ? <span className="shrink-0 text-xs tabular-nums text-ink/65">{item.duration_min} min</span> : null}
                </>
              );
              const row = 'flex items-start gap-3 px-4 py-3 text-sm transition-colors duration-150';
              return (
                <li key={item.id}>
                  {locked ? (
                    <p className={`${row} text-ink/65`} aria-current={isCurrent ? 'page' : undefined}>{body}</p>
                  ) : (
                    <Link
                      href={href(item)}
                      prefetch={false}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`${row} border-l-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset ${isCurrent ? 'border-brand bg-paper-soft font-semibold' : 'border-transparent hover:bg-paper'}`}
                    >
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </nav>
  );
}

export default async function LessonPlayer({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lesson: string }>;
  searchParams: Promise<{ mision?: string; r?: string; pregunta?: string }>;
}) {
  const [{ slug, lesson: lessonSlug }, { mision, r, pregunta }, personId] = await Promise.all([params, searchParams, academiaPersonId()]);
  // Respuestas del intento anterior, para volver a marcarlas.
  const picks = (r || '').split('.');
  const detail = await publishedLesson(slug, lessonSlug);
  if (!detail) notFound();
  const { course, lesson } = detail;
  const [canRead, access] = await Promise.all([canReadCourse(personId, course), lessonAccess(personId, course)]);
  const { done, order, pending } = access;
  if (!canRead && lesson.preview_public && course.price_cents > 0) {
    const embed = bunnyVideo(lesson.video_url) ? '' : lessonEmbed(lesson.video_url);
    const direct = !embed && directLessonVideo(lesson.video_url);
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <VStack gap={5}>
          <Link href={`/academia/${slug}#temario`} className="text-sm font-semibold underline">← Volver al temario</Link>
          <p className="text-sm font-semibold">Clase de muestra</p>
          <Heading level={1} className="break-words font-brand text-3xl font-semibold sm:text-4xl">{lesson.title}</Heading>
          {embed ? <iframe className="aspect-video w-full bg-ink" title={lesson.title} src={embed} allow="encrypted-media; picture-in-picture" allowFullScreen /> : null}
          {direct ? <video className="aspect-video w-full bg-ink" aria-label={lesson.title} src={direct} controls playsInline preload="metadata" /> : null}
          <YoutubeLink embed={embed} />
          {lesson.content ? <LessonText text={lesson.content} /> : null}
          <Link href={`/academia/${slug}?inscripcion=1`} className={primaryClass}>Inscribirme al curso</Link>
        </VStack>
      </main>
    );
  }
  const locked = canRead && !access.unlocked.has(lesson.id);
  const open = canRead && !locked;
  const signedIn = access.person?.is_active === true;
  const [note, xp, questions] = await Promise.all([
    open && signedIn ? getLessonNote(personId, lesson.id) : null,
    mision === 'ok' && done.has(lesson.id) ? personXp(personId) : 0,
    open && signedIn ? getLessonQuestions(lesson.id, personId) : [],
    open && signedIn ? trackEvent('lesson_started', { id: `lesson_started:${personId}:${lesson.id}`, personId, data: { lesson: lesson.id, course: course.id } }) : null,
  ]);
  const mission = open ? parseMission(lesson.mission).mission : null;
  const shown = mission ? publicMission(mission) : null;
  const approved = mision === 'ok';
  const index = order.findIndex((item) => item.slug === lessonSlug);
  const previous = order[index - 1] && canRead && access.unlocked.has(order[index - 1].id) ? order[index - 1] : null;
  const next = order[index + 1];
  const isDone = done.has(lesson.id);
  const doneCount = order.filter((item) => done.has(item.id)).length;
  const pct = order.length ? Math.round((doneCount / order.length) * 100) : 0;
  const href = (item: { slug: string }) => `/academia/${slug}/${item.slug}`;
  const reviewTarget = next && access.unlocked.has(next.id) ? next : pending;
  const nextLabel = next || (pending && pending.id !== lesson.id) ? 'Completar y continuar' : 'Completar curso';
  // El enlace firmado solo se genera para quien puede ver la clase.
  const video = open ? lessonEmbed(lesson.video_url) : '';
  const directVideo = open && !video ? directLessonVideo(lesson.video_url) : '';
  const known = new Set(course.sections.map((section) => section.id));
  const loose = order.filter((item) => !known.has(item.section_id));
  const groups = [
    ...course.sections.map((section) => ({ id: section.id, title: section.title, lessons: order.filter((item) => item.section_id === section.id) })),
    ...(loose.length ? [{ id: 'sueltas', title: course.sections.length ? 'Otras clases' : 'Clases', lessons: loose }] : []),
  ].filter((group) => group.lessons.length);
  const sectionTitle = groups.find((group) => group.lessons.some((item) => item.id === lesson.id))?.title;
  const summary = personId ? `${doneCount} de ${order.length} completadas` : `${order.length} ${order.length === 1 ? 'clase' : 'clases'}`;
  const syllabus = (
    <Syllabus groups={groups} current={lessonSlug} done={done} isLocked={(item) => !canRead || !access.unlocked.has(item.id)} href={href} summary={summary} />
  );

  // Una sola acción principal: "Siguiente clase" completa esta clase y abre la otra.
  // Con misión pendiente, la acción lleva a la misión; nunca a una clase cerrada.
  const arrow = <Icon name="arrow-right" size={16} aria-hidden="true" />;
  let primary: ReactNode = null;
  let status = '';
  if (!canRead && access.person && !signedIn) {
    status = 'Acceso suspendido';
  } else if (!canRead) {
    primary = <Link href={`/academia/${slug}?inscripcion=1`} className={primaryClass}>Inscribirme al curso {arrow}</Link>;
  } else if (!signedIn) {
    primary = <Link href={`/academia/entrar?modo=registro&curso=${encodeURIComponent(slug)}`} className={primaryClass}>Entra para guardar tu avance</Link>;
  } else if (locked) {
    primary = pending ? <Link href={href(pending)} className={primaryClass}>Ir a la clase pendiente {arrow}</Link> : null;
  } else if (shown && !isDone) {
    primary = <a href="#mision" className={primaryClass}>{shown.kind === 'assignment' ? 'Ver tarea' : 'Responder la misión'}</a>;
    status = shown.kind === 'assignment' ? 'La siguiente clase se abre cuando tu profesor apruebe la tarea.' : 'Aprueba la misión para abrir la siguiente clase.';
  } else if (isDone) {
    primary = <Link href={reviewTarget ? href(reviewTarget) : `/academia/${slug}?terminado=1`} prefetch={false} className={primaryClass}>
      {reviewTarget ? (reviewTarget.id === next?.id ? 'Siguiente clase' : 'Retomar avance') : 'Ver curso completado'} {arrow}
    </Link>;
    status = 'Clase completada';
  } else {
    primary = (
      <form action={completeLesson}>
        <input type="hidden" name="lesson_id" value={lesson.id} />
        <SubmitButton pending="Guardando avance…" className="px-4 text-sm font-semibold sm:w-auto">{nextLabel} {arrow}</SubmitButton>
      </form>
    );
  }

  return (
    <VStack gap={0} className="min-h-screen bg-paper text-ink">
      <ScrollTop key={`${lessonSlug}?${mision || ''}${r || ''}`} />
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-ink px-4 text-white">
        <Link href={`/academia/${slug}`} aria-label={`Volver al curso: ${course.title}`} className="flex min-h-11 min-w-0 items-center gap-2 text-sm transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2">
          <Icon name="arrow-right" size={16} className="shrink-0 rotate-180" />
          <span className="truncate">{course.title}</span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {personId ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs tabular-nums text-white/60 sm:inline">{doneCount} de {order.length} · {pct}%</span>
              <span
                role="progressbar"
                aria-label="Tu avance en el curso"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="block h-1 w-20 bg-white/15 sm:w-28"
              >
                <span className="t-progress block h-1 bg-brand" style={{ width: `${pct}%` }} />
              </span>
            </div>
          ) : null}
          {/* Celular: el temario se abre como hoja completa bajo la barra. Se cierra solo al cambiar de clase. */}
          <MobileSyllabus key={lessonSlug}>{syllabus}</MobileSyllabus>
        </div>
      </header>

      <section className="lg:grid lg:grid-cols-4">
        <main className="flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-col lg:col-span-3">
          {video ? (
            <div className="bg-black">
              <iframe className="aspect-video w-full" src={video} title={lesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          ) : directVideo ? (
            <video className="aspect-video w-full bg-black" src={directVideo} controls playsInline preload="metadata" aria-label={lesson.title} />
          ) : null}

          <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 md:px-8">
            <p className="text-sm text-black/55">
              {sectionTitle ? `${sectionTitle} · ` : ''}Clase {index + 1} de {order.length}
              {lesson.duration_min ? ` · ${lesson.duration_min} min` : ''}
            </p>
            <Heading level={1} className="mt-3 break-words font-brand text-3xl font-semibold normal-case leading-tight sm:text-4xl">{lesson.title}</Heading>
            {open && (lesson.resources.length || shown || signedIn) ? (
              <nav aria-label="Secciones de la clase" className="mt-4 flex flex-wrap gap-2 border-b border-black/10 pb-3">
                <a href="#resumen-clase" className={secondaryClass}>Resumen</a>
                {lesson.resources.length ? <a href="#materiales-clase" className={secondaryClass}>Materiales</a> : null}
                {shown ? <a href="#mision" className={secondaryClass}>{shown.kind === 'assignment' ? 'Tarea' : 'Actividad'}</a> : null}
                {signedIn ? <a href="#mis-notas" className={secondaryClass}>Mis notas</a> : null}
                {signedIn ? <a href="#preguntas" className={secondaryClass}>Preguntas</a> : null}
              </nav>
            ) : null}

            {open ? (
              <VStack gap={8} className="mt-8">
                <section id="resumen-clase" aria-label="Resumen de la clase" className="scroll-mt-24 space-y-4">
                <YoutubeLink embed={video} />
                {!video && !directVideo && lesson.video_url.startsWith('https://') && !lesson.video_url.includes('mediadelivery.net') ? (
                  <a className={secondaryClass} href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                    <Icon name="play" size={16} /> Abrir video
                  </a>
                ) : null}
                {lesson.content ? <LessonText text={lesson.content} /> : <p className="text-sm text-ink/65">Esta clase no tiene texto adicional.</p>}
                </section>

                {lesson.resources.length > 0 ? (
                  <section id="materiales-clase" className="scroll-mt-24">
                    <h2 className="text-lg font-semibold">Materiales</h2>
                    <ul className="mt-3 divide-y divide-black/10 border border-black/10 bg-white">
                      {lesson.resources.map((resource) => (
                        <li key={resource.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                          <Icon name={resource.url ? 'link' : 'pen'} size={16} className="mt-0.5 shrink-0 text-black/45" />
                          <div className="min-w-0">
                            {resource.kind === TEXT_TEMPLATE_KIND ? (
                              signedIn ? <a className="font-medium underline underline-offset-2" href={`/api/academia/descargas/recurso/${encodeURIComponent(resource.id)}`} download>{resource.title} (.txt)</a>
                                : <Link className="font-medium underline underline-offset-2" href={`/academia/entrar?curso=${encodeURIComponent(slug)}`}>Entra para descargar {resource.title}</Link>
                            ) : resource.url ? (
                              <a className="font-medium underline-offset-2 hover:underline" href={`/api/academia/descargas/recurso/${encodeURIComponent(resource.id)}`} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                            ) : (
                              <span className="font-medium">{resource.title}</span>
                            )}
                            {resource.kind === TEXT_TEMPLATE_KIND ? <span className="ml-2 text-xs text-black/65">Descarga privada</span> : resource.kind ? <span className="ml-2 text-xs text-black/45">{resource.kind.charAt(0).toUpperCase() + resource.kind.slice(1)}</span> : null}
                            {resource.content && resource.kind !== TEXT_TEMPLATE_KIND ? <p className="mt-1 whitespace-pre-wrap text-black/65">{resource.content}</p> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shown?.kind === 'assignment' ? (
                  <LessonAssignment lessonId={lesson.id} personId={personId} instructions={shown.instructions} done={isDone} error={mision === 'respuesta'} points={lesson.points} />
                ) : shown ? (
                  <section id="mision" className="scroll-mt-20 border border-black/10 bg-white">
                    <div className="flex items-baseline justify-between gap-3 border-b border-black/10 px-5 py-4">
                      <h2 className="text-lg font-semibold">Misión</h2>
                      <span className="text-sm tabular-nums text-black/55">
                        {isDone ? 'Aprobada' : `+${lesson.points} XP`}
                      </span>
                    </div>
                    <div className="space-y-5 p-5">
                      {approved && isDone ? (
                        <div className="flex flex-wrap items-center gap-4 bg-paper p-4">
                          <span className="t-success-check flex h-10 w-10 items-center justify-center bg-brand text-ink" data-state="in" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <p className="min-w-0 flex-1 text-sm" role="status">
                            <span className="block font-medium">Misión aprobada</span>
                            <span className="text-black/60">Llevas {xp} XP · nivel {levelFor(xp)}. {next ? 'La siguiente clase ya está abierta.' : 'Completaste la última clase.'}</span>
                          </p>
                        </div>
                      ) : null}
                      {mision && !approved && !isDone ? <p className="bg-paper p-4 text-sm" role="status">{missionNote(mision, shown.kind)}</p> : null}
                      {!personId ? (
                        <p className="text-sm text-black/70"><Link className="underline" href="/academia/entrar">Entra</Link> para hacer la misión y guardar tu avance.</p>
                      ) : isDone && !approved ? (
                        <p className="text-sm text-black/65">Ya aprobaste esta misión.</p>
                      ) : !isDone ? (
                        <form action={submitMission} className="space-y-6">
                          <input type="hidden" name="lesson_id" value={lesson.id} />
                          {shown.kind === 'quiz' ? shown.questions.map((question, number) => (
                            <fieldset key={number} className="space-y-2">
                              <legend className="mb-2 text-base font-medium">{number + 1}. {question.prompt}</legend>
                              {question.options.map((option, choice) => (
                                <label key={choice} className="flex cursor-pointer items-start gap-3 border border-black/10 px-4 py-3 text-sm transition-colors duration-150 hover:border-black/30 has-[:checked]:border-ink has-[:checked]:bg-paper">
                                  <input type="radio" name={`q${number}`} value={choice} required defaultChecked={picks[number] === String(choice)} className="mt-0.5 accent-[#111111]" />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </fieldset>
                          )) : (
                            <fieldset className="space-y-2">
                              <legend className="mb-2 text-sm text-black/65">Marca cada paso cuando lo hayas hecho en tu negocio.</legend>
                              {shown.items.map((item, number) => (
                                <label key={number} className="flex cursor-pointer items-start gap-3 border border-black/10 px-4 py-3 text-sm transition-colors duration-150 hover:border-black/30 has-[:checked]:border-ink has-[:checked]:bg-paper">
                                  <input type="checkbox" name={`item${number}`} value="1" defaultChecked={picks[number] === '1'} className="mt-0.5 accent-[#111111]" />
                                  <span>{item}</span>
                                </label>
                              ))}
                            </fieldset>
                          )}
                          <button className="bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90" type="submit">
                            {shown.kind === 'quiz' ? 'Comprobar respuestas' : 'Confirmar pasos'}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </section>
                ) : null}
                {signedIn ? <LessonNotes key={lesson.id} lessonId={lesson.id} note={note} /> : null}
                {signedIn ? (
                  <section id="preguntas" className="scroll-mt-24 space-y-4 border border-black/10 bg-white p-4 sm:p-5">
                    <h2 className="text-lg font-semibold">Preguntas de la clase</h2>
                    <p className="text-sm text-black/70">Tu pregunta y la respuesta son privadas entre tú y el equipo del curso.</p>
                    {pregunta === 'ok' ? <p role="status" className="text-sm font-semibold">Pregunta enviada al profesor.</p> : null}
                    {pregunta === 'error' ? <p role="alert" className="text-sm text-red-800">Escribe entre 5 y 2.000 caracteres.</p> : null}
                    <form action={postLessonQuestion} className="space-y-3">
                      <input type="hidden" name="lesson_id" value={lesson.id} />
                      <label className="block text-sm font-semibold">Tu pregunta
                        <textarea className="mt-2 block w-full border border-black/20 bg-white p-3 text-ink" rows={3} name="question" required minLength={5} maxLength={2000} />
                      </label>
                      <SubmitButton pending="Enviando…" className="sm:w-auto">Enviar pregunta</SubmitButton>
                    </form>
                    {questions.length ? <ul className="divide-y divide-black/10">
                      {questions.map((item) => <li key={item.id} className="space-y-2 py-3 text-sm">
                        <p className="whitespace-pre-wrap break-words font-medium">{item.question}</p>
                        {item.answer ? <p className="whitespace-pre-wrap break-words"><strong>Respuesta del equipo</strong>{'\n'}{item.answer}</p> : <p className="text-black/70">Esperando respuesta</p>}
                      </li>)}
                    </ul> : null}
                  </section>
                ) : null}
              </VStack>
            ) : (
              <div className="mt-8 border border-black/10 bg-white p-5">
                <p className="flex items-center gap-2 font-medium">
                  <Icon name="lock" size={16} />
                  {status === 'Acceso suspendido' ? status : !canRead ? 'Esta clase es parte de un curso de pago' : signedIn ? 'Esta clase todavía está cerrada' : 'Entra para seguir el curso'}
                </p>
                <p className="mt-2 text-sm text-black/65">
                  {status === 'Acceso suspendido' ? 'Contacta al equipo de Academia para recuperar tu acceso.' : !canRead
                    ? 'Inscríbete para ver el video, las notas y la misión.'
                    : personId
                      ? <>Las clases se abren en orden.{pending ? <> Completa «{pending.title}» para seguir.</> : null}</>
                      : 'Tu avance queda guardado y las clases se abren en orden.'}
                </p>
              </div>
            )}
          </div>

          {/* Barra fija abajo: la acción principal siempre a un clic. */}
          <div className="sticky bottom-0 z-20 border-t border-black/10 bg-white">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-8">
              {previous ? (
                <Link href={href(previous)} className={secondaryClass} aria-label={`Clase anterior: ${previous.title}`}>
                  <Icon name="arrow-right" size={16} className="rotate-180" />
                  <span className="hidden sm:inline">Anterior</span>
                </Link>
              ) : null}
              <p className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-black/55 sm:flex">
                {status === 'Clase completada' ? <Icon name="check" size={16} strokeWidth={2.25} className="shrink-0 text-ink" /> : null}
                <span className="truncate">{status}</span>
              </p>
              <div className="ml-auto">{primary}</div>
            </div>
          </div>
        </main>

        <aside className="hidden min-w-0 border-l border-black/10 bg-white lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {syllabus}
        </aside>
      </section>
    </VStack>
  );
}
