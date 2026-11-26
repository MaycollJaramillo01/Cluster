import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
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

const primaryClass = 'academy-action academy-action-primary';
const secondaryClass = 'academy-action academy-action-secondary';

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
      <i className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-academy bg-academy-tint text-academy-primary">
        <Icon name="check" size={12} strokeWidth={3} />
        <small className="sr-only">Completada:</small>
      </i>
    );
  }
  if (locked) {
    return (
      <i className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-academy-muted">
        <Icon name="lock" size={14} />
        <small className="sr-only">Cerrada:</small>
      </i>
    );
  }
  return <i className={`mt-0.5 size-4 shrink-0 rounded-academy border-2 ${current ? 'border-academy-primary' : 'border-academy-line'}`} aria-hidden="true" />;
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
    <nav aria-label="Contenido del curso" className="overflow-hidden rounded-academy-lg bg-academy-surface text-academy-ink">
      <header className="border-b border-academy-line px-5 py-4">
        <Heading level={2} className="text-lg font-bold">Contenido del curso</Heading>
        <p className="mt-1 text-sm text-academy-muted">{summary}</p>
      </header>
      {groups.map((group) => (
        <section key={group.id} className="border-b border-academy-line pb-2">
          <header className="flex items-baseline justify-between gap-3 px-5 py-3 text-sm">
            <Heading level={3} className="min-w-0 break-words text-sm font-semibold">{group.title}</Heading>
            <Text className="shrink-0 text-sm tabular-nums text-academy-muted">
              {group.lessons.filter((item) => done.has(item.id)).length}/{group.lessons.length}
            </Text>
          </header>
          <ol>
            {group.lessons.map((item) => {
              const isCurrent = item.slug === current;
              const locked = isLocked(item);
              const body = (
                <>
                  <Status done={done.has(item.id)} current={isCurrent} locked={locked} />
                  <Text type="inherit" className="min-w-0 flex-1 break-words">{item.title}</Text>
                  {item.duration_min ? <Text className="shrink-0 text-xs tabular-nums text-academy-muted">{item.duration_min} min</Text> : null}
                </>
              );
              const row = 'mx-3 my-1 flex items-start gap-3 rounded-academy px-3 py-4 text-sm transition-colors duration-150';
              return (
                <li key={item.id}>
                  {locked ? (
                    <p className={`${row} text-ink/65`} aria-current={isCurrent ? 'page' : undefined}>{body}</p>
                  ) : (
                    <Link
                      href={href(item)}
                      prefetch={false}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`${row} border-l-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset ${isCurrent ? 'border-academy-primary bg-academy-tint font-semibold text-academy-primary' : 'border-transparent bg-academy-page hover:bg-academy-tint'}`}
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
      <main className="academy-page max-w-4xl">
        <VStack gap={5}>
          <Link href={`/academia/${slug}#temario`} className="text-sm font-semibold underline">← Volver al temario</Link>
          <p className="text-sm font-semibold">Clase de muestra</p>
          <Heading level={1} className="academy-title">{lesson.title}</Heading>
          {embed ? <iframe className="aspect-video w-full rounded-academy-lg bg-academy-ink" title={lesson.title} src={embed} allow="encrypted-media; picture-in-picture" allowFullScreen /> : null}
          {direct ? <video className="aspect-video w-full rounded-academy-lg bg-academy-ink" aria-label={lesson.title} src={direct} controls playsInline preload="metadata" /> : null}
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
    <VStack gap={0} className="min-h-screen bg-academy-page text-academy-ink">
      <ScrollTop key={`${lessonSlug}?${mision || ''}${r || ''}`} />
      <HStack as="header" gap={3} align="center" className="sticky top-0 z-30 h-[var(--academy-header-size)] border-b border-academy-line bg-academy-surface px-4 sm:px-6">
        <Link href={`/academia/${slug}`} aria-label={`Volver al curso: ${course.title}`} className="academy-nav academy-focus min-w-0 px-2 font-bold text-academy-ink">
          <Icon name="arrow-right" size={16} className="shrink-0 rotate-180" />
          <strong className="truncate font-semibold">{course.title}</strong>
        </Link>
        <HStack align="center" gap={3} className="ml-auto shrink-0">
          {personId ? <small className="tabular-nums text-academy-muted sm:hidden" aria-label={`Avance del curso: ${pct}%`}>{pct}%</small> : null}
          {personId ? (
            <HStack align="center" gap={3} className="hidden sm:flex">
              <small className="tabular-nums text-academy-muted">{doneCount} de {order.length} · {pct}%</small>
              <VStack className="w-24"><ProgressBar label="Tu avance en el curso" value={pct} isLabelHidden variant={pct === 100 ? 'success' : 'accent'} /></VStack>
            </HStack>
          ) : null}
          {/* Celular: el temario se abre como hoja completa bajo la barra. Se cierra solo al cambiar de clase. */}
          <MobileSyllabus key={lessonSlug}>{syllabus}</MobileSyllabus>
        </HStack>
      </HStack>

      <section className="academy-classroom mx-auto w-full max-w-screen-2xl gap-6 p-4 sm:p-6 lg:grid lg:grid-cols-12">
        <VStack as="main" gap={0} className="min-w-0 lg:col-span-8">
          {video ? (
            <figure className="mx-auto w-full max-w-5xl overflow-hidden rounded-academy-lg">
              <iframe className="block aspect-video w-full bg-black" src={video} title={lesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </figure>
          ) : directVideo ? (
            <figure className="mx-auto w-full max-w-5xl overflow-hidden rounded-academy-lg">
              <video className="block aspect-video w-full bg-black" src={directVideo} controls playsInline preload="metadata" aria-label={lesson.title} />
            </figure>
          ) : null}

          <VStack gap={0} className="academy-panel mx-auto mt-5 w-full max-w-4xl flex-1 px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
            <p className="text-sm font-semibold text-academy-muted">
              {sectionTitle ? `${sectionTitle} · ` : ''}Clase {index + 1} de {order.length}
              {lesson.duration_min ? ` · ${lesson.duration_min} min` : ''}
            </p>
            <Heading level={1} className="mt-2 text-balance text-2xl font-bold sm:text-3xl">{lesson.title}</Heading>
            {open && (lesson.resources.length || shown || signedIn) ? (
              <nav aria-label="Secciones de la clase" className="mt-4 flex flex-wrap gap-1 border-b border-academy-line pb-3">
                <a href="#resumen-clase" className="academy-nav academy-focus">Resumen</a>
                {lesson.resources.length ? <a href="#materiales-clase" className="academy-nav academy-focus">Materiales</a> : null}
                {shown ? <a href="#mision" className="academy-nav academy-focus">{shown.kind === 'assignment' ? 'Tarea' : 'Actividad'}</a> : null}
                {signedIn ? <a href="#mis-notas" className="academy-nav academy-focus">Mis notas</a> : null}
                {signedIn ? <a href="#preguntas" className="academy-nav academy-focus">Preguntas</a> : null}
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
                          <VStack gap={1} className="min-w-0">
                            {resource.kind === TEXT_TEMPLATE_KIND ? (
                              signedIn ? <a className="font-medium underline underline-offset-2" href={`/api/academia/descargas/recurso/${encodeURIComponent(resource.id)}`} download>{resource.title} (.txt)</a>
                                : <Link className="font-medium underline underline-offset-2" href={`/academia/entrar?curso=${encodeURIComponent(slug)}`}>Entra para descargar {resource.title}</Link>
                            ) : resource.url ? (
                              <a className="font-medium underline-offset-2 hover:underline" href={`/api/academia/descargas/recurso/${encodeURIComponent(resource.id)}`} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                            ) : (
                              <strong className="font-medium">{resource.title}</strong>
                            )}
                            {resource.kind === TEXT_TEMPLATE_KIND ? <small className="text-xs text-academy-muted">Descarga privada</small> : resource.kind ? <small className="text-xs text-academy-muted">{resource.kind.charAt(0).toUpperCase() + resource.kind.slice(1)}</small> : null}
                            {resource.content && resource.kind !== TEXT_TEMPLATE_KIND ? <p className="mt-1 whitespace-pre-wrap text-black/65">{resource.content}</p> : null}
                          </VStack>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shown?.kind === 'assignment' ? (
                  <LessonAssignment lessonId={lesson.id} personId={personId} instructions={shown.instructions} done={isDone} error={mision === 'respuesta'} points={lesson.points} />
                ) : shown ? (
                  <section id="mision" className="academy-panel scroll-mt-24">
                    <HStack align="center" justify="between" gap={3} className="border-b border-academy-line px-5 py-4">
                      <h2 className="text-lg font-bold">Misión</h2>
                      <small className="text-sm tabular-nums text-academy-primary">
                        {isDone ? 'Aprobada' : `+${lesson.points} XP`}
                      </small>
                    </HStack>
                    <VStack gap={5} className="p-5">
                      {approved && isDone ? (
                        <HStack gap={3} align="center" className="academy-notice">
                          <Icon name="check" size={22} strokeWidth={2.5} className="shrink-0 text-academy-primary" />
                          <p className="min-w-0 flex-1 text-sm" role="status">
                            <strong className="block">Misión aprobada</strong>
                            <small className="text-sm text-academy-muted">Llevas {xp} XP · nivel {levelFor(xp)}. {next ? 'La siguiente clase ya está abierta.' : 'Completaste la última clase.'}</small>
                          </p>
                        </HStack>
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
                                <label key={choice} className="academy-panel flex cursor-pointer items-start gap-3 px-4 py-3 text-sm transition-colors hover:border-academy-primary has-[:checked]:border-academy-primary has-[:checked]:bg-academy-tint">
                                  <input type="radio" name={`q${number}`} value={choice} required defaultChecked={picks[number] === String(choice)} className="mt-0.5" />
                                  {option}
                                </label>
                              ))}
                            </fieldset>
                          )) : (
                            <fieldset className="space-y-2">
                              <legend className="mb-2 text-sm text-black/65">Marca cada paso cuando lo hayas hecho en tu negocio.</legend>
                              {shown.items.map((item, number) => (
                                <label key={number} className="academy-panel flex cursor-pointer items-start gap-3 px-4 py-3 text-sm transition-colors hover:border-academy-primary has-[:checked]:border-academy-primary has-[:checked]:bg-academy-tint">
                                  <input type="checkbox" name={`item${number}`} value="1" defaultChecked={picks[number] === '1'} className="mt-0.5" />
                                  {item}
                                </label>
                              ))}
                            </fieldset>
                          )}
                          <AcademySubmit label={shown.kind === 'quiz' ? 'Comprobar respuestas' : 'Confirmar pasos'} pending="Comprobando…" />
                        </form>
                      ) : null}
                    </VStack>
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
              <section className="academy-panel mt-8 p-5">
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
              </section>
            )}
          </VStack>

          {/* Barra fija abajo: la acción principal siempre a un clic. */}
          <footer className="sticky bottom-0 z-20 border-t border-academy-line bg-academy-surface">
            <HStack align="center" gap={2} wrap="wrap" className="mx-auto max-w-4xl px-4 py-3 sm:px-8">
              {previous ? (
                <Link href={href(previous)} className={secondaryClass} aria-label={`Clase anterior: ${previous.title}`}>
                  <Icon name="arrow-right" size={16} className="rotate-180" />
                  <small className="hidden text-sm sm:inline">Anterior</small>
                </Link>
              ) : null}
              <p className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-black/55 sm:flex">
                {status === 'Clase completada' ? <Icon name="check" size={16} strokeWidth={2.25} className="shrink-0 text-ink" /> : null}
                <small className="truncate text-sm">{status}</small>
              </p>
              <HStack className="ml-auto">{primary}</HStack>
            </HStack>
          </footer>
        </VStack>

        <aside className="academy-classroom-sidebar hidden min-w-0 overflow-hidden rounded-academy-lg border border-academy-line bg-academy-surface lg:sticky lg:top-24 lg:col-span-4 lg:block lg:overflow-y-auto">
          {syllabus}
        </aside>
      </section>
    </VStack>
  );
}
