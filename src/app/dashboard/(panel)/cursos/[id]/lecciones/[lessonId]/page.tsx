import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { LessonText } from '@/components/academia/ui';
import { LessonActivityEditor } from '@/components/dashboard/LessonActivityEditor';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { getCourse, getLesson } from '@/lib/crm/lms';
import { createResource, deleteLesson, deleteResource, updateLesson } from '@/lib/crm/lms-actions';
import { parseMission } from '@/lib/valux/mission';
import { isPrivateAcademiaAsset, TEXT_TEMPLATE_KIND } from '@/lib/valux/upload';
import { directLessonVideo, lessonEmbed } from '@/lib/valux/video';

const field = 'min-h-11 w-full border border-black/25 bg-white px-3 py-2 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';
const label = 'block space-y-2 text-sm font-medium';
const panel = 'min-w-0 space-y-4 border border-black/15 bg-white p-4 sm:p-6';
const subhead = 'font-brand text-xl font-semibold normal-case';
const secondary = 'inline-flex min-h-11 items-center gap-2 border border-black/20 bg-white px-4 text-sm font-semibold hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink';
const editErrors: Record<string, string> = {
  estado: 'El curso está en revisión o publicado. Los cambios requieren que vuelva a borrador.',
  video: 'Revisa el enlace del video. Usa YouTube, Vimeo, Bunny Stream o una URL MP4/WebM.',
  mision: 'Revisa que la actividad tenga instrucciones o respuestas válidas.',
  seccion: 'El módulo elegido ya no está disponible. Elige otro módulo.',
  conservar: 'La clase está vinculada al avance del curso publicado y se conserva en el borrador de cambios.',
};
const materialKinds = [
  { id: 'enlace', name: 'Enlace o archivo' },
  { id: 'pdf', name: 'Documento PDF' },
  { id: 'imagen', name: 'Imagen' },
  { id: 'video', name: 'Video complementario' },
  { id: 'texto', name: 'Nota o texto' },
  { id: TEXT_TEMPLATE_KIND, name: 'Plantilla de texto descargable' },
];
const sections: { id: string; title: string; icon: IconName }[] = [
  { id: 'contenido', title: 'Contenido', icon: 'pen' },
  { id: 'video', title: 'Video', icon: 'video' },
  { id: 'actividad', title: 'Actividad', icon: 'target' },
  { id: 'materiales', title: 'Materiales', icon: 'link' },
];

export default async function LessonPage({ params, searchParams }: {
  params: Promise<{ id: string; lessonId: string }>;
  searchParams: Promise<{ guardado?: string; error?: string }>;
}) {
  const { id, lessonId } = await params;
  const { teacher } = await requireCourseEditor(id);
  const [lesson, detail, status] = await Promise.all([getLesson(id, lessonId), getCourse(id), searchParams]);
  if (!lesson || !detail) notFound();
  const { course } = detail;
  const readOnly = teacher && Boolean(course.published || course.review_requested_at);
  const module = detail.sections.find((item) => item.id === lesson.section_id);
  const activity = parseMission(lesson.mission);
  const video = lessonEmbed(lesson.video_url || '');
  const directVideo = video ? '' : directLessonVideo(lesson.video_url || '');
  const activityLabels = {
    quiz: 'Cuestionario autocorregible',
    checklist: 'Lista de pasos',
    assignment: 'Tarea con entrega escrita',
  };
  const activityLabel = activity.mission ? activityLabels[activity.mission.kind] : 'Sin actividad';
  const preview = `/dashboard/cursos/${id}/vista-previa?leccion=${encodeURIComponent(lesson.id)}`;
  const error = status.error && editErrors[status.error];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 [color-scheme:light]">
      <header className="border-b border-black/15 pb-5">
        <Link href={`/dashboard/cursos/${id}?vista=temario#temario`} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">← Volver al temario</Link>
        <HStack gap={4} justify="between" wrap="wrap" className="items-end">
          <VStack gap={2} className="min-w-0">
            <p className="break-words text-sm font-medium text-black/65">{course.title}{module ? ` · ${module.title}` : ''}</p>
            <h1 className="break-words font-brand text-3xl font-semibold normal-case leading-tight sm:text-4xl">{lesson.title}</h1>
          </VStack>
          <Link href={preview} className={secondary}><Icon name="play" size={17} aria-hidden="true" />Vista de alumno</Link>
        </HStack>
      </header>

      {status.guardado === '1' ? <p role="status" className="border-l-4 border-brand bg-white p-3 text-sm">Cambios guardados.</p> : null}
      {error ? <p role="alert" className="border-l-4 border-red-700 bg-white p-3 text-sm text-red-800">{error}</p> : null}
      {readOnly ? <p className="border border-black/15 bg-paper p-4 text-sm">{course.published ? 'Esta clase está publicada.' : 'Esta clase forma parte de un curso en revisión.'} Puedes consultarla y abrir la vista de alumno.</p> : null}

      <section className="grid min-w-0 items-start gap-5 lg:grid-cols-3">
        <aside className="space-y-4 border border-black/15 bg-white p-4 lg:sticky lg:top-6">
          <nav aria-label="Editor de clase">
            <ul className="grid grid-cols-2 gap-1 lg:grid-cols-1">
              {sections.map(({ id: anchor, title, icon }) => (
                <li key={anchor}>
                  <a href={`#${anchor}`} className="flex min-h-11 items-center gap-2 px-2 text-sm font-medium hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink">
                    <Icon name={icon} size={17} aria-hidden="true" />{title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <dl className="space-y-2 border-t border-black/10 pt-4 text-sm">
            <HStack as="div" gap={2} justify="between">
              <dt className="text-black/65">Duración</dt><dd>{lesson.duration_min ? `${lesson.duration_min} min` : 'Sin indicar'}</dd>
            </HStack>
            <HStack as="div" gap={2} justify="between">
              <dt className="text-black/65">Materiales</dt><dd>{lesson.resources.length}</dd>
            </HStack>
          </dl>
        </aside>

        <VStack gap={5} className="min-w-0 lg:col-span-2">
          <form action={updateLesson} className="min-w-0 space-y-5">
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="course_id" value={id} />
            <input type="hidden" name="editor" value="1" />

            <section id="contenido" aria-labelledby="lesson-content" className={`${panel} scroll-mt-6`}>
              <h2 id="lesson-content" className={subhead}>Contenido</h2>
              {readOnly ? (
                lesson.content.trim() ? <LessonText text={lesson.content} /> : <p className="text-sm text-black/70">Esta clase no tiene texto guardado.</p>
              ) : (
                <VStack gap={4}>
                  <label className={label}>Título de la clase<input className={field} name="title" defaultValue={lesson.title} required /></label>
                  <section className="grid gap-3 sm:grid-cols-2">
                    <label className={label}>Módulo
                      <select className={field} name="section_id" defaultValue={lesson.section_id || ''}>
                        <option value="">Sin módulo</option>
                        {detail.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                      </select>
                    </label>
                    <label className={label}>Duración (minutos)<input className={field} name="duration_min" type="number" min="1" defaultValue={lesson.duration_min ?? ''} /></label>
                  </section>
                  <label className={label}>Texto de la clase
                    <textarea className={field} name="content" rows={8} defaultValue={lesson.content} placeholder="Explica el tema e incluye los pasos o ejemplos que verá el alumno." />
                  </label>
                </VStack>
              )}
            </section>

            <section id="video" aria-labelledby="lesson-video" className={`${panel} scroll-mt-6`}>
              <h2 id="lesson-video" className={subhead}>Video</h2>
              {status.error === 'muestra' ? <p role="alert" className="text-sm text-red-800">Para una muestra con video, usa un enlace público de YouTube, Vimeo o MP4/WebM.</p> : null}
              {!readOnly ? (
                <label className={label}>Enlace del video
                  <input className={field} name="video_url" defaultValue={lesson.video_url || ''} placeholder="https://…" inputMode="url" spellCheck={false} aria-invalid={status.error === 'video' || undefined} />
                  <small className="block font-normal text-black/70">Pega una URL de YouTube, Vimeo, Bunny Stream o un archivo MP4/WebM. También puedes usar <code>bunny:&lt;id&gt;</code>.</small>
                </label>
              ) : null}
              {!readOnly ? (
                <>
                  <input type="hidden" name="preview_settings" value="1" />
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="preview_public" value="1" defaultChecked={lesson.preview_public} className="mt-1" />
                    <strong>Ofrecer como clase de muestra</strong>
                  </label>
                  <p className="text-sm text-black/70">En cursos de pago, cualquier visitante podrá ver el texto y el video de esta clase.</p>
                </>
              ) : lesson.preview_public ? <p className="text-sm font-semibold">Clase de muestra</p> : null}
              {video ? (
                <iframe title={`Video guardado de ${lesson.title}`} src={video} className="aspect-video w-full border border-black/10 bg-ink" loading="lazy" allow="accelerometer; gyroscope; encrypted-media; picture-in-picture" allowFullScreen />
              ) : directVideo ? (
                <video aria-label={`Video guardado de ${lesson.title}`} src={directVideo} controls playsInline preload="none" className="aspect-video w-full border border-black/10 bg-ink" />
              ) : lesson.video_url ? (
                <p className="text-sm text-black/70">El video guardado no se puede previsualizar aquí. Comprueba el enlace desde la vista de alumno.</p>
              ) : (
                <p className="text-sm text-black/70">Sin video guardado.</p>
              )}
            </section>

            <section id="actividad" aria-labelledby="lesson-activity" className={`${panel} scroll-mt-6`}>
              <HStack gap={3} justify="between" wrap="wrap">
                <h2 id="lesson-activity" className={subhead}>Actividad</h2>
                {activity.mission?.kind === 'assignment' ? (
                  <Link href={`/dashboard/cursos/${id}/entregas?leccion=${encodeURIComponent(lesson.id)}`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Ver entregas de esta clase</Link>
                ) : null}
              </HStack>
              {activity.errors.length ? (
                <ul className="list-disc border-l-4 border-red-700 bg-paper py-3 pl-7 pr-3 text-sm text-red-800">
                  {activity.errors.map((message) => <li key={message}>{message}</li>)}
                </ul>
              ) : null}
              {readOnly ? (
                <p className="text-sm text-black/70">{activityLabel}</p>
              ) : (
                <>
                  <LessonActivityEditor key={lesson.mission} value={lesson.mission} />
                  <label className={`${label} max-w-xs`}>XP al aprobar la actividad
                    <input className={field} name="points" type="number" min="1" defaultValue={lesson.points} />
                  </label>
                </>
              )}
            </section>
            {!readOnly ? <SubmitButton pending="Guardando…" className="sm:w-auto">Guardar cambios</SubmitButton> : null}
          </form>

          <section id="materiales" aria-labelledby="lesson-materials" className={`${panel} scroll-mt-6`}>
            <h2 id="lesson-materials" className={subhead}>Materiales</h2>
            {status.guardado === 'recurso' ? <p role="status" className="text-sm">Material agregado.</p> : null}
            {status.error === 'archivo' ? <p role="alert" className="text-sm text-red-800">No pudimos guardar el archivo o el enlace. Prueba con un archivo más pequeño o revisa la URL.</p> : null}
            {status.error === 'recurso' ? <p role="alert" className="text-sm text-red-800">Agrega un archivo, un enlace o una nota para guardar el material.</p> : null}

            {lesson.resources.length ? (
              <ul className="divide-y divide-black/10 border-y border-black/10">
                {lesson.resources.map((resource) => {
                  const kind = materialKinds.find((item) => item.id === resource.kind);
                  const privateFile = resource.kind === TEXT_TEMPLATE_KIND || isPrivateAcademiaAsset(resource.url || '');
                  return (
                    <li key={resource.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <VStack gap={1} className="min-w-0 flex-1">
                        <p className="break-words font-medium">{resource.title}</p>
                        <p className="text-xs text-black/65">{kind?.name || 'Material'}{privateFile ? ' · Descarga privada' : resource.url ? ' · Enlace' : ''}</p>
                      </VStack>
                      {!readOnly ? (
                        <form action={deleteResource}>
                          <input type="hidden" name="id" value={resource.id} />
                          <button className="min-h-11 text-sm underline underline-offset-4" type="submit" aria-label={`Quitar ${resource.title}`}>Quitar</button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-sm text-black/70">Sin materiales guardados.</p>}

            {!readOnly ? (
              <details open={status.error === 'archivo' || status.error === 'recurso' || status.error === 'plantilla' || undefined} className="border border-black/15 p-3 sm:p-4">
                <summary className="min-h-9 cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2">Agregar material</summary>
                <form action={createResource} className="mt-4 space-y-4">
                  {status.error === 'plantilla' ? <p role="alert" className="text-sm text-red-800">Escribe hasta 12.000 caracteres para la plantilla y deja vacíos el enlace y el archivo.</p> : null}
                  <input type="hidden" name="lesson_id" value={lesson.id} />
                  <section className="grid gap-3 sm:grid-cols-2">
                    <label className={label}>Título del material<input className={field} name="title" required /></label>
                    <label className={label}>Tipo de material
                      <select className={field} name="kind" defaultValue="enlace">
                        {materialKinds.map((kind) => <option key={kind.id} value={kind.id}>{kind.name}</option>)}
                      </select>
                    </label>
                  </section>
                  <label className={label}>Archivo<input className={`${field} file:mr-3 file:border-0 file:bg-paper file:px-2 file:py-1 file:text-sm`} name="file" type="file" /></label>
                  <label className={label}>Enlace<input className={field} name="url" inputMode="url" placeholder="https://…" /></label>
                  <label className={label}>Nota o texto<textarea className={field} name="content" rows={3} /></label>
                  <p className="text-sm text-black/70">Los archivos subidos quedan protegidos por el acceso a la clase. Los enlaces siguen las reglas de su proveedor.</p>
                  <SubmitButton pending="Guardando material…" className="sm:w-auto">Guardar material</SubmitButton>
                </form>
              </details>
            ) : null}
          </section>

          {!readOnly && !lesson.source_id ? (
            <details className="border border-black/15 bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-red-800">Eliminar clase</summary>
              <form action={deleteLesson} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={lesson.id} />
                <input type="hidden" name="course_id" value={id} />
                <p className="text-sm text-black/70">Eliminar la clase también elimina sus materiales asociados y el avance registrado.</p>
                <SubmitButton pending="Eliminando…" className="bg-red-800 text-white sm:w-auto">Confirmar eliminación</SubmitButton>
              </form>
            </details>
          ) : null}
        </VStack>
      </section>
    </main>
  );
}
