import Link from 'next/link';
import type { ReactNode } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Cover } from '@/components/academia/ui';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import {
  createLesson, createSection, deleteSection, moveCourseLesson, moveCourseSection,
  renameCourseSection, requestReview, returnCourseReview, setCoursePublication, updateCoursePresentation,
  startCourseRevision, discardCourseRevision,
} from '@/lib/crm/lms-actions';
import type { LmsCourseRow, LmsLesson, LmsSection } from '@/lib/crm/lms';
import { formatDate } from '@/lib/crm/format';
import type { StaffRole } from '@/lib/crm/roles';
import { parseMission } from '@/lib/valux/mission';
import { courseField, courseLabel } from './TeacherCourseForm';

export type CourseWorkspaceView = 'ficha' | 'temario' | 'revision' | 'alumnos' | 'ajustes';
type CourseStatus = { error?: string; guardado?: string };

export function courseStatusLabel(course: LmsCourseRow) {
  return course.published ? 'Publicado' : course.review_requested_at ? 'En revisión' : course.review_feedback ? 'Cambios solicitados' : 'Borrador';
}

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
    <header>
      <Link href={role === 'profesor' ? '/dashboard/profesor' : '/dashboard/cursos'} className="academy-nav academy-focus">
        <Icon name="arrow-right" size={16} className="rotate-180" /> {role === 'profesor' ? 'Mis cursos' : 'Cursos'}
      </Link>
      <HStack gap={4} align="end" justify="between" wrap="wrap" className="pb-5">
        <VStack gap={2} className="min-w-0">
          <Heading level={1} className="academy-title">{course.title}</Heading>
          <p className="text-sm text-academy-muted"><strong className="font-semibold text-academy-primary">{courseStatusLabel(course)}</strong> · {course.lessons} {course.lessons === 1 ? 'clase' : 'clases'}</p>
        </VStack>
        <Button as={Link} href={`${base}/vista-previa`} label="Vista previa" variant="secondary" icon={<Icon name="play" size={17} />} />
      </HStack>
      <nav aria-label="Editor del curso" className="academy-panel flex flex-wrap gap-1 px-2 py-2">
        {tabs.map(({ id, label }) => (
          <Link
            key={id}
            href={`${base}?vista=${id}`}
            aria-current={view === id ? 'page' : undefined}
            className="academy-nav academy-focus"
          >
            {label}
          </Link>
        ))}
        {course.published ? (
          <>
            <Link href={`${base}/comunidad`} className="academy-nav academy-focus">Comunidad</Link>
            <Link href={`${base}/reportes`} className="academy-nav academy-focus">Reportes</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}

function Reorder({ courseId, id, kind, up, down }: { courseId: string; id: string; kind: 'módulo' | 'clase'; up: boolean; down: boolean }) {
  if (!up && !down) return null;
  return (
    <form action={kind === 'módulo' ? moveCourseSection : moveCourseLesson} className="flex shrink-0 items-center">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="direction" value="up" aria-label={`Subir ${kind}`} disabled={!up} className="grid h-11 w-11 place-items-center hover:bg-paper disabled:opacity-30">
        <Icon name="chevron-down" size={18} className="rotate-180" aria-hidden="true" />
      </button>
      <button type="submit" name="direction" value="down" aria-label={`Bajar ${kind}`} disabled={!down} className="grid h-11 w-11 place-items-center hover:bg-paper disabled:opacity-30">
        <Icon name="chevron-down" size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

function NewLesson({ courseId, sectionId }: { courseId: string; sectionId?: string }) {
  return (
    <details className="border-t border-black/10 px-4">
      <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold">Agregar clase</summary>
      <form action={createLesson} className="grid items-end gap-3 pb-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input type="hidden" name="course_id" value={courseId} />
        <input type="hidden" name="section_id" value={sectionId || ''} />
        <input type="hidden" name="editor" value="1" />
        <label className={courseLabel}>Título de la clase<input className={courseField} name="title" required /></label>
        <SubmitButton pending="Abriendo clase…" className="sm:w-auto">Crear clase</SubmitButton>
      </form>
    </details>
  );
}

function LessonRows({ courseId, lessons, readOnly }: { courseId: string; lessons: LmsLesson[]; readOnly: boolean }) {
  if (!lessons.length) return <p className="px-4 pb-4 text-sm text-black/70">Todavía no hay clases.</p>;
  return (
    <ol className="divide-y divide-black/10 border-t border-black/10">
      {lessons.map((lesson, index) => {
        const { mission, errors } = parseMission(lesson.mission);
        const content = [
          lesson.video_url && 'Video', lesson.content.trim() && 'Texto',
          lesson.resources_count ? `${lesson.resources_count} ${lesson.resources_count === 1 ? 'material' : 'materiales'}` : '',
          mission?.kind === 'quiz' && 'Misión',
          (mission?.kind === 'checklist' || mission?.kind === 'assignment') && 'Tarea',
        ].filter(Boolean);
        return (
          <li key={lesson.id} className="flex items-center">
            <Link href={`/dashboard/cursos/${courseId}/lecciones/${lesson.id}`} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-3 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset">
              <Icon name="play" size={17} className="shrink-0" aria-hidden="true" />
              <VStack gap={1} className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold">{lesson.title}</p>
                <p className="text-xs text-black/70">{errors.length ? 'Actividad por corregir' : content.join(' · ') || 'Sin contenido'}</p>
              </VStack>
              <Icon name="arrow-right" size={16} className="shrink-0" aria-hidden="true" />
            </Link>
            {!readOnly ? <Reorder courseId={courseId} id={lesson.id} kind="clase" up={index > 0} down={index < lessons.length - 1} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function CourseDetails({ course, readOnly, status }: { course: LmsCourseRow; readOnly: boolean; status: CourseStatus }) {
  return (
    <section id="ficha" className="scroll-mt-20 border border-black/15 bg-white">
      <VStack gap={2} className="p-5 sm:p-6">
        <Heading level={2} className="font-brand text-xl font-semibold">Ficha y portada</Heading>
        <p className="text-sm text-black/70">Esta información acompaña al curso en el catálogo.</p>
        {status.guardado === 'ficha' ? <p role="status" className="border-l-2 border-brand bg-paper px-3 py-2 text-sm">Ficha guardada.</p> : null}
        {status.error === 'portada' ? <p role="alert" className="text-sm text-red-800">No se pudo guardar la portada. Usa una imagen de hasta 8 MB o pega un enlace válido.</p> : null}
      </VStack>
      {readOnly ? (
        <VStack gap={4} className="border-t border-black/10 p-5 sm:p-6">
          {course.cover_url ? <figure className="max-w-xs"><Cover url={course.cover_url} title={course.title} /></figure> : null}
          <p className="whitespace-pre-wrap break-words text-sm">{course.description}</p>
          {course.learning_outcomes ? <section><h3 className="text-sm font-semibold">Objetivos de aprendizaje</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{course.learning_outcomes.split('\n').filter(Boolean).map((item, index) => <li key={index} className="break-words">{item}</li>)}</ul></section> : null}
          {course.audience ? <section><h3 className="text-sm font-semibold">¿A quién va dirigido?</h3><p className="whitespace-pre-wrap break-words text-sm">{course.audience}</p></section> : null}
          {course.prerequisites ? <section><h3 className="text-sm font-semibold">Requisitos previos</h3><p className="whitespace-pre-wrap break-words text-sm">{course.prerequisites}</p></section> : null}
        </VStack>
      ) : (
        <form action={updateCoursePresentation} className="border-t border-black/10">
          <input type="hidden" name="course_id" value={course.id} />
          <VStack gap={4} className="p-5 sm:p-6">
            <label className={courseLabel}>Título del curso<input className={courseField} name="title" defaultValue={course.title} required /></label>
            <label className={courseLabel}>Descripción<textarea className={courseField} name="description" rows={3} defaultValue={course.description} required /></label>
            <label className={courseLabel}>Objetivos de aprendizaje<textarea className={courseField} name="learning_outcomes" rows={3} defaultValue={course.learning_outcomes} placeholder="Un resultado por línea" /></label>
            <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
              <legend className="sr-only">Audiencia y requisitos</legend>
              <label className={courseLabel}>¿A quién va dirigido?<textarea className={courseField} name="audience" rows={2} defaultValue={course.audience} /></label>
              <label className={courseLabel}>Requisitos previos<textarea className={courseField} name="prerequisites" rows={2} defaultValue={course.prerequisites} /></label>
            </fieldset>
            {course.cover_url ? <figure className="max-w-xs"><Cover url={course.cover_url} title={course.title} /></figure> : null}
            <label className={courseLabel}>Enlace de la portada<input className={courseField} name="cover_url" inputMode="url" defaultValue={course.cover_url || ''} placeholder="https://…" /></label>
            <label className={courseLabel}>Subir portada (hasta 8 MB)<input className={courseField} name="cover" type="file" accept="image/*" /></label>
          </VStack>
          <footer className="flex flex-wrap items-center gap-3 border-t border-black/10 bg-paper p-5 sm:p-6">
            <SubmitButton pending="Guardando ficha…" className="sm:w-auto">Guardar ficha</SubmitButton>
            <Link href={`/dashboard/cursos/${course.id}?vista=temario`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Ir al temario →</Link>
          </footer>
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
    <section id="temario" className="scroll-mt-20 space-y-4">
      <HStack gap={4} align="end" justify="between" wrap="wrap">
        <VStack gap={2}>
          <Heading level={2} className="font-brand text-xl font-semibold">Módulos y clases</Heading>
          <p className="text-sm text-black/70">Abre una clase para ver sus videos, materiales y actividades.</p>
        </VStack>
        <Link href={`/dashboard/cursos/${course.id}/entregas`} className="inline-flex min-h-11 items-center gap-2 border border-black/20 bg-white px-4 text-sm font-semibold hover:border-ink">
          Entregas de tareas
        </Link>
      </HStack>
      {status.error === 'seccion' ? <p role="alert" className="text-sm text-red-800">Selecciona un módulo de este curso.</p> : null}
      {status.error === 'temario' ? <p role="alert" className="text-sm text-red-800">No se pudo guardar el cambio en el temario.</p> : null}
      {!readOnly ? <form action={createSection} className="grid items-end gap-3 border border-black/15 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input type="hidden" name="course_id" value={course.id} />
        <label className={courseLabel}>Nombre del módulo<input className={courseField} name="title" placeholder="Ej. Fundamentos" required /></label>
        <SubmitButton pending="Agregando módulo…" className="sm:w-auto">Agregar módulo</SubmitButton>
      </form> : null}
      {sections.map((section, index) => {
        const classes = lessons.filter((lesson) => lesson.section_id === section.id);
        return (
          <section key={section.id} className="min-w-0 border border-black/15 bg-white">
            <header className="flex min-w-0 items-center justify-between gap-2 pl-4">
              <Heading level={3} className="min-w-0 break-words py-4 font-brand text-base font-semibold">{section.title}</Heading>
              {!readOnly ? <Reorder courseId={course.id} id={section.id} kind="módulo" up={index > 0} down={index < sections.length - 1} /> : null}
            </header>
            <LessonRows courseId={course.id} lessons={classes} readOnly={readOnly} />
            {!readOnly ? <>
              <NewLesson courseId={course.id} sectionId={section.id} />
              <details className="border-t border-black/10 px-4">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-black/75">Opciones del módulo</summary>
                <form action={renameCourseSection} className="grid items-end gap-3 pb-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="id" value={section.id} />
                  <label className={courseLabel}>Nombre del módulo<input className={courseField} name="title" defaultValue={section.title} required /></label>
                  <SubmitButton pending="Guardando…" className="sm:w-auto">Renombrar módulo</SubmitButton>
                </form>
                {!classes.length ? <form action={deleteSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="course_id" value={course.id} />
                  <button type="submit" className="min-h-11 pb-2 text-sm text-red-800 underline underline-offset-4">Quitar módulo vacío</button>
                </form> : null}
              </details>
            </> : null}
          </section>
        );
      })}
      {loose.length > 0 || !sections.length ? (
        <section className="border border-black/15 bg-white">
          <Heading level={3} className="px-4 py-4 font-brand text-base font-semibold">Clases sin módulo</Heading>
          <LessonRows courseId={course.id} lessons={loose} readOnly={readOnly} />
          {!readOnly ? <NewLesson courseId={course.id} /> : null}
        </section>
      ) : null}
    </section>
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
    <section id="revision" className="scroll-mt-20 space-y-5 border border-black/15 bg-white p-5 sm:p-6">
      <Heading level={2} className="font-brand text-xl font-semibold">Revisión y publicación</Heading>
      <p className="text-sm text-black/70">
        {course.published ? 'El curso está disponible en el catálogo.' : pending ? `Solicitud enviada el ${formatDate(course.review_requested_at!)}.` : 'El curso aparece en el catálogo cuando el superadmin lo aprueba y publica.'}
      </p>
      {course.review_feedback ? <aside className="border-l-2 border-ink bg-paper p-4">
        <h3 className="text-sm font-semibold">Observaciones del superadmin</h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm">{course.review_feedback}</p>
      </aside> : null}
      {status.error === 'feedback' ? <p role="alert" className="text-sm text-red-800">Escribe qué cambios debe hacer el maestro.</p> : null}
      {status.error === 'revision' || status.error === 'publicacion' ? <p role="alert" className="text-sm text-red-800">Revisa los requisitos antes de continuar.</p> : null}
      {status.error === 'version' ? <p role="alert" className="text-sm text-red-800">El curso publicado cambió desde que se creó este borrador. Copia los cambios que quieras conservar y vuelve a crear el borrador desde la versión vigente.</p> : null}
      {status.guardado === 'version' ? <p role="status" className="text-sm font-semibold">Nueva versión publicada. El avance de los alumnos se conservó.</p> : null}
      {course.revision_of && (!pending || (status.error === 'version' && role === 'superadmin')) ? (
        <details className="border border-black/15 p-4">
          <summary className="cursor-pointer text-sm font-semibold">Descartar borrador de cambios</summary>
          <form action={discardCourseRevision} className="mt-3 space-y-3">
            <input type="hidden" name="course_id" value={course.id} />
            <p className="text-sm">Se eliminarán los cambios de este borrador. Los alumnos seguirán usando el curso publicado.</p>
            <SubmitButton pending="Descartando…" className="sm:w-auto">Confirmar descarte</SubmitButton>
          </form>
        </details>
      ) : null}
      {!course.published ? (
        ready
          ? <p className="flex items-center gap-2 text-sm font-medium"><Icon name="check" size={18} aria-hidden="true" /> La ficha y el temario están completos para revisión.</p>
          : <section className="border border-black/15 bg-paper p-4">
            <h3 className="text-sm font-semibold">Pendientes del curso</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-black/80">{issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul>
          </section>
      ) : null}
      {ready && !pending && !course.published && (role !== 'superadmin' || needsReview) ? (
        <form action={requestReview}>
          <input type="hidden" name="course_id" value={course.id} />
          <SubmitButton pending="Enviando…" className="sm:w-auto">Enviar a revisión</SubmitButton>
        </form>
      ) : null}
      {role === 'superadmin' ? (
        <VStack gap={4} className="border-t border-black/10 pt-5">
          {((ready && !needsReview) || course.published) ? <form action={setCoursePublication}>
            <input type="hidden" name="id" value={course.id} />
            <input type="hidden" name="publication" value={course.published ? 'draft' : 'publish'} />
            <SubmitButton pending={course.published ? 'Retirando…' : 'Publicando…'} className="sm:w-auto">
              {course.published ? 'Retirar del catálogo' : 'Aprobar y publicar'}
            </SubmitButton>
          </form> : null}
          {pending && !course.published ? <details className="border border-black/15 p-4">
            <summary className="cursor-pointer font-semibold">Solicitar cambios</summary>
            <form action={returnCourseReview} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={course.id} />
              <label className={courseLabel}>Observaciones para el maestro<textarea name="feedback" className={courseField} rows={4} maxLength={4000} required /></label>
              <SubmitButton pending="Enviando observaciones…" className="sm:w-auto">Devolver el borrador</SubmitButton>
            </form>
          </details> : null}
        </VStack>
      ) : null}
      {course.published ? <Link href={`/academia/${course.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Ver curso publicado</Link> : null}
    </section>
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
    <VStack gap={5} className="mx-auto w-full max-w-6xl [color-scheme:light]">
      <CourseWorkspaceHeader course={course} view={view} role={role} />
      {course.revision_of ? <p className="border-l-2 border-brand bg-white p-4 text-sm">
        Borrador de actualización. Los alumnos siguen usando <Link href={`/dashboard/cursos/${course.revision_of}`} className="underline">la versión publicada</Link>.
      </p> : null}
      {status.guardado === 'borrador' && revision && !revision.pending ? (
        <p role="status" className="academy-notice">Borrador creado. Ya puedes preparar la próxima versión del curso.</p>
      ) : null}
      {revision && role === 'profesor' && !revision.sameOwner ? (
        <p className="border-l-2 border-ink bg-white p-4 text-sm">El superadmin debe resolver el borrador del profesor anterior para que puedas abrir una nueva actualización.</p>
      ) : revision ? <Button as={Link} href={`/dashboard/cursos/${revision.id}?vista=${revision.pending ? 'revision' : 'temario'}`} label={revision.pending ? 'Ver actualización en revisión' : 'Abrir borrador de cambios'} className="min-h-11 self-start" /> : course.published ? <form action={startCourseRevision}>
        <input type="hidden" name="course_id" value={course.id} />
        <AcademySubmit label="Crear borrador de cambios" pending="Creando borrador…" />
      </form> : null}
      {status.error === 'estado' ? <p role="alert" className="border-l-2 border-red-800 bg-white p-4 text-sm text-red-800">El estado del curso cambió. Revisa si el borrador todavía se puede editar.</p> : null}
      {readOnly ? <p className="border-l-2 border-ink bg-white p-4 text-sm">
        {course.published ? 'Edita la próxima versión mientras los alumnos usan el curso publicado.' : 'El temario queda en modo de lectura durante la revisión. Si el superadmin solicita cambios, podrás editarlo otra vez.'}
      </p> : null}
      {!readOnly && course.review_feedback && view !== 'revision' ? <p className="border-l-2 border-ink bg-white p-4 text-sm">
        El superadmin solicitó cambios. <Link href={`/dashboard/cursos/${course.id}?vista=revision`} className="underline underline-offset-4">Ver observaciones</Link>
      </p> : null}
      {view === 'ficha' ? <CourseDetails course={course} readOnly={readOnly} status={status} /> : null}
      {view === 'temario' ? <CourseCurriculum course={course} sections={sections} lessons={lessons} readOnly={readOnly} status={status} /> : null}
      {view === 'revision' ? <CourseReview course={course} role={role} issues={issues} status={status} /> : null}
      {children}
    </VStack>
  );
}
