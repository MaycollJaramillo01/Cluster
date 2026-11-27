import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { LessonText } from '@/components/academia/ui';
import { LessonActivityEditor } from '@/components/dashboard/LessonActivityEditor';
import { Notice, Pill, btnGhost, btnSmall, fieldClass, labelClass } from '@/components/dashboard/StaffUi';
import { Icon } from '@/components/ui/Icon';
import { requireCourseEditor } from '@/lib/crm/course-access';
import { getCourse, getLesson } from '@/lib/crm/lms';
import { createResource, deleteLesson, deleteResource, updateLesson } from '@/lib/crm/lms-actions';
import { MISSION_LABELS, parseMission } from '@/lib/valux/mission';
import { isPrivateAcademiaAsset, TEXT_TEMPLATE_KIND } from '@/lib/valux/upload';
import { directLessonVideo, lessonEmbed } from '@/lib/valux/video';

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

type Tone = 'ok' | 'off' | 'bad';

function Part({ id, n, title, status, tone, action, children }: { id: string; n: number; title: string; status: string; tone: Tone; action?: ReactNode; children: ReactNode }) {
  return (
    <VStack as="section" id={id} gap={5} aria-labelledby={`${id}-titulo`} className="academy-panel min-w-0 scroll-mt-24 p-4 sm:p-6">
      <HStack gap={3} align="center" justify="between" wrap="wrap" className="border-b border-academy-line pb-4">
        <HStack gap={3} align="center" className="min-w-0">
          <small aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-academy bg-academy-ink text-sm font-bold text-academy-surface">{n}</small>
          <Heading id={`${id}-titulo`} level={2} className="text-xl font-bold">{title}</Heading>
        </HStack>
        <HStack gap={3} align="center" wrap="wrap">{action}<Pill tone={tone}>{status}</Pill></HStack>
      </HStack>
      {children}
    </VStack>
  );
}

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
  const activityLabel = activity.mission ? MISSION_LABELS[activity.mission.kind] : 'Sin actividad';
  const preview = `/dashboard/cursos/${id}/vista-previa?leccion=${encodeURIComponent(lesson.id)}`;
  const error = status.error && editErrors[status.error];
  const count = lesson.resources.length;
  const parts: { id: string; title: string; status: string; tone: Tone }[] = [
    { id: 'contenido', title: 'Contenido', status: lesson.content.trim() ? 'Con texto' : 'Sin texto', tone: lesson.content.trim() ? 'ok' : 'off' },
    { id: 'video', title: 'Video', status: lesson.video_url ? 'Con video' : 'Sin video', tone: lesson.video_url ? 'ok' : 'off' },
    { id: 'actividad', title: 'Actividad', status: activity.errors.length ? 'Por corregir' : activityLabel, tone: activity.errors.length ? 'bad' : activity.mission ? 'ok' : 'off' },
    { id: 'materiales', title: 'Materiales', status: count ? `${count} ${count === 1 ? 'material' : 'materiales'}` : 'Sin materiales', tone: count ? 'ok' : 'off' },
  ];
  const part = (anchor: string) => parts.find((item) => item.id === anchor)!;

  return (
    <VStack gap={6} className="mx-auto w-full max-w-4xl">
      <VStack as="header" gap={4}>
        <Link href={`/dashboard/cursos/${id}?vista=temario#temario`} className="academy-nav academy-focus -ml-3 w-fit"><Icon name="arrow-right" size={16} className="rotate-180" />Volver al temario</Link>
        <HStack gap={4} justify="between" align="end" wrap="wrap">
          <VStack gap={2} className="min-w-0">
            <p className="break-words text-sm font-semibold text-academy-muted">{course.title}{module ? ` · ${module.title}` : ''}</p>
            <Heading level={1} className="academy-title">{lesson.title}</Heading>
          </VStack>
          <Link href={preview} className={btnGhost}><Icon name="play" size={16} aria-hidden="true" />Vista de alumno</Link>
        </HStack>
      </VStack>

      {status.guardado === '1' ? <Notice tone="ok">Cambios guardados.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {readOnly ? <Notice>{course.published ? 'Esta clase está publicada.' : 'Esta clase forma parte de un curso en revisión.'} Puedes consultarla y abrir la vista de alumno.</Notice> : null}

      <form action={updateLesson} className="min-w-0 space-y-6">
        <input type="hidden" name="id" value={lesson.id} />
        <input type="hidden" name="course_id" value={id} />

        <Part n={1} {...part('contenido')}>
          {readOnly ? (
            lesson.content.trim() ? <LessonText text={lesson.content} /> : <p className="text-sm text-academy-muted">Esta clase no tiene texto guardado.</p>
          ) : (
            <VStack gap={5}>
              <label className={labelClass}>Título de la clase<input className={fieldClass} name="title" defaultValue={lesson.title} required /></label>
              <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
                <legend className="sr-only">Módulo y duración</legend>
                <label className={labelClass}>Módulo
                  <select className={fieldClass} name="section_id" defaultValue={lesson.section_id || ''}>
                    {lesson.section_id ? null : <option value="">Sin módulo</option>}
                    {detail.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                  </select>
                </label>
                <label className={labelClass}>Duración (minutos)<input className={fieldClass} name="duration_min" type="number" min="1" defaultValue={lesson.duration_min ?? ''} /></label>
              </fieldset>
              <VStack gap={1}>
                <label className={labelClass}>Texto de la clase
                  <textarea className={fieldClass} name="content" rows={10} defaultValue={lesson.content} placeholder="Explica el tema e incluye los pasos o ejemplos que verá el alumno." />
                </label>
                <small className="text-xs text-academy-muted">Usa «## » al inicio de una línea para un subtítulo y «- » para una lista.</small>
              </VStack>
            </VStack>
          )}
        </Part>

        <Part n={2} {...part('video')}>
          {status.error === 'muestra' ? <Notice tone="error">Para una muestra con video, usa un enlace público de YouTube, Vimeo o MP4/WebM.</Notice> : null}
          {!readOnly ? (
            <VStack gap={1}>
              <label className={labelClass}>Enlace del video
                <input className={fieldClass} name="video_url" defaultValue={lesson.video_url || ''} placeholder="https://…" inputMode="url" spellCheck={false} aria-invalid={status.error === 'video' || undefined} />
              </label>
              <small className="text-xs text-academy-muted">Pega una URL de YouTube, Vimeo, Bunny Stream o un archivo MP4/WebM. También puedes usar <code>bunny:&lt;id&gt;</code>.</small>
            </VStack>
          ) : null}
          {!readOnly ? (
            <VStack gap={1} className="rounded-academy border border-academy-line bg-academy-page p-4">
              <label className="flex items-start gap-3 text-sm font-semibold">
                <input type="checkbox" name="preview_public" value="1" defaultChecked={lesson.preview_public} className="mt-0.5 size-4" />
                Ofrecer como clase de muestra
              </label>
              <p className="pl-7 text-sm text-academy-muted">En cursos de pago, cualquier visitante podrá ver el texto y el video de esta clase.</p>
            </VStack>
          ) : lesson.preview_public ? <p className="text-sm font-semibold">Clase de muestra</p> : null}
          {video ? (
            <iframe title={`Video guardado de ${lesson.title}`} src={video} className="aspect-video w-full rounded-academy border border-academy-line bg-academy-ink" loading="lazy" allow="accelerometer; gyroscope; encrypted-media; picture-in-picture" allowFullScreen />
          ) : directVideo ? (
            <video aria-label={`Video guardado de ${lesson.title}`} src={directVideo} controls playsInline preload="none" className="aspect-video w-full rounded-academy border border-academy-line bg-academy-ink" />
          ) : lesson.video_url ? (
            <p className="text-sm text-academy-muted">El video guardado no se puede previsualizar aquí. Comprueba el enlace desde la vista de alumno.</p>
          ) : (
            <p className="rounded-academy border border-dashed border-academy-line px-4 py-6 text-center text-sm text-academy-muted">Sin video guardado</p>
          )}
        </Part>

        <Part n={3} {...part('actividad')} action={activity.mission?.kind === 'assignment' ? (
          <Link href={`/dashboard/cursos/${id}/entregas?leccion=${encodeURIComponent(lesson.id)}`} className={btnSmall}>Ver entregas</Link>
        ) : null}>
          {activity.errors.length ? (
            <ul role="alert" className="list-disc rounded-academy border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-900">
              {activity.errors.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : null}
          {readOnly ? (
            !activity.mission ? <p className="text-sm text-academy-muted">Esta clase no tiene actividad.</p>
            : activity.mission.kind === 'assignment' ? <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{activity.mission.instructions}</p>
            : activity.mission.kind === 'checklist' ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">{activity.mission.items.map((item, index) => <li key={index} className="break-words">{item}</li>)}</ol>
            ) : (
              <ol className="space-y-4 text-sm">
                {activity.mission.questions.map((question, index) => (
                  <li key={index} className="space-y-2">
                    <p className="break-words font-semibold">{index + 1}. {question.prompt}</p>
                    <ul className="space-y-1 pl-5">
                      {question.options.map((option, choice) => (
                        <li key={choice} className={`break-words ${choice === question.answer ? 'font-semibold text-academy-primary' : 'text-academy-muted'}`}>
                          {option}{choice === question.answer ? ' · respuesta correcta' : ''}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )
          ) : (
            <LessonActivityEditor key={lesson.mission} value={lesson.mission} />
          )}
        </Part>
        {!readOnly ? (
          <HStack as="footer" gap={4} align="center" wrap="wrap" className="academy-panel sticky bottom-4 z-10 px-4 py-3 shadow-lg sm:px-5">
            <AcademySubmit label="Guardar cambios" pending="Guardando…" />
            <p className="hidden text-sm text-academy-muted sm:block">Guarda el contenido, el video y la actividad. Los materiales se guardan aparte.</p>
          </HStack>
        ) : null}
      </form>

      <Part n={4} {...part('materiales')}>
        {status.guardado === 'recurso' ? <Notice tone="ok">Material agregado.</Notice> : null}
        {status.error === 'archivo' ? <Notice tone="error">No pudimos guardar el archivo o el enlace. Prueba con un archivo más pequeño o revisa la URL.</Notice> : null}
        {status.error === 'recurso' ? <Notice tone="error">Agrega un archivo, un enlace o una nota para guardar el material.</Notice> : null}

        {count ? (
          <ul className="divide-y divide-academy-line rounded-academy border border-academy-line">
            {lesson.resources.map((resource) => {
              const kind = materialKinds.find((item) => item.id === resource.kind);
              const privateFile = resource.kind === TEXT_TEMPLATE_KIND || isPrivateAcademiaAsset(resource.url || '');
              return (
                <li key={resource.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <HStack gap={3} align="center" className="min-w-0 flex-1">
                    <Icon name={privateFile ? 'lock' : 'link'} size={16} className="shrink-0 text-academy-muted" />
                    <VStack gap={0} className="min-w-0">
                      <p className="break-words font-semibold">{resource.title}</p>
                      <p className="text-xs text-academy-muted">{kind?.name || 'Material'}{privateFile ? ' · Descarga privada' : resource.url ? ' · Enlace' : ''}</p>
                    </VStack>
                  </HStack>
                  {!readOnly ? (
                    <form action={deleteResource}>
                      <input type="hidden" name="id" value={resource.id} />
                      <button className={btnSmall} type="submit" aria-label={`Quitar ${resource.title}`}>Quitar</button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : <p className="text-sm text-academy-muted">Sin materiales guardados.</p>}

        {!readOnly ? (
          <details open={status.error === 'archivo' || status.error === 'recurso' || status.error === 'plantilla' || undefined} className="rounded-academy border border-academy-line">
            <summary className="academy-focus flex min-h-11 cursor-pointer list-none items-center px-4 text-sm font-semibold text-academy-primary">Agregar material</summary>
            <form action={createResource} className="space-y-5 border-t border-academy-line p-4">
              {status.error === 'plantilla' ? <Notice tone="error">Escribe hasta 12.000 caracteres para la plantilla y deja vacíos el enlace y el archivo.</Notice> : null}
              <input type="hidden" name="lesson_id" value={lesson.id} />
              <label className={labelClass}>Título del material<input className={fieldClass} name="title" required /></label>
              <label className={labelClass}>Archivo<input className={`${fieldClass} text-sm file:mr-3 file:rounded-academy file:border-0 file:bg-academy-tint file:px-3 file:py-1 file:font-semibold file:text-academy-primary`} name="file" type="file" /></label>
              <label className={labelClass}>Enlace<input className={fieldClass} name="url" inputMode="url" placeholder="https://…" /></label>
              <label className={labelClass}>Nota o texto<textarea className={fieldClass} name="content" rows={3} /></label>
              <VStack gap={1}>
                <label className="flex items-start gap-3 text-sm font-semibold">
                  <input type="checkbox" name="kind" value={TEXT_TEMPLATE_KIND} className="mt-0.5 size-4" />
                  Ofrecer el texto como plantilla descargable
                </label>
                <p className="pl-7 text-sm text-academy-muted">El alumno lo descarga como archivo de texto en vez de leerlo en la clase. Deja vacíos el archivo y el enlace.</p>
              </VStack>
              <p className="text-sm text-academy-muted">Los archivos subidos quedan protegidos por el acceso a la clase. Los enlaces siguen las reglas de su proveedor.</p>
              <AcademySubmit label="Guardar material" pending="Guardando material…" />
            </form>
          </details>
        ) : null}
      </Part>

      {!readOnly && !lesson.source_id ? (
        <details className="academy-panel p-4 sm:px-6">
          <summary className="academy-focus min-h-11 cursor-pointer py-2.5 text-sm font-semibold text-red-800">Eliminar clase</summary>
          <form action={deleteLesson} className="space-y-3 pt-2">
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="course_id" value={id} />
            <p className="text-sm">Eliminar la clase también elimina sus materiales asociados y el avance registrado.</p>
            <AcademySubmit label="Confirmar eliminación" pending="Eliminando…" variant="destructive" />
          </form>
        </details>
      ) : null}
    </VStack>
  );
}
