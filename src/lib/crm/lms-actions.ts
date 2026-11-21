'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { storedFile } from '@/lib/valux/upload';
import { crm } from './db';
import { requireCourseEditor } from './course-access';
import { requireDashboard } from './session';
import { FEATURED_KEY } from '@/lib/valux/catalog';

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

// El profesor pide revisión y el superadmin publica desde la ficha del curso.
export async function requestReview(formData: FormData) {
  const courseId = field(formData, 'course_id');
  if (!courseId) return;
  await requireCourseEditor(courseId);
  const sql = await crm();
  await sql`UPDATE lms_courses SET review_requested_at = now() WHERE id = ${courseId}`;
  refresh();
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

async function uniqueLessonSlug(courseId: string, title: string) {
  const sql = await crm();
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while ((await sql`SELECT id FROM lms_lessons WHERE course_id = ${courseId} AND slug = ${slug}`).length) {
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
  if (!title || !description) redirect(teacherDraft ? '/dashboard/profesor?error=curso' : '/dashboard/cursos?error=curso');
  const sql = await crm();
  const id = crypto.randomUUID();
  const slug = await uniqueCourseSlug(title);
  const publish = session.role === 'superadmin' && field(formData, 'published') === 'on';
  if (teacherDraft) {
    await sql`
      WITH teacher AS (
        INSERT INTO valux_people (id, name, email, role)
        VALUES (${crypto.randomUUID()}, ${session.name}, ${session.email}, 'profesor')
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
      )
      INSERT INTO lms_courses (id, slug, title, description, teacher_id)
      SELECT ${id}, ${slug}, ${title}, ${description}, id FROM teacher
    `;
    refresh();
    redirect(`/dashboard/cursos/${id}`);
  }
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    INSERT INTO lms_courses (id, slug, title, description, price_cents, published, cover_url, teacher_id)
    VALUES (
      ${id}, ${slug}, ${title}, ${description}, ${cents(formData, 'price')},
      ${publish}, ${cover}, ${field(formData, 'teacher_id') || null}
    )
  `;
  const video = field(formData, 'video_url');
  if (video) {
    await sql`
      INSERT INTO lms_lessons (id, course_id, slug, title, content, video_url, sort_order)
      VALUES (${crypto.randomUUID()}, ${id}, 'introduccion', 'Introducción', 'Primera lección del curso.', ${video}, 1)
    `;
  }
  refresh();
  redirect(`/dashboard/cursos/${id}`);
}

export async function setCoursePublication(formData: FormData) {
  await requireDashboard();
  const id = field(formData, 'id');
  const state = field(formData, 'publication');
  if (!id || (state !== 'publish' && state !== 'draft')) return;
  const sql = await crm();
  await sql`UPDATE lms_courses SET published = ${state === 'publish'}, review_requested_at = NULL WHERE id = ${id}`;
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
  const sql = await crm();
  const orderRows = await sql`
    SELECT COALESCE(max(sort_order), 0) AS n FROM lms_lessons WHERE course_id = ${courseId}
  `;
  const next = Number((orderRows[0] as { n?: unknown } | undefined)?.n || 0) + 1;
  const points = positive(field(formData, 'points')) || 10;
  await sql`
    INSERT INTO lms_lessons (id, course_id, section_id, slug, title, content, video_url, points, duration_min, sort_order)
    VALUES (
      ${crypto.randomUUID()}, ${courseId}, ${field(formData, 'section_id') || null},
      ${await uniqueLessonSlug(courseId, title)}, ${title},
      ${field(formData, 'content')}, ${field(formData, 'video_url') || null},
      ${points}, ${positive(field(formData, 'duration_min'))}, ${next}
    )
  `;
  refresh();
}

export async function updateLesson(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!id || !courseId || !title) return;
  await requireCourseEditor(courseId);
  const sql = await crm();
  const points = positive(field(formData, 'points')) || 10;
  await sql`
    UPDATE lms_lessons
    SET title = ${title},
      content = ${field(formData, 'content')},
      video_url = ${field(formData, 'video_url') || null},
      section_id = ${field(formData, 'section_id') || null},
      points = ${points},
      duration_min = ${positive(field(formData, 'duration_min'))},
      mission = ${String(formData.get('mission') ?? '')}
    WHERE id = ${id} AND course_id = ${courseId}
  `;
  refresh();
  redirect(`/dashboard/cursos/${courseId}`);
}

export async function deleteLesson(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  if (!id || !courseId) return;
  await requireCourseEditor(courseId);
  const sql = await crm();
  await sql`DELETE FROM lms_lessons WHERE id = ${id} AND course_id = ${courseId}`;
  refresh();
  if (courseId) redirect(`/dashboard/cursos/${courseId}`);
}

export async function updateCourseMeta(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    UPDATE lms_courses
    SET cover_url = ${cover},
      teacher_id = ${field(formData, 'teacher_id') || null},
      description = ${field(formData, 'description')},
      price_cents = ${cents(formData, 'price')},
      plan_level = ${Math.max(0, Math.min(3, Math.round(Number(field(formData, 'plan_level')) || 0)))},
      bump_course_id = ${field(formData, 'bump_course_id') || null},
      bump_cents = ${cents(formData, 'bump_price')},
      upsell_course_id = ${field(formData, 'upsell_course_id') || null},
      upsell_cents = ${cents(formData, 'upsell_price')}
    WHERE id = ${id}
  `;
  refresh();
}

export async function createSection(formData: FormData) {
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!courseId || !title) return;
  await requireCourseEditor(courseId);
  const sql = await crm();
  const orderRows = await sql`SELECT COALESCE(max(sort_order), 0) AS n FROM lms_sections WHERE course_id = ${courseId}`;
  const next = Number((orderRows[0] as { n?: unknown } | undefined)?.n || 0) + 1;
  await sql`
    INSERT INTO lms_sections (id, course_id, title, sort_order)
    VALUES (${crypto.randomUUID()}, ${courseId}, ${title}, ${next})
  `;
  refresh();
}

export async function deleteSection(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  if (!id || !courseId) return;
  await requireCourseEditor(courseId);
  const sql = await crm();
  const gone = await sql`DELETE FROM lms_sections WHERE id = ${id} AND course_id = ${courseId} RETURNING id`;
  if (gone.length) await sql`UPDATE lms_lessons SET section_id = NULL WHERE section_id = ${id}`;
  refresh();
}

export async function createResource(formData: FormData) {
  const lessonId = field(formData, 'lesson_id');
  const title = field(formData, 'title');
  const kind = field(formData, 'kind') || 'enlace';
  if (!lessonId || !title) return;
  await requireCourseEditor(await lessonCourse(lessonId));
  const allowed = ['video', 'pdf', 'imagen', 'enlace', 'texto'];
  const sql = await crm();
  const url = await storedFile(formData, 'file', 'url');
  await sql`
    INSERT INTO lms_resources (id, lesson_id, kind, title, url, content, sort_order)
    VALUES (
      ${crypto.randomUUID()}, ${lessonId}, ${allowed.includes(kind) ? kind : 'enlace'}, ${title},
      ${url}, ${field(formData, 'content') || null}, 0
    )
  `;
  refresh();
}

export async function deleteResource(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const owner = await sql`SELECT lesson_id FROM lms_resources WHERE id = ${id}`;
  await requireCourseEditor(await lessonCourse(String((owner[0] as { lesson_id?: string } | undefined)?.lesson_id || '')));
  await sql`DELETE FROM lms_resources WHERE id = ${id}`;
  refresh();
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
  const existing = await sql`
    SELECT id FROM lms_enrollments WHERE course_id = ${courseId} AND person_id = ${personId}
  `;
  if (!existing.length) {
    await sql`
      INSERT INTO lms_enrollments (id, course_id, person_id)
      VALUES (${crypto.randomUUID()}, ${courseId}, ${personId})
    `;
  }
  refresh();
}

export async function enrollContact(formData: FormData) {
  await requireDashboard('contenido');
  const courseId = field(formData, 'course_id');
  const contactId = field(formData, 'contact_id');
  if (!courseId || !contactId) return;
  const sql = await crm();
  await sql`
    INSERT INTO lms_enrollments (id, course_id, contact_id)
    VALUES (${crypto.randomUUID()}, ${courseId}, ${contactId})
    ON CONFLICT (course_id, contact_id) DO NOTHING
  `;
  refresh();
}

export async function removeEnrollment(formData: FormData) {
  await requireDashboard('contenido');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM lms_enrollments WHERE id = ${id}`;
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
  const personId = field(formData, 'person_id');
  const lessonId = field(formData, 'lesson_id');
  if (!lessonId || (!contactId && !personId)) return;
  await requireCourseEditor(await lessonCourse(lessonId));
  const score = grade(field(formData, 'score'));
  const when = score == null ? null : new Date().toISOString();
  const sql = await crm();
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
