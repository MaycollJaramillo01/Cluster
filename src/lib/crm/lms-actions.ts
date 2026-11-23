'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { storedFile, storedPrivateAsset, TEXT_TEMPLATE_KIND } from '@/lib/valux/upload';
import { crm } from './db';
import { requireCourseEditor } from './course-access';
import { requireDashboard } from './session';
import { FEATURED_KEY } from '@/lib/valux/catalog';
import { parseMission } from '@/lib/valux/mission';
import { bunnyVideo, validLessonVideo } from '@/lib/valux/video';
import { getCourse } from './lms';
import { courseReviewIssues } from './course-review';
import { createCourseRevision, publishCourseRevision } from './course-revisions';
import type { NeonQueryFunctionInTransaction, NeonQueryInTransaction } from '@neondatabase/serverless';

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function cents(formData: FormData, key: string) {
  const value = Number(field(formData, key).replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function positive(raw: string) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

function grade(raw: string) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'curso';
}

function refresh() {
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/academia', 'layout');
}

export async function saveFeaturedCourses(formData: FormData) {
  await requireDashboard('contenido');
  const ids = formData.getAll('featured').map(String).filter(Boolean);
  if (ids.length > 4 || new Set(ids).size !== ids.length) redirect('/dashboard/cursos?error=destacados');
  const sql = await crm();
  const published = ids.length ? await sql`SELECT id FROM lms_courses WHERE published AND id = ANY(${ids})` : [];
  if (published.length !== ids.length) redirect('/dashboard/cursos?error=destacados');
  await sql`INSERT INTO crm_meta (key, value) VALUES (${FEATURED_KEY}, ${JSON.stringify(ids)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  refresh();
  redirect('/dashboard/cursos?guardado=destacados');
}

async function lessonCourse(lessonId: string) {
  const sql = await crm();
  const rows = await sql`SELECT course_id FROM lms_lessons WHERE id = ${lessonId}`;
  return String((rows[0] as { course_id?: string } | undefined)?.course_id || '');
}

type AuthoringSql = NeonQueryFunctionInTransaction<false, false>;

async function mutateCourse(courseId: string, back: string, mutate: (tx: AuthoringSql, allowed: NeonQueryInTransaction) => NeonQueryInTransaction) {
  const { teacherId } = await requireCourseEditor(courseId);
  const sql = await crm();
  const [course, work] = await sql.transaction((tx) => {
    const editable = tx`id = ${courseId} AND (${teacherId}::text IS NULL OR
      (teacher_id = ${teacherId} AND NOT published AND review_requested_at IS NULL))`;
    return [
      tx`UPDATE lms_courses SET authoring_version = authoring_version + 1,
        review_requested_at = CASE WHEN NOT published THEN NULL ELSE review_requested_at END
        WHERE ${editable} RETURNING id`,
      mutate(tx, tx`EXISTS (SELECT FROM lms_courses WHERE ${editable})`),
    ];
  });
  if (!course.length) redirect(`${back}${back.includes('?') ? '&' : '?'}error=estado`);
  return work;
}

async function checkEditableBeforeUpload(courseId: string, back: string) {
  const { teacher } = await requireCourseEditor(courseId);
  if (!teacher) return;
  const sql = await crm();
  const [course] = await sql`SELECT published, review_requested_at FROM lms_courses WHERE id = ${courseId}`;
  if (course?.published || course?.review_requested_at) redirect(`${back}?error=estado`);
}

// El profesor pide revisión y el superadmin publica desde la ficha del curso.
export async function requestReview(formData: FormData) {
  const courseId = field(formData, 'course_id');
  if (!courseId) return;
  const { teacherId } = await requireCourseEditor(courseId);
  const path = `/dashboard/cursos/${courseId}?vista=revision`;
  const detail = await getCourse(courseId);
  if (!detail || courseReviewIssues(detail).length) redirect(`${path}&error=revision#revision`);
  const sql = await crm();
  const requested = await sql`UPDATE lms_courses SET review_requested_at = COALESCE(review_requested_at, now())
    WHERE id = ${courseId} AND NOT published AND authoring_version = ${detail.course.authoring_version}
      AND (${teacherId}::text IS NULL OR teacher_id = ${teacherId}) RETURNING id`;
  if (!requested.length) redirect(`${path}&error=revision#revision`);
  refresh();
}

export async function updateCoursePresentation(formData: FormData) {
  const id = field(formData, 'course_id');
  const title = field(formData, 'title');
  const description = field(formData, 'description');
  if (!id || !title || !description) return;
  const back = `/dashboard/cursos/${id}`;
  await checkEditableBeforeUpload(id, back);
  const cover = await storedFile(formData, 'cover', 'cover_url', true).catch(() => {
    redirect(`${back}?error=portada#ficha`);
  });
  await mutateCourse(id, back, (tx, allowed) => tx`
    UPDATE lms_courses SET title = ${title}, description = ${description}, cover_url = ${cover},
      learning_outcomes = ${field(formData, 'learning_outcomes')}, audience = ${field(formData, 'audience')},
      prerequisites = ${field(formData, 'prerequisites')} WHERE id = ${id} AND ${allowed}
  `);
  refresh();
  redirect(`${back}?guardado=ficha#ficha`);
}

async function courseSection(courseId: string, sectionId: string, back: string) {
  if (!sectionId) return null;
  const sql = await crm();
  const rows = await sql`SELECT id FROM lms_sections WHERE id=${sectionId} AND course_id=${courseId}`;
  if (!rows.length) redirect(`${back}${back.includes('?') ? '&' : '?'}error=seccion`);
  return sectionId;
}

async function uniqueCourseSlug(title: string) {
  const sql = await crm();
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while ((await sql`SELECT id FROM lms_courses WHERE slug = ${slug}`).length) {
    n += 1;
    slug = `${base.slice(0, 54)}-${n}`;
  }
  return slug;
}

export async function createCourse(formData: FormData) {
  const session = await requireDashboard('curso');
  const teacherDraft = session.role === 'profesor';
  const title = field(formData, 'title');
  const description = field(formData, 'description');
  const back = `${teacherDraft ? '/dashboard/profesor' : '/dashboard/cursos'}?vista=nuevo`;
  if (!title || !description) redirect(`${back}&error=curso`);
  const video = field(formData, 'video_url');
  if (video && !validLessonVideo(video)) redirect(`${back}&error=video`);
  const cover = await storedFile(formData, 'cover', 'cover_url', true).catch(() => redirect(`${back}&error=portada`));
  const sql = await crm();
  const id = crypto.randomUUID();
  const slug = await uniqueCourseSlug(title);
  const created = await sql`
      WITH teacher AS (
        INSERT INTO valux_people (id, name, email, role)
        SELECT ${crypto.randomUUID()}, ${session.name}, ${session.email}, 'profesor' WHERE ${teacherDraft}::boolean
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
      ), course AS (
        INSERT INTO lms_courses (id, slug, title, description, price_cents, cover_url, teacher_id,
          learning_outcomes, audience, prerequisites)
        VALUES (${id}, ${slug}, ${title}, ${description}, ${teacherDraft ? 0 : cents(formData, 'price')}, ${cover},
          CASE WHEN ${teacherDraft}::boolean THEN (SELECT id FROM teacher) ELSE ${field(formData, 'teacher_id') || null} END,
          ${field(formData, 'learning_outcomes')}, ${field(formData, 'audience')}, ${field(formData, 'prerequisites')})
        ON CONFLICT (slug) DO NOTHING RETURNING id
      ), introduction AS (
        INSERT INTO lms_lessons (id, course_id, slug, title, content, video_url, sort_order)
        SELECT ${crypto.randomUUID()}, id, 'introduccion', 'Introducción', '', ${video}, 1 FROM course WHERE ${video} <> ''
      )
      SELECT id FROM course
  `;
  if (!created.length) redirect(`${back}&error=curso`);
  refresh();
  redirect(`/dashboard/cursos/${id}`);
}

export async function startCourseRevision(formData: FormData) {
  const id = field(formData, 'course_id');
  if (!id) return;
  const { teacherId } = await requireCourseEditor(id);
  const draftId = await createCourseRevision(id, teacherId);
  if (!draftId) redirect(`/dashboard/cursos/${id}?vista=revision&error=estado`);
  refresh();
  redirect(`/dashboard/cursos/${draftId}?vista=temario`);
}

export async function discardCourseRevision(formData: FormData) {
  const id = field(formData, 'course_id');
  if (!id) return;
  const { teacherId, session } = await requireCourseEditor(id);
  const sql = await crm();
  const [draft] = await sql`DELETE FROM lms_courses WHERE id = ${id} AND revision_of IS NOT NULL AND NOT published
    AND (review_requested_at IS NULL OR ${session.role === 'superadmin'})
    AND (${teacherId}::text IS NULL OR teacher_id = ${teacherId}) RETURNING revision_of`;
  if (!draft) redirect(`/dashboard/cursos/${id}?vista=revision&error=estado`);
  refresh();
  redirect(`/dashboard/cursos/${draft.revision_of}?vista=revision`);
}

export async function setCoursePublication(formData: FormData) {
  await requireDashboard();
  const id = field(formData, 'id');
  const state = field(formData, 'publication');
  if (!id || (state !== 'publish' && state !== 'draft')) return;
  const path = `/dashboard/cursos/${id}?vista=revision`;
  const sql = await crm();
  if (state === 'publish') {
    const detail = await getCourse(id);
    if (detail?.course.published) return;
    if (!detail || courseReviewIssues(detail).length || ((detail.course.teacher_id || detail.course.revision_of) && !detail.course.review_requested_at)) {
      redirect(`${path}&error=revision#revision`);
    }
    if (detail.course.revision_of) {
      const origin = detail.course.revision_of;
      if (!await publishCourseRevision(id, origin, detail.course.authoring_version)) redirect(`${path}&error=version#revision`);
      refresh();
      redirect(`/dashboard/cursos/${origin}?vista=revision&guardado=version#revision`);
    }
    const published = await sql`UPDATE lms_courses SET published = true, review_requested_at = NULL, review_feedback = ''
      WHERE id = ${id} AND authoring_version = ${detail.course.authoring_version} AND NOT published
        AND (teacher_id IS NULL OR review_requested_at IS NOT NULL) RETURNING id`;
    if (!published.length) redirect(`${path}&error=publicacion#revision`);
  } else {
    await sql`UPDATE lms_courses SET published = false, review_requested_at = NULL WHERE id = ${id}`;
  }
  refresh();
}

export async function returnCourseReview(formData: FormData) {
  await requireDashboard();
  const id = field(formData, 'id');
  const feedback = field(formData, 'feedback');
  if (!id) return;
  const path = `/dashboard/cursos/${id}?vista=revision`;
  if (!feedback || feedback.length > 4000) redirect(`${path}&error=feedback#revision`);
  const sql = await crm();
  const updated = await sql`UPDATE lms_courses SET review_requested_at = NULL, review_feedback = ${feedback}
    WHERE id = ${id} AND review_requested_at IS NOT NULL AND NOT published RETURNING id`;
  if (!updated.length) redirect(`${path}&error=publicacion#revision`);
  refresh();
}

export async function deleteCourse(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE valux_sales SET course_id = NULL WHERE course_id = ${id}`;
  await sql`DELETE FROM lms_courses WHERE id = ${id}`;
  refresh();
  redirect('/dashboard/cursos');
}

export async function createLesson(formData: FormData) {
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!courseId || !title) return;
  await requireCourseEditor(courseId);
  const back = `/dashboard/cursos/${courseId}?vista=temario`;
  const id = crypto.randomUUID();
  const section = await courseSection(courseId, field(formData, 'section_id'), back);
  const video = field(formData, 'video_url');
  if (video && !validLessonVideo(video)) redirect(`${back}&error=video`);
  const base = slugify(title);
  const points = positive(field(formData, 'points')) || 10;
  const created = await mutateCourse(courseId, back, (tx, allowed) => tx`
    INSERT INTO lms_lessons (id, course_id, section_id, slug, title, content, video_url, points, duration_min, sort_order)
    SELECT ${id}, ${courseId}, ${section}, CASE WHEN EXISTS (
      SELECT FROM lms_lessons WHERE course_id = ${courseId} AND slug = ${base}
    ) THEN ${`${base.slice(0, 50)}-${id.slice(0, 8)}`} ELSE ${base} END,
      ${title}, ${field(formData, 'content')}, ${video || null}, ${points}, ${positive(field(formData, 'duration_min'))},
      (SELECT COALESCE(max(sort_order), 0) + 1 FROM lms_lessons WHERE course_id = ${courseId})
    WHERE ${allowed} AND (${section}::text IS NULL OR EXISTS (SELECT FROM lms_sections WHERE id = ${section} AND course_id = ${courseId}))
    RETURNING id
  `);
  if (!created.length) redirect(`${back}&error=seccion`);
  refresh();
  if (field(formData, 'editor') === '1') redirect(`/dashboard/cursos/${courseId}/lecciones/${id}`);
}

export async function updateLesson(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!id || !courseId || !title) return;
  await requireCourseEditor(courseId);
  const back = `/dashboard/cursos/${courseId}/lecciones/${id}`;
  const section = await courseSection(courseId, field(formData, 'section_id'), back);
  const video = field(formData, 'video_url');
  if (video && !validLessonVideo(video)) redirect(`${back}?error=video`);
  if (field(formData, 'preview_public') === '1' && bunnyVideo(video)) redirect(`${back}?error=muestra`);
  const mission = String(formData.get('mission') ?? '').trim();
  if (mission.length > 24000 || parseMission(mission).errors.length) redirect(`${back}?error=mision`);
  const points = positive(field(formData, 'points')) || 10;
  const saved = await mutateCourse(courseId, back, (tx, allowed) => tx`
    UPDATE lms_lessons l
    SET title = ${title},
      content = ${field(formData, 'content')},
      video_url = ${video || null},
      section_id = ${section},
      points = ${points},
      duration_min = ${positive(field(formData, 'duration_min'))},
      mission = ${mission},
      preview_public = CASE WHEN ${field(formData, 'preview_settings') === '1'} THEN ${field(formData, 'preview_public') === '1'} ELSE l.preview_public END,
      sort_order = CASE WHEN section_id IS DISTINCT FROM ${section}::text THEN
        (SELECT COALESCE(max(other.sort_order), 0) + 1 FROM lms_lessons other
          WHERE other.course_id = l.course_id AND other.section_id IS NOT DISTINCT FROM ${section}::text)
        ELSE sort_order END
    WHERE l.id = ${id} AND l.course_id = ${courseId} AND ${allowed}
      AND (${section}::text IS NULL OR EXISTS (SELECT FROM lms_sections WHERE id = ${section} AND course_id = ${courseId}))
    RETURNING l.id
  `);
  if (!saved.length) redirect(`${back}?error=seccion`);
  refresh();
  if (field(formData, 'editor') === '1') redirect(`/dashboard/cursos/${courseId}/lecciones/${id}?guardado=1`);
  redirect(`/dashboard/cursos/${courseId}`);
}

export async function deleteLesson(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  if (!id || !courseId) return;
  const deleted = await mutateCourse(courseId, `/dashboard/cursos/${courseId}?vista=temario`, (tx, allowed) =>
    tx`DELETE FROM lms_lessons WHERE id = ${id} AND course_id = ${courseId} AND source_id IS NULL AND ${allowed} RETURNING id`);
  if (!deleted.length) redirect(`/dashboard/cursos/${courseId}/lecciones/${id}?error=conservar`);
  refresh();
  redirect(`/dashboard/cursos/${courseId}?vista=temario`);
}

export async function updateCourseMeta(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  await mutateCourse(id, `/dashboard/cursos/${id}?vista=ajustes`, (tx, allowed) => tx`
    UPDATE lms_courses
    SET teacher_id = ${field(formData, 'teacher_id') || null},
      price_cents = ${cents(formData, 'price')},
      plan_level = ${Math.max(0, Math.min(3, Math.round(Number(field(formData, 'plan_level')) || 0)))},
      bump_course_id = ${field(formData, 'bump_course_id') || null},
      bump_cents = ${cents(formData, 'bump_price')},
      upsell_course_id = ${field(formData, 'upsell_course_id') || null},
      upsell_cents = ${cents(formData, 'upsell_price')}
    WHERE id = ${id} AND ${allowed}
  `);
  refresh();
}

export async function createSection(formData: FormData) {
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!courseId || !title) return;
  await mutateCourse(courseId, `/dashboard/cursos/${courseId}?vista=temario`, (tx, allowed) => tx`
    INSERT INTO lms_sections (id, course_id, title, sort_order)
    SELECT ${crypto.randomUUID()}, ${courseId}, ${title},
      (SELECT COALESCE(max(sort_order), 0) + 1 FROM lms_sections WHERE course_id = ${courseId}) WHERE ${allowed}
  `);
  refresh();
}

export async function renameCourseSection(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!id || !courseId || !title) return;
  await mutateCourse(courseId, `/dashboard/cursos/${courseId}?vista=temario`, (tx, allowed) =>
    tx`UPDATE lms_sections SET title = ${title} WHERE id = ${id} AND course_id = ${courseId} AND ${allowed}`);
  refresh();
}

async function moveCurriculumItem(formData: FormData, lesson: boolean) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  const direction = field(formData, 'direction');
  if (!id || !courseId || (direction !== 'up' && direction !== 'down')) return;
  const delta = direction === 'up' ? -1 : 1;
  await mutateCourse(courseId, `/dashboard/cursos/${courseId}?vista=temario`, (tx, allowed) => {
    const table = lesson ? tx`lms_lessons` : tx`lms_sections`;
    const scope = lesson ? tx`AND section_id IS NOT DISTINCT FROM
      (SELECT section_id FROM lms_lessons WHERE course_id = ${courseId} AND id = ${id})` : tx``;
    return tx`
      WITH ordered AS (
        SELECT id, sort_order, row_number() OVER (ORDER BY sort_order, title, id) AS position
        FROM ${table} WHERE course_id = ${courseId} ${scope}
      ), current_item AS (
        SELECT position, sort_order FROM ordered WHERE id = ${id}
      ), destination AS (
        SELECT ordered.* FROM ordered JOIN current_item ON ordered.position = current_item.position + ${delta}::integer
      ), positions AS (
        SELECT ordered.id, ordered.position, current_item.position AS from_pos, destination.position AS to_pos,
          (SELECT min(sort_order) FROM ordered) AS first_position
        FROM ordered CROSS JOIN current_item CROSS JOIN destination
      )
      UPDATE ${table} item SET sort_order = positions.first_position - 1 + CASE
        WHEN positions.position = positions.from_pos THEN positions.to_pos
        WHEN positions.position = positions.to_pos THEN positions.from_pos ELSE positions.position END
      FROM positions WHERE item.id = positions.id AND ${allowed}
    `;
  });
  refresh();
}

export async function moveCourseSection(formData: FormData) {
  await moveCurriculumItem(formData, false);
}

export async function moveCourseLesson(formData: FormData) {
  await moveCurriculumItem(formData, true);
}

export async function deleteSection(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  if (!id || !courseId) return;
  await mutateCourse(courseId, `/dashboard/cursos/${courseId}?vista=temario`, (tx, allowed) => tx`
    WITH removed AS (DELETE FROM lms_sections WHERE id = ${id} AND course_id = ${courseId} AND ${allowed} RETURNING id)
    UPDATE lms_lessons SET section_id = NULL WHERE course_id = ${courseId} AND section_id IN (SELECT id FROM removed)
  `);
  refresh();
}

export async function createResource(formData: FormData) {
  const lessonId = field(formData, 'lesson_id');
  const title = field(formData, 'title');
  const kind = field(formData, 'kind') || 'enlace';
  if (!lessonId || !title) return;
  const courseId = await lessonCourse(lessonId);
  const back = `/dashboard/cursos/${courseId}/lecciones/${lessonId}`;
  await checkEditableBeforeUpload(courseId, back);
  const allowed = ['video', 'pdf', 'imagen', 'enlace', 'texto', TEXT_TEMPLATE_KIND];
  const content = field(formData, 'content');
  const file = formData.get('file');
  if (kind === TEXT_TEMPLATE_KIND && (!content || content.length > 12000 || field(formData, 'url') || (file instanceof File && file.size))) {
    redirect(`${back}?error=plantilla#materiales`);
  }
  const url = kind === TEXT_TEMPLATE_KIND ? null : await storedPrivateAsset(formData, 'file', 'url').catch(() => {
    redirect(`${back}?error=archivo#materiales`);
  });
  if (!url && !content) redirect(`${back}?error=recurso#materiales`);
  await mutateCourse(courseId, back, (tx, editable) => tx`
    INSERT INTO lms_resources (id, lesson_id, kind, title, url, content, sort_order)
    SELECT ${crypto.randomUUID()}, l.id, ${allowed.includes(kind) ? kind : 'enlace'}, ${title}, ${url}, ${content || null},
      (SELECT COALESCE(max(sort_order), 0) + 1 FROM lms_resources WHERE lesson_id = ${lessonId})
    FROM lms_lessons l WHERE l.id = ${lessonId} AND l.course_id = ${courseId} AND ${editable}
  `);
  refresh();
  redirect(`${back}?guardado=recurso#materiales`);
}

export async function deleteResource(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const owner = await sql`SELECT lesson_id FROM lms_resources WHERE id = ${id}`;
  const lessonId = String(owner[0]?.lesson_id || '');
  const courseId = await lessonCourse(lessonId);
  const back = `/dashboard/cursos/${courseId}/lecciones/${lessonId}`;
  await mutateCourse(courseId, back, (tx, allowed) => tx`DELETE FROM lms_resources WHERE id = ${id} AND lesson_id = ${lessonId} AND ${allowed}`);
  refresh();
  redirect(`${back}?guardado=recurso#materiales`);
}

export async function saveChallenge(formData: FormData) {
  await requireDashboard('contenido');
  const title = field(formData, 'title');
  const raw = field(formData, 'kind');
  const kind = raw === 'misiones' || raw === 'curso' ? raw : 'xp';
  const courseId = field(formData, 'course_id') || null;
  const target = kind === 'curso' ? 1 : positive(field(formData, 'target'));
  if (!title || !target || (kind === 'curso' && !courseId)) redirect('/dashboard/cursos/retos?error=datos');
  const endsRaw = field(formData, 'ends_at');
  const ends = endsRaw ? new Date(`${endsRaw}T23:59:59-06:00`).toISOString() : null;
  const bonus = positive(field(formData, 'bonus_xp')) || 0;
  const id = field(formData, 'id');
  const sql = await crm();
  if (id) {
    await sql`
      UPDATE lms_challenges SET title = ${title}, description = ${field(formData, 'description')}, kind = ${kind},
        target = ${target}, course_id = ${courseId}, bonus_xp = ${bonus}, ends_at = ${ends},
        active = ${field(formData, 'active') === '1'}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO lms_challenges (id, title, description, kind, target, course_id, bonus_xp, ends_at)
      VALUES (${crypto.randomUUID()}, ${title}, ${field(formData, 'description')}, ${kind}, ${target}, ${courseId}, ${bonus}, ${ends})
    `;
  }
  refresh();
  redirect('/dashboard/cursos/retos');
}

export async function deleteChallenge(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM lms_challenges WHERE id = ${id}`;
  refresh();
}

export async function enrollPerson(formData: FormData) {
  await requireDashboard('contenido');
  const courseId = field(formData, 'course_id');
  const personId = field(formData, 'person_id');
  if (!courseId || !personId) return;
  const sql = await crm();
  await sql`
    INSERT INTO lms_enrollments (id, course_id, person_id, manual_access)
    SELECT ${crypto.randomUUID()}, ${courseId}, id, true FROM valux_people WHERE id = ${personId}
    ON CONFLICT (course_id, person_id) WHERE person_id IS NOT NULL DO UPDATE SET manual_access = true
  `;
  refresh();
}

export async function enrollContact(formData: FormData) {
  await requireDashboard('contenido');
  const courseId = field(formData, 'course_id');
  const contactId = field(formData, 'contact_id');
  if (!courseId || !contactId) return;
  const sql = await crm();
  const [, [result]] = await sql.transaction((tx) => [tx`SELECT id FROM contacts WHERE id = ${contactId} FOR UPDATE`, tx`
    WITH contact AS (
      SELECT id, lower(btrim(email)) AS email, COALESCE(NULLIF(btrim(name), ''), lower(btrim(email))) AS name
      FROM contacts WHERE id = ${contactId} AND lower(btrim(email)) ~ '^[^[:space:]@]+@[^[:space:]@]+$'
    ), conflict AS (
      SELECT FROM lms_enrollments e JOIN valux_people p ON p.id = e.person_id CROSS JOIN contact
      WHERE e.course_id = ${courseId} AND e.contact_id = contact.id AND p.email <> contact.email
    ), learner AS (
      INSERT INTO valux_people (id, name, email)
      SELECT ${crypto.randomUUID()}, name, email FROM contact WHERE NOT EXISTS (SELECT FROM conflict)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    ), enrolled AS (
    INSERT INTO lms_enrollments (id, course_id, person_id, contact_id, manual_access)
    SELECT ${crypto.randomUUID()}, ${courseId}, learner.id, contact.id, true FROM learner CROSS JOIN contact
    ON CONFLICT (course_id, person_id) WHERE person_id IS NOT NULL DO UPDATE SET
      manual_access = true, contact_id = COALESCE(lms_enrollments.contact_id, EXCLUDED.contact_id)
    RETURNING id
    )
    SELECT EXISTS (SELECT FROM enrolled) AS enrolled, EXISTS (SELECT FROM conflict) AS conflict
  `]);
  if (result.conflict) redirect(`/dashboard/cursos/${courseId}?error=identidad-contacto`);
  if (!result.enrolled) redirect(`/dashboard/cursos/${courseId}?error=correo-contacto`);
  refresh();
}

export async function removeEnrollment(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  // Quitar una matrícula manual no revoca un curso con una venta vigente.
  await sql.transaction((tx) => [tx`
    SELECT pg_advisory_xact_lock(hashtextextended('academia:curso:' || course_id || ':' || person_id, 0))
    FROM lms_enrollments WHERE id = ${id} AND person_id IS NOT NULL
  `, tx`
    WITH retained AS (
      UPDATE lms_enrollments e SET manual_access = false, contact_id = NULL
      WHERE e.id = ${id} AND EXISTS (
        SELECT FROM valux_sales s WHERE s.buyer_id = e.person_id AND s.course_id = e.course_id AND s.refunded_at IS NULL
      )
      RETURNING e.id
    )
    DELETE FROM lms_enrollments WHERE id = ${id} AND NOT EXISTS (SELECT FROM retained)
  `]);
  refresh();
}

export async function saveFinalGrade(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`
    UPDATE lms_enrollments
    SET final_grade = ${grade(field(formData, 'final_grade'))}, notes = ${field(formData, 'notes') || null}
    WHERE id = ${id}
  `;
  refresh();
}

export async function saveLessonScore(formData: FormData) {
  const contactId = field(formData, 'contact_id');
  const submittedPersonId = field(formData, 'person_id');
  const lessonId = field(formData, 'lesson_id');
  if (!lessonId || (!contactId && !submittedPersonId)) return;
  const courseId = await lessonCourse(lessonId);
  await requireCourseEditor(courseId);
  const score = grade(field(formData, 'score'));
  const when = score == null ? null : new Date().toISOString();
  const sql = await crm();
  const [enrollment] = await sql`
    SELECT e.person_id FROM lms_enrollments e JOIN lms_lessons l ON l.course_id = e.course_id
    WHERE e.course_id = ${courseId} AND l.id = ${lessonId} AND btrim(l.mission) = ''
      AND ((${submittedPersonId} <> '' AND e.person_id = ${submittedPersonId})
        OR (${submittedPersonId} = '' AND e.contact_id = ${contactId}))
  `;
  if (!enrollment) return;
  const personId = enrollment.person_id ? String(enrollment.person_id) : '';
  if (personId) {
    await sql`
      INSERT INTO lms_progress (id, person_id, lesson_id, score, graded_at, completed_at)
      VALUES (${crypto.randomUUID()}, ${personId}, ${lessonId}, ${score}, ${when}, ${when})
      ON CONFLICT (person_id, lesson_id) WHERE person_id IS NOT NULL DO UPDATE SET
        score = EXCLUDED.score,
        graded_at = EXCLUDED.graded_at,
        completed_at = COALESCE(lms_progress.completed_at, EXCLUDED.completed_at)
    `;
  } else {
    await sql`
      INSERT INTO lms_progress (id, contact_id, lesson_id, score, graded_at, completed_at)
      VALUES (${crypto.randomUUID()}, ${contactId}, ${lessonId}, ${score}, ${when}, ${when})
      ON CONFLICT (contact_id, lesson_id) DO UPDATE SET
        score = EXCLUDED.score,
        graded_at = EXCLUDED.graded_at,
        completed_at = COALESCE(lms_progress.completed_at, EXCLUDED.completed_at)
    `;
  }
  refresh();
}
