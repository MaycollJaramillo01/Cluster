import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { academiaPersonId } from '@/lib/valux/session';
import { completeLesson, submitMission } from '@/lib/valux/actions';
import { canReadCourse, lessonAccess, personXp, publishedLesson } from '@/lib/valux/data';
import { levelFor, parseMission, publicMission } from '@/lib/valux/mission';
import { trackEvent } from '@/lib/valux/events';
import { lessonEmbed } from '@/lib/valux/video';
import { LessonText } from '@/components/academia/ui';
import { ScrollTop } from '@/components/academia/ScrollTop';
import { Icon } from '@/components/ui/Icon';

type Item = { id: string; slug: string; title: string; section_id: string; duration_min: number | null };

const primaryClass = 'inline-flex items-center justify-center gap-2 bg-brand px-5 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90';
const secondaryClass = 'inline-flex items-center justify-center gap-2 border border-black/15 bg-white px-4 py-3 text-sm transition-colors hover:border-ink';

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
  return <span className={`mt-0.5 h-[18px] w-[18px] shrink-0 border-2 ${current ? 'border-brand' : 'border-white/25'}`} />;
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
    <nav aria-label="Contenido del curso">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-sm font-medium text-white">Contenido del curso</p>
        <p className="mt-0.5 text-xs text-white/50">{summary}</p>
      </div>
      {groups.map((group) => (
        <section key={group.id} className="pb-2">
          <div className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-5 text-xs">
            <span className="font-medium text-white/80">{group.title}</span>
            <span className="shrink-0 tabular-nums text-white/45">
              {group.lessons.filter((item) => done.has(item.id)).length}/{group.lessons.length}
            </span>
          </div>
          <ol>
            {group.lessons.map((item) => {
              const isCurrent = item.slug === current;
              const locked = !isCurrent && isLocked(item);
              const body = (
                <>
                  <Status done={done.has(item.id)} current={isCurrent} locked={locked} />
                  <span className="min-w-0 flex-1">{item.title}</span>
                  {item.duration_min ? <span className="shrink-0 text-xs tabular-nums text-white/40">{item.duration_min} min</span> : null}
                </>
              );
              const row = 'flex items-start gap-3 px-4 py-3 text-sm transition-colors duration-150';
              return (
                <li key={item.id}>
                  {locked ? (
                    <div className={`${row} cursor-not-allowed text-white/40`} title="Se abre al completar la clase anterior">{body}</div>
                  ) : (
                    <Link
                      href={href(item)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`${row} ${isCurrent ? 'bg-white/10 font-medium text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'}`}
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
  searchParams: Promise<{ mision?: string; r?: string }>;
}) {
  const { slug, lesson: lessonSlug } = await params;
  const { mision, r } = await searchParams;
  // Respuestas del intento anterior, para volver a marcarlas.
  const picks = (r || '').split('.');
  const detail = await publishedLesson(slug, lessonSlug);
  if (!detail) notFound();
  const { course, lesson } = detail;
  const personId = await academiaPersonId();
  const canRead = await canReadCourse(personId, course);
  const access = await lessonAccess(personId, course);
  const { done, order } = access;
  const locked = canRead && !access.unlocked.has(lesson.id);
  const open = canRead && !locked;
  if (open && personId) {
    await trackEvent('lesson_started', { id: `lesson_started:${personId}:${lesson.id}`, personId, data: { lesson: lesson.id, course: course.id } });
  }
  const mission = parseMission(lesson.mission).mission;
  const shown = mission ? publicMission(mission) : null;
  const approved = mision === 'ok';
  const xp = approved ? await personXp(personId) : 0;
  const index = order.findIndex((item) => item.slug === lessonSlug);
  const previous = order[index - 1];
  const next = order[index + 1];
  const isDone = done.has(lesson.id);
  const doneCount = order.filter((item) => done.has(item.id)).length;
  const pct = order.length ? Math.round((doneCount / order.length) * 100) : 0;
  // La primera clase abierta sin terminar: a donde mandar a quien llega a una clase cerrada.
  const pending = order.find((item) => access.unlocked.has(item.id) && !done.has(item.id));
  const href = (item: { slug: string }) => `/academia/${slug}/${item.slug}`;
  const nextHref = next ? href(next) : `/academia/${slug}?terminado=1`;
  const nextLabel = next ? 'Siguiente clase' : 'Terminar el curso';
  // El enlace firmado solo se genera para quien puede ver la clase.
  const video = open ? lessonEmbed(lesson.video_url) : '';
  const known = new Set(course.sections.map((section) => section.id));
  const loose = order.filter((item) => !known.has(item.section_id));
  const groups = [
    ...course.sections.map((section) => ({ id: section.id, title: section.title, lessons: order.filter((item) => item.section_id === section.id) })),
    ...(loose.length ? [{ id: 'sueltas', title: course.sections.length ? 'Otras clases' : 'Clases', lessons: loose }] : []),
  ].filter((group) => group.lessons.length);
  const sectionTitle = groups.find((group) => group.lessons.some((item) => item.id === lesson.id))?.title;
  const summary = personId ? `${doneCount} de ${order.length} completadas` : `${order.length} ${order.length === 1 ? 'clase' : 'clases'}`;
  const syllabus = (
    <Syllabus groups={groups} current={lessonSlug} done={done} isLocked={(item) => canRead && !access.unlocked.has(item.id)} href={href} summary={summary} />
  );

  // Una sola acción principal: "Siguiente clase" completa esta clase y abre la otra.
  // Con misión pendiente, la acción lleva a la misión; nunca a una clase cerrada.
  const arrow = <Icon name="arrow-right" size={16} />;
  let primary: ReactNode = null;
  let status = '';
  if (!canRead) {
    primary = <Link href={`/academia/${slug}`} className={primaryClass}>Ver el curso</Link>;
  } else if (!personId) {
    primary = <Link href="/academia/entrar" className={primaryClass}>Entra para guardar tu avance</Link>;
  } else if (locked) {
    primary = pending ? <Link href={href(pending)} className={primaryClass}>Ir a la clase pendiente {arrow}</Link> : null;
  } else if (shown && !isDone) {
    primary = <a href="#mision" className={primaryClass}>Responder la misión</a>;
    status = 'Aprueba la misión para abrir la siguiente clase.';
  } else if (isDone) {
    primary = <Link href={nextHref} className={primaryClass}>{nextLabel} {arrow}</Link>;
    status = 'Clase completada';
  } else {
    primary = (
      <form action={completeLesson}>
        <input type="hidden" name="lesson_id" value={lesson.id} />
        <button type="submit" className={primaryClass}>{nextLabel} {arrow}</button>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <ScrollTop key={`${lessonSlug}?${mision || ''}${r || ''}`} />
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-ink px-4 text-white">
        <Link href={`/academia/${slug}`} className="flex min-w-0 items-center gap-2 text-sm transition-colors hover:text-brand">
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
          <details key={lessonSlug} className="group lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-1 border border-white/20 px-3 py-1.5 text-sm [&::-webkit-details-marker]:hidden">
              Temario
              <Icon name="chevron-down" size={16} className="transition-transform duration-150 group-open:rotate-180" />
            </summary>
            <div className="t-sheet fixed inset-x-0 bottom-0 top-14 overflow-y-auto border-t border-white/10 bg-ink">{syllabus}</div>
          </details>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-col">
          {video ? (
            <div className="bg-black">
              <iframe className="aspect-video w-full" src={video} title={lesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 md:px-8">
            <p className="text-sm text-black/55">
              {sectionTitle ? `${sectionTitle} · ` : ''}Clase {index + 1} de {order.length}
              {lesson.duration_min ? ` · ${lesson.duration_min} min` : ''}
            </p>
            <h1 className="mt-3 text-4xl tracking-wide md:text-5xl">{lesson.title}</h1>

            {open ? (
              <div className="mt-8 space-y-10">
                {!video && lesson.video_url && !lesson.video_url.startsWith('bunny:') && !lesson.video_url.includes('mediadelivery.net') ? (
                  <a className={secondaryClass} href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                    <Icon name="play" size={16} /> Abrir video
                  </a>
                ) : null}
                {lesson.content ? <LessonText text={lesson.content} /> : null}

                {lesson.resources.length > 0 ? (
                  <section>
                    <h2 className="text-lg font-semibold">Recursos</h2>
                    <ul className="mt-3 divide-y divide-black/10 border border-black/10 bg-white">
                      {lesson.resources.map((resource) => (
                        <li key={resource.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                          <Icon name={resource.url ? 'link' : 'pen'} size={16} className="mt-0.5 shrink-0 text-black/45" />
                          <div className="min-w-0">
                            {resource.url ? (
                              <a className="font-medium underline-offset-2 hover:underline" href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                            ) : (
                              <span className="font-medium">{resource.title}</span>
                            )}
                            {resource.kind ? <span className="ml-2 text-xs text-black/45">{resource.kind.charAt(0).toUpperCase() + resource.kind.slice(1)}</span> : null}
                            {resource.content ? <p className="mt-1 whitespace-pre-wrap text-black/65">{resource.content}</p> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {shown ? (
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
              </div>
            ) : (
              <div className="mt-8 border border-black/10 bg-white p-5">
                <p className="flex items-center gap-2 font-medium">
                  <Icon name="lock" size={16} />
                  {!canRead ? 'Esta clase es parte de un curso de pago' : personId ? 'Esta clase todavía está cerrada' : 'Entra para seguir el curso'}
                </p>
                <p className="mt-2 text-sm text-black/65">
                  {!canRead
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

        <aside className="hidden border-l border-white/10 bg-ink lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {syllabus}
        </aside>
      </div>
    </div>
  );
}
