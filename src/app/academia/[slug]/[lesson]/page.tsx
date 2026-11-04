import Link from 'next/link';
import { notFound } from 'next/navigation';
import { academiaPersonId } from '@/lib/valux/session';
import { completeLesson } from '@/lib/valux/actions';
import { completedLessonIds, canReadCourse, publishedLesson } from '@/lib/valux/data';

function embed(url: string) {
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
  if (url.includes('watch?v=')) return `https://www.youtube.com/embed/${url.split('watch?v=')[1]?.split('&')[0]}`;
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}`;
  return '';
}

export default async function LessonPlayer({ params }: { params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson: lessonSlug } = await params;
  const detail = await publishedLesson(slug, lessonSlug);
  if (!detail) notFound();
  const personId = await academiaPersonId();
  const open = await canReadCourse(personId, detail.course);
  const done = new Set(personId ? await completedLessonIds(personId, detail.course.id) : []);
  const lessons = detail.course.lessons;
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
              {open ? 'Esta clase no tiene video. El contenido está debajo.' : 'Esta clase es de un curso de pago.'}
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
          ) : (
            <p className="mt-6 max-w-xl text-sm text-black/70">
              Inscríbete para ver el video, las notas y los archivos. <Link className="underline" href={`/academia/${slug}`}>Volver al curso</Link>
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
            {previous ? <Link className="border border-black/15 bg-white px-4 py-2" href={`/academia/${slug}/${previous.slug}`}>Anterior</Link> : <span />}
            {open && personId ? (
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
                        <span>{done.has(item.id) ? '✓ ' : ''}{item.title}</span>
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
