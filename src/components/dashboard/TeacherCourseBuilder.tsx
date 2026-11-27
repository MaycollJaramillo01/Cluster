import Link from 'next/link';
import type { ReactNode } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Cover } from '@/components/academia/ui';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import {
  createCourse, createLesson, createSection, deleteSection, moveCourseLesson, moveCourseSection,
  renameCourseSection, requestReview, returnCourseReview, setCoursePublication, updateCoursePresentation,
  startCourseRevision, discardCourseRevision,
} from '@/lib/crm/lms-actions';
import type { LmsCourseRow, LmsLesson, LmsSection } from '@/lib/crm/lms';
import { formatDate } from '@/lib/crm/format';
import type { StaffRole } from '@/lib/crm/roles';
import { MISSION_LABELS, parseMission } from '@/lib/valux/mission';
import { Notice, Pill, SectionTitle, btn, btnDanger, btnGhost, fieldClass, labelClass } from './StaffUi';

export type CourseWorkspaceView = 'ficha' | 'temario' | 'revision' | 'alumnos' | 'ajustes';
type CourseStatus = { error?: string; guardado?: string };
type StatusFields = { published: boolean; review_requested_at: string | null; review_feedback: string | null };

export function courseStatusLabel(course: StatusFields) {
  return course.published ? 'Publicado' : course.review_requested_at ? 'En revisión' : course.review_feedback ? 'Cambios solicitados' : 'Borrador';
}

export function CourseStatusPill({ course }: { course: StatusFields }) {
  const tone = course.published ? 'ok' : course.review_requested_at ? 'wait' : course.review_feedback ? 'bad' : 'off';
  return <Pill tone={tone}><small aria-hidden="true" className="size-1.5 rounded-academy-full bg-current" />{courseStatusLabel(course)}</Pill>;
}

// Crear un curso pide solo el título; la ficha, el temario y la revisión se completan en el editor.
export function NewCourseForm({ error }: { error?: string }) {
  return (
    <VStack gap={3}>
      {error === 'curso' ? <Notice tone="error">Escribe el título del curso.</Notice> : null}
      <form action={createCourse} className="grid items-end gap-3 rounded-academy-lg border border-dashed border-academy-line bg-academy-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
        <label className={labelClass}>Título del nuevo curso<input className={fieldClass} name="title" placeholder="Ej. Fotografía de productos con tu celular" required /></label>
        <AcademySubmit label="Crear borrador" pending="Abriendo editor…" />
      </form>
    </VStack>
  );
}

const tabClass = 'academy-focus inline-flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 border-transparent text-sm font-semibold text-academy-muted transition-colors hover:text-academy-ink aria-[current=page]:border-academy-action aria-[current=page]:text-academy-ink';

export function CourseWorkspaceHeader({ course, view, role }: { course: LmsCourseRow; view: CourseWorkspaceView; role: StaffRole }) {
  const tabs: { id: CourseWorkspaceView; label: string }[] = [
    { id: 'ficha', label: 'Ficha' },
    { id: 'temario', label: 'Temario' },
    { id: 'revision', label: 'Revisión' },
  ];
  if (!course.revision_of) {
    tabs.push({ id: 'alumnos', label: 'Alumnos' });
    if (role !== 'profesor') tabs.push({ id: 'ajustes', label: 'Configuración comercial' });
  }
  const base = `/dashboard/cursos/${course.id}`;

  return (
    <VStack as="header" gap={4}>
      <Link href={role === 'profesor' ? '/dashboard/profesor' : '/dashboard/cursos'} className="academy-nav academy-focus -ml-3 w-fit">
        <Icon name="arrow-right" size={16} className="rotate-180" /> {role === 'profesor' ? 'Mis cursos' : 'Cursos'}
      </Link>
      <HStack gap={4} align="end" justify="between" wrap="wrap">
        <VStack gap={3} className="min-w-0">
          <Heading level={1} className="academy-title">{course.title}</Heading>
          <HStack gap={3} align="center" wrap="wrap">
            <CourseStatusPill course={course} />
            <p className="text-sm text-academy-muted">{course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}</p>
          </HStack>
        </VStack>
        <Link href={`${base}/vista-previa`} className={btnGhost}><Icon name="play" size={16} />Vista previa</Link>
      </HStack>
      <nav aria-label="Editor del curso" className="-mx-4 overflow-x-auto border-b border-academy-line px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-6">
          {tabs.map(({ id, label }) => (
            <li key={id}><Link href={`${base}?vista=${id}`} aria-current={view === id ? 'page' : undefined} className={tabClass}>{label}</Link></li>
          ))}
          {course.published ? (
            <>
              <li><Link href={`${base}/comunidad`} className={tabClass}>Comunidad</Link></li>
              <li><Link href={`${base}/reportes`} className={tabClass}>Reportes</Link></li>
            </>
          ) : null}
        </ul>
      </nav>
    </VStack>
  );
}

function Reorder({ courseId, id, kind, up, down }: { courseId: string; id: string; kind: 'módulo' | 'clase'; up: boolean; down: boolean }) {
  if (!up && !down) return null;
  const arrow = 'grid size-11 place-items-center rounded-academy text-academy-muted hover:bg-academy-tint hover:text-academy-ink disabled:opacity-30';
  return (
    <form action={kind === 'módulo' ? moveCourseSection : moveCourseLesson} className="flex shrink-0 items-center">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="direction" value="up" aria-label={`Subir ${kind}`} disabled={!up} className={arrow}>
        <Icon name="chevron-down" size={18} className="rotate-180" aria-hidden="true" />
      </button>
      <button type="submit" name="direction" value="down" aria-label={`Bajar ${kind}`} disabled={!down} className={arrow}>
        <Icon name="chevron-down" size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

const summaryClass = 'academy-focus flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold sm:px-5';

function NewLesson({ courseId, sectionId }: { courseId: string; sectionId?: string }) {
  return (
    <details className="border-t border-academy-line">
      <summary className={`${summaryClass} text-academy-primary`}>Agregar clase</summary>
      <form action={createLesson} className="grid items-end gap-3 px-4 pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5">
        <input type="hidden" name="course_id" value={courseId} />
        <input type="hidden" name="section_id" value={sectionId || ''} />
        <label className={labelClass}>Título de la clase<input className={fieldClass} name="title" required /></label>
        <AcademySubmit label="Crear clase" pending="Abriendo clase…" />
      </form>
    </details>
  );
}

function LessonRows({ courseId, lessons, readOnly }: { courseId: string; lessons: LmsLesson[]; readOnly: boolean }) {
  if (!lessons.length) return <p className="border-t border-academy-line px-4 py-4 text-sm text-academy-muted sm:px-5">Todavía no hay clases.</p>;
  return (
    <ol className="divide-y divide-academy-line border-t border-academy-line">
      {lessons.map((lesson, index) => {
        const { mission, errors } = parseMission(lesson.mission);
        const content = [
          lesson.video_url && 'Video', lesson.content.trim() && 'Texto',
          lesson.resources_count ? `${lesson.resources_count} ${lesson.resources_count === 1 ? 'material' : 'materiales'}` : '',
          mission && MISSION_LABELS[mission.kind],
        ].filter(Boolean);
        return (
          <li key={lesson.id} className="flex items-center pr-1">
            <Link href={`/dashboard/cursos/${courseId}/lecciones/${lesson.id}`} className="academy-focus flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-3 hover:bg-academy-page sm:px-5">
              <small aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-academy bg-academy-tint text-xs font-bold tabular-nums text-academy-primary">{index + 1}</small>
              <VStack gap={0} className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold">{lesson.title}</p>
                <p className={`text-xs ${errors.length ? 'font-semibold text-red-800' : 'text-academy-muted'}`}>{errors.length ? 'Actividad por corregir' : content.join(' · ') || 'Sin contenido'}</p>
              </VStack>
              <Icon name="arrow-right" size={16} className="shrink-0 text-academy-muted" aria-hidden="true" />
            </Link>
            {!readOnly ? <Reorder courseId={courseId} id={lesson.id} kind="clase" up={index > 0} down={index < lessons.length - 1} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function CourseDetails({ course, readOnly, status }: { course: LmsCourseRow; readOnly: boolean; status: CourseStatus }) {
  const outcomes = course.learning_outcomes.split('\n').map((item) => item.trim()).filter(Boolean);
  return (
    <section id="ficha" aria-labelledby="ficha-titulo" className="academy-panel scroll-mt-20">
      <VStack gap={3} className="p-5 sm:p-6">
        <SectionTitle id="ficha-titulo" title="Ficha y portada" description="Esta información acompaña al curso en el catálogo." />
        {status.guardado === 'ficha' ? <Notice tone="ok">Ficha guardada.</Notice> : null}
        {status.error === 'portada' ? <Notice tone="error">No se pudo guardar la portada. Usa una imagen de hasta 8 MB o pega un enlace válido.</Notice> : null}
      </VStack>
      {readOnly ? (
        <HStack gap={6} className="flex-col border-t border-academy-line p-5 sm:p-6 lg:flex-row">
          <VStack gap={5} className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap break-words">{course.description}</p>
            {outcomes.length ? (
              <VStack gap={2}>
                <Heading level={3} className="text-sm font-bold">Objetivos de aprendizaje</Heading>
                <ul className="space-y-2 text-sm">{outcomes.map((item, index) => <li key={index} className="flex gap-2 break-words"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-academy-primary" />{item}</li>)}</ul>
              </VStack>
            ) : null}
            {course.audience ? <VStack gap={1}><Heading level={3} className="text-sm font-bold">¿A quién va dirigido?</Heading><p className="whitespace-pre-wrap break-words text-sm">{course.audience}</p></VStack> : null}
            {course.prerequisites ? <VStack gap={1}><Heading level={3} className="text-sm font-bold">Requisitos previos</Heading><p className="whitespace-pre-wrap break-words text-sm">{course.prerequisites}</p></VStack> : null}
          </VStack>
          {course.cover_url ? <figure className="overflow-hidden rounded-academy lg:w-80 lg:shrink-0"><Cover url={course.cover_url} title={course.title} /></figure> : null}
        </HStack>
      ) : (
        <form action={updateCoursePresentation} className="border-t border-academy-line">
          <input type="hidden" name="course_id" value={course.id} />
          <HStack gap={8} align="start" className="flex-col p-5 sm:p-6 lg:flex-row">
            <VStack gap={5} className="w-full min-w-0 flex-1">
              <label className={labelClass}>Título del curso<input className={fieldClass} name="title" defaultValue={course.title} required /></label>
              <label className={labelClass}>Descripción<textarea className={fieldClass} name="description" rows={4} defaultValue={course.description} required /></label>
              <VStack gap={1}>
                <label className={labelClass}>Objetivos de aprendizaje<textarea className={fieldClass} name="learning_outcomes" rows={4} defaultValue={course.learning_outcomes} placeholder="Un resultado por línea" /></label>
                <small className="text-xs text-academy-muted">Escribe un resultado por línea. Aparecen como lista en la página del curso.</small>
              </VStack>
              <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
                <legend className="sr-only">Audiencia y requisitos</legend>
                <label className={labelClass}>¿A quién va dirigido?<textarea className={fieldClass} name="audience" rows={3} defaultValue={course.audience} /></label>
                <label className={labelClass}>Requisitos previos<textarea className={fieldClass} name="prerequisites" rows={3} defaultValue={course.prerequisites} /></label>
              </fieldset>
            </VStack>
            <VStack as="section" gap={4} aria-labelledby="portada-titulo" className="w-full min-w-0 rounded-academy-lg border border-academy-line bg-academy-page p-4 lg:w-80 lg:shrink-0">
              <Heading id="portada-titulo" level={3} className="text-sm font-bold">Portada</Heading>
              {course.cover_url ? (
                <figure className="overflow-hidden rounded-academy"><Cover url={course.cover_url} title={course.title} /></figure>
              ) : (
                <p className="grid aspect-video place-items-center rounded-academy border border-dashed border-academy-line text-sm text-academy-muted">Sin portada</p>
              )}
              <label className={labelClass}>Enlace de la portada<input className={fieldClass} name="cover_url" inputMode="url" defaultValue={course.cover_url || ''} placeholder="https://…" /></label>
              <label className={labelClass}>Subir portada (hasta 8 MB)<input className={`${fieldClass} text-sm file:mr-3 file:rounded-academy file:border-0 file:bg-academy-tint file:px-3 file:py-1 file:font-semibold file:text-academy-primary`} name="cover" type="file" accept="image/*" /></label>
            </VStack>
          </HStack>
          <HStack as="footer" gap={4} align="center" wrap="wrap" className="sticky bottom-0 z-10 rounded-b-academy-lg border-t border-academy-line bg-academy-surface px-5 py-4 sm:px-6">
            <AcademySubmit label="Guardar ficha" pending="Guardando ficha…" />
            <Link href={`/dashboard/cursos/${course.id}?vista=temario`} className="academy-nav academy-focus">Ir al temario <Icon name="arrow-right" size={16} /></Link>
          </HStack>
        </form>
      )}
    </section>
  );
}

function CourseCurriculum({ course, sections, lessons, readOnly, status }: {
  course: LmsCourseRow;
  sections: LmsSection[];
  lessons: LmsLesson[];
  readOnly: boolean;
  status: CourseStatus;
}) {
  const known = new Set(sections.map((section) => section.id));
  const loose = lessons.filter((lesson) => !lesson.section_id || !known.has(lesson.section_id));
  return (
    <VStack as="section" id="temario" gap={4} aria-labelledby="temario-titulo" className="scroll-mt-20">
      <SectionTitle
        id="temario-titulo"
        title="Módulos y clases"
        description="Abre una clase para editar su texto, video, actividad y materiales."
        action={<Link href={`/dashboard/cursos/${course.id}/entregas`} className={btnGhost}>Entregas de tareas</Link>}
      />
      {status.error === 'seccion' ? <Notice tone="error">Selecciona un módulo de este curso.</Notice> : null}
      {status.error === 'temario' ? <Notice tone="error">No se pudo guardar el cambio en el temario.</Notice> : null}
      {sections.map((section, index) => {
        const classes = lessons.filter((lesson) => lesson.section_id === section.id);
        return (
          <section key={section.id} aria-labelledby={`modulo-${section.id}`} className="academy-panel min-w-0 overflow-hidden">
            <HStack as="header" gap={2} align="center" justify="between" className="min-w-0 py-2 pl-4 pr-1 sm:pl-5">
              <VStack gap={0} className="min-w-0 py-1">
                <p className="text-xs font-semibold text-academy-muted">Módulo {index + 1} · {classes.length} {classes.length === 1 ? 'clase' : 'clases'}</p>
                <Heading id={`modulo-${section.id}`} level={3} className="break-words text-base font-bold">{section.title}</Heading>
              </VStack>
              {!readOnly ? <Reorder courseId={course.id} id={section.id} kind="módulo" up={index > 0} down={index < sections.length - 1} /> : null}
            </HStack>
            <LessonRows courseId={course.id} lessons={classes} readOnly={readOnly} />
            {!readOnly ? <>
              <NewLesson courseId={course.id} sectionId={section.id} />
              <details className="border-t border-academy-line">
                <summary className={`${summaryClass} text-academy-muted hover:text-academy-ink`}>Opciones del módulo</summary>
                <VStack gap={3} className="px-4 pb-4 sm:px-5">
                  <form action={renameCourseSection} className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input type="hidden" name="course_id" value={course.id} />
                    <input type="hidden" name="id" value={section.id} />
                    <label className={labelClass}>Nombre del módulo<input className={fieldClass} name="title" defaultValue={section.title} required /></label>
                    <AcademySubmit label="Renombrar módulo" pending="Guardando…" variant="secondary" />
                  </form>
                  {!classes.length ? <form action={deleteSection}>
                    <input type="hidden" name="id" value={section.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <button type="submit" className={btnDanger}>Quitar módulo vacío</button>
                  </form> : null}
                </VStack>
              </details>
            </> : null}
          </section>
        );
      })}
      {loose.length > 0 || !sections.length ? (
        <section aria-labelledby="clases-sueltas" className="academy-panel overflow-hidden">
          <Heading id="clases-sueltas" level={3} className="px-4 py-4 text-base font-bold sm:px-5">Clases sin módulo</Heading>
          <LessonRows courseId={course.id} lessons={loose} readOnly={readOnly} />
          {!readOnly ? <NewLesson courseId={course.id} /> : null}
        </section>
      ) : null}
      {!readOnly ? <form action={createSection} className="grid items-end gap-3 rounded-academy-lg border border-dashed border-academy-line bg-academy-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
        <input type="hidden" name="course_id" value={course.id} />
        <label className={labelClass}>Nombre del nuevo módulo<input className={fieldClass} name="title" placeholder="Ej. Fundamentos" required /></label>
        <AcademySubmit label="Agregar módulo" pending="Agregando módulo…" variant="secondary" />
      </form> : null}
    </VStack>
  );
}

function CourseReview({ course, role, issues, status }: {
  course: LmsCourseRow;
  role: StaffRole;
  issues: string[];
  status: CourseStatus;
}) {
  const pending = Boolean(course.review_requested_at);
  const ready = !issues.length;
  const needsReview = Boolean(course.teacher_id || course.revision_of) && !pending;
  return (
    <VStack as="section" id="revision" gap={5} aria-labelledby="revision-titulo" className="academy-panel scroll-mt-20 p-5 sm:p-6">
      <SectionTitle
        id="revision-titulo"
        title="Revisión y publicación"
        description={course.published ? 'El curso está disponible en el catálogo.' : pending ? `Solicitud enviada el ${formatDate(course.review_requested_at!)}.` : 'El curso aparece en el catálogo cuando el superadmin lo aprueba y publica.'}
      />
      {course.review_feedback ? (
        <aside aria-labelledby="observaciones" className="rounded-academy border border-academy-line bg-academy-page p-4">
          <Heading id="observaciones" level={3} className="text-sm font-bold">Observaciones del superadmin</Heading>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm">{course.review_feedback}</p>
        </aside>
      ) : null}
      {status.error === 'feedback' ? <Notice tone="error">Escribe qué cambios debe hacer el maestro.</Notice> : null}
      {status.error === 'revision' || status.error === 'publicacion' ? <Notice tone="error">Revisa los requisitos antes de continuar.</Notice> : null}
      {status.error === 'version' ? <Notice tone="error">El curso publicado cambió desde que se creó este borrador. Copia los cambios que quieras conservar y vuelve a crear el borrador desde la versión vigente.</Notice> : null}
      {status.guardado === 'version' ? <Notice tone="ok">Nueva versión publicada. El avance de los alumnos se conservó.</Notice> : null}
      {!course.published ? (
        ready
          ? <p className="flex items-center gap-2 text-sm font-semibold text-academy-primary"><Icon name="check" size={18} aria-hidden="true" />La ficha y el temario están completos para revisión.</p>
          : <VStack as="section" gap={2} aria-labelledby="pendientes" className="rounded-academy border border-academy-line bg-academy-page p-4">
            <Heading id="pendientes" level={3} className="text-sm font-bold">Pendientes del curso</Heading>
            <ul className="space-y-1.5 text-sm">{issues.map((issue, index) => <li key={index} className="flex gap-2"><small aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-academy-full bg-academy-muted" />{issue}</li>)}</ul>
          </VStack>
      ) : null}
      {ready && !pending && !course.published && (role !== 'superadmin' || needsReview) ? (
        <form action={requestReview}>
          <input type="hidden" name="course_id" value={course.id} />
          <AcademySubmit label="Enviar a revisión" pending="Enviando…" />
        </form>
      ) : null}
      {role === 'superadmin' && (((ready && !needsReview) || course.published) || (pending && !course.published)) ? (
        <VStack gap={4} className="border-t border-academy-line pt-5">
          {((ready && !needsReview) || course.published) ? <form action={setCoursePublication}>
            <input type="hidden" name="id" value={course.id} />
            <input type="hidden" name="publication" value={course.published ? 'draft' : 'publish'} />
            <AcademySubmit label={course.published ? 'Retirar del catálogo' : 'Aprobar y publicar'} pending={course.published ? 'Retirando…' : 'Publicando…'} variant={course.published ? 'secondary' : 'primary'} />
          </form> : null}
          {pending && !course.published ? <details className="rounded-academy border border-academy-line p-4">
            <summary className="academy-focus cursor-pointer text-sm font-semibold">Solicitar cambios</summary>
            <form action={returnCourseReview} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={course.id} />
              <label className={labelClass}>Observaciones para el maestro<textarea name="feedback" className={fieldClass} rows={4} maxLength={4000} required /></label>
              <AcademySubmit label="Devolver el borrador" pending="Enviando observaciones…" variant="secondary" />
            </form>
          </details> : null}
        </VStack>
      ) : null}
      {course.revision_of && (!pending || (status.error === 'version' && role === 'superadmin')) ? (
        <details className="rounded-academy border border-red-200 p-4">
          <summary className="academy-focus cursor-pointer text-sm font-semibold text-red-800">Descartar borrador de cambios</summary>
          <form action={discardCourseRevision} className="mt-3 space-y-3">
            <input type="hidden" name="course_id" value={course.id} />
            <p className="text-sm">Se eliminarán los cambios de este borrador. Los alumnos seguirán usando el curso publicado.</p>
            <AcademySubmit label="Confirmar descarte" pending="Descartando…" variant="destructive" />
          </form>
        </details>
      ) : null}
      {course.published ? <Link href={`/academia/${course.slug}`} className="academy-nav academy-focus -ml-3 w-fit">Ver curso publicado <Icon name="arrow-right" size={16} /></Link> : null}
    </VStack>
  );
}

// Un solo aviso de estado arriba del editor: qué versión se edita y qué hacer para cambiarla.
function CourseState({ course, role, readOnly, revision, status }: {
  course: LmsCourseRow;
  role: StaffRole;
  readOnly: boolean;
  revision: { id: string; pending: boolean; sameOwner: boolean } | null;
  status: CourseStatus;
}) {
  let text: ReactNode = null;
  let action: ReactNode = null;
  if (course.revision_of) {
    text = <>Borrador de actualización. Los alumnos siguen usando <Link href={`/dashboard/cursos/${course.revision_of}`} className="font-semibold underline underline-offset-4">la versión publicada</Link>.{readOnly ? ' El temario queda en modo de lectura durante la revisión. Si el superadmin solicita cambios, podrás editarlo otra vez.' : ''}</>;
  } else if (revision && role === 'profesor' && !revision.sameOwner) {
    text = 'El superadmin debe resolver el borrador del profesor anterior para que puedas abrir una nueva actualización.';
  } else if (revision) {
    text = revision.pending ? 'La próxima versión de este curso está en revisión.' : 'Ya hay un borrador de cambios para la próxima versión.';
    action = <Link href={`/dashboard/cursos/${revision.id}?vista=${revision.pending ? 'revision' : 'temario'}`} className={btn}>{revision.pending ? 'Ver actualización en revisión' : 'Abrir borrador de cambios'}</Link>;
  } else if (course.published) {
    text = readOnly ? 'Edita la próxima versión mientras los alumnos usan el curso publicado.' : 'Los alumnos usan esta versión. Puedes preparar la próxima en un borrador de cambios.';
    action = <form action={startCourseRevision}><input type="hidden" name="course_id" value={course.id} /><AcademySubmit label="Crear borrador de cambios" pending="Creando borrador…" /></form>;
  } else if (readOnly) {
    text = 'El temario queda en modo de lectura durante la revisión. Si el superadmin solicita cambios, podrás editarlo otra vez.';
  }
  return (
    <>
      {status.guardado === 'borrador' && revision && !revision.pending ? <Notice tone="ok">Borrador creado. Ya puedes preparar la próxima versión del curso.</Notice> : null}
      {status.error === 'estado' ? <Notice tone="error">El estado del curso cambió. Revisa si el borrador todavía se puede editar.</Notice> : null}
      {text ? (
        <HStack gap={4} align="center" justify="between" wrap="wrap" className="rounded-academy-lg border border-academy-line bg-academy-tint p-4 sm:px-5">
          <p className="flex min-w-0 max-w-prose items-start gap-2 text-sm"><Icon name="shield" size={16} className="mt-0.5 shrink-0 text-academy-primary" /><Text type="inherit">{text}</Text></p>
          {action}
        </HStack>
      ) : null}
    </>
  );
}

export function TeacherCourseBuilder({ course, sections, lessons, status, role, view, issues, revision, children }: {
  course: LmsCourseRow;
  sections: LmsSection[];
  lessons: LmsLesson[];
  status: CourseStatus;
  role: StaffRole;
  view: CourseWorkspaceView;
  issues: string[];
  revision: { id: string; pending: boolean; sameOwner: boolean } | null;
  children?: ReactNode;
}) {
  const readOnly = role === 'profesor' && Boolean(course.published || course.review_requested_at);
  return (
    <VStack gap={6} className="mx-auto w-full max-w-6xl">
      <CourseWorkspaceHeader course={course} view={view} role={role} />
      <CourseState course={course} role={role} readOnly={readOnly} revision={revision} status={status} />
      {!readOnly && course.review_feedback && view !== 'revision' ? <Notice>
        El superadmin solicitó cambios. <Link href={`/dashboard/cursos/${course.id}?vista=revision`} className="font-semibold underline underline-offset-4">Ver observaciones</Link>
      </Notice> : null}
      {view === 'ficha' ? <CourseDetails course={course} readOnly={readOnly} status={status} /> : null}
      {view === 'temario' ? <CourseCurriculum course={course} sections={sections} lessons={lessons} readOnly={readOnly} status={status} /> : null}
      {view === 'revision' ? <CourseReview course={course} role={role} issues={issues} status={status} /> : null}
      {children}
    </VStack>
  );
}
