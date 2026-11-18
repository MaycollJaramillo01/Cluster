import Link from 'next/link';
import { notFound } from 'next/navigation';
import { academiaPersonId } from '@/lib/valux/session';
import { completeLesson, submitMission } from '@/lib/valux/actions';
import { canReadCourse, lessonAccess, personXp, publishedLesson } from '@/lib/valux/data';
import { levelFor, parseMission, publicMission } from '@/lib/valux/mission';
import { trackEvent } from '@/lib/valux/events';

function embed(url: string) {
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
  if (url.includes('watch?v=')) return `https://www.youtube.com/embed/${url.split('watch?v=')[1]?.split('&')[0]}`;
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}`;
  return '';
}

function missionNote(code: string | undefined, xp: number) {
  if (!code) return '';
  if (code === 'ok') return `Misión aprobada. Llevas ${xp} XP (nivel ${levelFor(xp)}).`;
  if (code === 'pendiente') return 'Aprueba la misión para completar esta clase.';
  const [correct, total] = code.split('-');
  return `Tienes ${correct} de ${total}. Repasa la clase y vuelve a intentarlo.`;
}

export default async function LessonPlayer({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lesson: string }>;
  searchParams: Promise<{ mision?: string }>;
}) {
  const { slug, lesson: lessonSlug } = await params;
  const { mision } = await searchParams;
  const detail = await publishedLesson(slug, lessonSlug);
  if (!detail) notFound();
  const personId = await academiaPersonId();
  const canRead = await canReadCourse(personId, detail.course);
  const access = await lessonAccess(personId, detail.course);
  const done = access.done;
  const locked = canRead && !access.unlocked.has(detail.lesson.id);
  const open = canRead && !locked;
  if (open && personId) {
    await trackEvent('lesson_started', { id: `lesson_started:${personId}:${detail.lesson.id}`, personId, data: { lesson: detail.lesson.id, course: detail.course.id } });
  }
  const mission = parseMission(detail.lesson.mission).mission;
  const shown = mission ? publicMission(mission) : null;
  const xp = mision === 'ok' ? await personXp(personId) : 0;
  const lessons = access.order;
  const index = lessons.findIndex((item) => item.slug === lessonSlug);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const video = embed(detail.lesson.video_url);
  const sections = [
    ...detail.course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      lessons: lessons.filter((item) => item.section_id === section.id),
    })),
    ...(() => {
      const loose = lessons.filter((item) => !item.section_id);
      return loose.length ? [{ id: 'sueltas', title: 'Clases', lessons: loose }] : [];
    })(),
  ];

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 bg-ink px-4 py-3 text-sm text-white">
          <Link href={`/academia/${slug}`} className="truncate hover:text-brand">{detail.course.title}</Link>
          <span className="shrink-0 text-white/50">{index + 1} / {lessons.length}</span>
        </header>
        <div className="bg-black">
          {open && video ? (
            <iframe className="aspect-video w-full" src={video} title={detail.lesson.title} allowFullScreen />
          ) : (
            <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-white/70">
              {open ? 'Esta clase no tiene video. El contenido está debajo.' : locked ? 'Completa la clase anterior para abrir esta.' : 'Esta clase es de un curso de pago.'}
            </div>
          )}
        </div>
        <div className="bg-paper px-4 py-6 text-ink md:px-8">
          <h1 className="text-2xl font-medium">{detail.lesson.title}</h1>
          {open ? (
            <div className="mt-6 max-w-3xl space-y-6">
              {!video && detail.lesson.video_url ? <a className="text-sm underline" href={detail.lesson.video_url}>Abrir video</a> : null}
              {detail.lesson.content ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/75">{detail.lesson.content}</p> : null}
              {detail.lesson.resources.length > 0 ? (
                <section>
                  <h2 className="text-sm font-medium">Recursos</h2>
                  <ul className="mt-2 border border-black/10 bg-white">
                    {detail.lesson.resources.map((resource) => (
                      <li key={resource.id} className="border-b border-black/5 px-4 py-3 text-sm last:border-0">
                        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{resource.kind}</span>
                        {resource.url ? <a className="underline" href={resource.url}>{resource.title}</a> : resource.title}
                        {resource.content ? <p className="mt-1 whitespace-pre-wrap text-black/60">{resource.content}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : locked ? (
            <p className="mt-6 max-w-xl text-sm text-black/70">
              Esta clase se abre cuando completes la anterior{previous ? <>: <Link className="underline" href={`/academia/${slug}/${previous.slug}`}>{previous.title}</Link></> : null}.
            </p>
          ) : (
            <p className="mt-6 max-w-xl text-sm text-black/70">
              Inscríbete para ver el video, las notas y los archivos. <Link className="underline" href={`/academia/${slug}`}>Volver al curso</Link>
            </p>
          )}
          {mision ? <p className="mt-6 max-w-3xl border border-brand/40 bg-white px-4 py-3 text-sm">{missionNote(mision, xp)}</p> : null}
          {open && shown && personId ? (
            <form action={submitMission} className="mt-6 max-w-3xl space-y-4 border border-black/10 bg-white p-4">
              <input type="hidden" name="lesson_id" value={detail.lesson.id} />
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-medium">Misión</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                  {done.has(detail.lesson.id) ? 'Aprobada' : `+${detail.lesson.points} XP`}
                </span>
              </div>
              {shown.kind === 'quiz' ? shown.questions.map((question, index) => (
                <fieldset key={index} className="space-y-2 text-sm">
                  <legend className="mb-1 font-medium">{index + 1}. {question.prompt}</legend>
                  {question.options.map((option, choice) => (
                    <label key={choice} className="flex items-start gap-2">
                      <input type="radio" name={`q${index}`} value={choice} required className="mt-1" /> <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              )) : shown.items.map((item, index) => (
                <label key={index} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name={`item${index}`} value="1" className="mt-1" /> <span>{item}</span>
                </label>
              ))}
              <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Enviar misión</button>
            </form>
          ) : null}
          {open && shown && !personId ? <p className="mt-6 text-sm text-black/70"><Link className="underline" href="/academia/entrar">Entra</Link> para hacer la misión y avanzar.</p> : null}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
            {previous ? <Link className="border border-black/15 bg-white px-4 py-2" href={`/academia/${slug}/${previous.slug}`}>Anterior</Link> : <span />}
            {open && personId && (!shown || done.has(detail.lesson.id)) ? (
              <form action={completeLesson}>
                <input type="hidden" name="lesson_id" value={detail.lesson.id} />
                <input type="hidden" name="next" value={next ? `/academia/${slug}/${next.slug}` : `/academia/${slug}`} />
                <button className="bg-brand px-4 py-2 font-medium text-ink" type="submit">
                  {done.has(detail.lesson.id) ? 'Completada · continuar' : 'Completar y continuar'}
                </button>
              </form>
            ) : null}
            {next ? <Link className="bg-ink px-4 py-2 text-white" href={`/academia/${slug}/${next.slug}`}>Siguiente</Link> : <span />}
          </div>
        </div>
      </div>
      <aside className="border-t border-white/10 bg-ink text-white lg:border-l lg:border-t-0">
        <p className="border-b border-white/10 px-4 py-3 text-sm font-medium">Contenido del curso</p>
        <div className="max-h-[50vh] overflow-y-auto lg:max-h-none">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/45">{section.title}</p>
              <ol>
                {section.lessons.map((item) => {
                  const current = item.slug === lessonSlug;
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/academia/${slug}/${item.slug}`}
                        className={`flex items-start justify-between gap-3 px-4 py-3 text-sm ${current ? 'bg-white/10 text-brand' : 'text-white/80 hover:bg-white/5'}`}
                      >
                        <span>{done.has(item.id) ? '✓ ' : canRead && !access.unlocked.has(item.id) ? '🔒 ' : ''}{item.title}</span>
                        {item.duration_min ? <span className="shrink-0 text-xs text-white/40">{item.duration_min} min</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
