import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover, LessonText } from '@/components/academia/ui';
import { getCourse, getLesson } from '@/lib/crm/lms';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { parseMission, publicMission } from '@/lib/valux/mission';
import { directLessonVideo, lessonEmbed } from '@/lib/valux/video';

export default async function CoursePreview({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ leccion?: string }>;
}) {
  const { id } = await params;
  const { leccion } = await searchParams;
  await requireCourseEditor(id);
  const detail = await getCourse(id);
  if (!detail) notFound();
  const { course, lessons, sections } = detail;
  const base = `/dashboard/cursos/${id}`;
  const preview = `${base}/vista-previa`;
  const lesson = leccion ? await getLesson(id, leccion) : null;
  if (leccion && !lesson) notFound();
  const video = lesson?.video_url ? lessonEmbed(lesson.video_url) : '';
  const direct = lesson?.video_url && !video ? directLessonVideo(lesson.video_url) : '';
  const parsed = lesson ? parseMission(lesson.mission).mission : null;
  const activity = parsed ? publicMission(parsed) : null;
  const sectionIds = new Set(sections.map((section) => section.id));
  const loose = lessons.filter((item) => !item.section_id || !sectionIds.has(item.section_id));
  const curriculum = [
    ...sections.map((section) => ({ id: section.id, title: section.title, items: lessons.filter((item) => item.section_id === section.id) })),
    { id: 'sueltas', title: sections.length ? 'Clases sin módulo' : 'Clases', items: loose },
  ].filter((group) => group.items.length > 0);
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-1 pb-10 sm:px-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href={lesson ? `${base}/lecciones/${lesson.id}` : `${base}?vista=temario`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Volver al editor</Link>
        <p className="text-sm text-ink/70">Vista previa privada</p>
      </header>
      <section className="grid items-start gap-6 lg:grid-cols-3">
        <article className="min-w-0 overflow-hidden border border-black/10 bg-white lg:col-span-2">
          {lesson ? (
            <>
              {video ? <iframe className="aspect-video w-full bg-black" src={video} title={lesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : null}
              {direct ? <video className="aspect-video w-full bg-black" src={direct} controls preload="metadata" aria-label={lesson.title} /> : null}
              <section className="p-5 sm:p-8">
                <VStack gap={5}>
                  <Link href={preview} className="text-sm font-semibold underline underline-offset-4">{course.title}</Link>
                  <h1 className="break-words text-3xl font-semibold leading-tight sm:text-4xl">{lesson.title}</h1>
                  {lesson.content ? <LessonText text={lesson.content} /> : null}
                  {lesson.resources.length ? (
                    <section className="space-y-2">
                      <h2 className="text-lg font-semibold">Materiales</h2>
                      <ul className="divide-y divide-black/10 border border-black/10">
                        {lesson.resources.map((resource) => <li className="break-words px-4 py-3 text-sm" key={resource.id}>
                          {resource.url ? <a className="font-semibold underline underline-offset-4" href={`${preview}/material/${encodeURIComponent(resource.id)}`} target="_blank" rel="noopener noreferrer">{resource.title}</a> : <strong>{resource.title}</strong>}
                          {resource.content ? <p className="mt-1 whitespace-pre-wrap">{resource.content}</p> : null}
                        </li>)}
                      </ul>
                    </section>
                  ) : null}
                  {activity ? <section className="space-y-3 border border-black/10 bg-paper p-4">
                    <h2 className="text-lg font-semibold">{activity.kind === 'assignment' ? 'Tarea' : 'Misión'}</h2>
                    {activity.kind === 'assignment' ? <LessonText text={activity.instructions} /> : activity.kind === 'checklist' ? (
                      <ul className="list-disc space-y-1 pl-5 text-sm">{activity.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
                    ) : <ol className="list-decimal space-y-3 pl-5 text-sm">{activity.questions.map((question, index) => <li key={index}>
                      <p className="font-semibold">{question.prompt}</p>
                      <ul className="list-disc space-y-1 pl-5">{question.options.map((option, choice) => <li key={choice}>{option}</li>)}</ul>
                    </li>)}</ol>}
                  </section> : null}
                  {!lesson.content && !video && !direct && !activity && !lesson.resources.length ? <p className="text-sm text-ink/70">Esta clase todavía no tiene contenido.</p> : null}
                </VStack>
              </section>
            </>
          ) : (
            <>
              {course.cover_url ? <Cover url={course.cover_url} title={course.title} slug={course.slug} eager /> : null}
              <section className="p-5 sm:p-8">
                <VStack gap={5}>
                  <h1 className="break-words text-3xl font-semibold leading-tight sm:text-4xl">{course.title}</h1>
                  <p className="whitespace-pre-wrap break-words">{course.description}</p>
                  {([
                    ['Qué aprenderás', course.learning_outcomes], ['Para quién es', course.audience], ['Requisitos', course.prerequisites],
                  ] as const).map(([label, content]) => content ? <section key={label} className="space-y-2">
                    <h2 className="text-lg font-semibold">{label}</h2>
                    <p className="whitespace-pre-wrap break-words text-sm">{content}</p>
                  </section> : null)}
                </VStack>
              </section>
            </>
          )}
        </article>
        <nav aria-label="Temario de la vista previa" className="min-w-0 border border-black/10 bg-white px-4 py-5 lg:sticky lg:top-6">
          <h2 className="mb-3 text-lg font-semibold">Temario</h2>
          {curriculum.length ? curriculum.map((group) => <section key={group.id} className="border-t border-black/10 py-3">
            <h3 className="break-words text-sm font-semibold">{group.title}</h3>
            <ul className="mt-2">
              {group.items.map((item) => <li key={item.id}>
                <Link aria-current={lesson?.id === item.id ? 'page' : undefined} href={`${preview}?leccion=${encodeURIComponent(item.id)}`} className="flex min-h-11 items-center break-words px-2 text-sm hover:bg-paper aria-[current=page]:bg-paper aria-[current=page]:font-semibold">{item.title}</Link>
              </li>)}
            </ul>
          </section>) : <p className="text-sm text-ink/70">El temario aparecerá al añadir clases.</p>}
        </nav>
      </section>
    </main>
  );
}
