'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { storedFile } from '@/lib/valux/upload';
import { crm } from './db';

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
  const title = field(formData, 'title');
  const description = field(formData, 'description');
  if (!title || !description) return;
  const sql = await crm();
  const id = crypto.randomUUID();
  const slug = await uniqueCourseSlug(title);
  const publish = field(formData, 'published') === 'on' ? 'si' : 'no';
  const teacher = field(formData, 'teacher_id') || null;
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    INSERT INTO lms_courses (id, slug, title, description, price_cents, published, cover_url, teacher_id)
    VALUES (
      ${id}, ${slug}, ${title}, ${description}, ${cents(formData, 'price')},
      CASE WHEN ${publish} = 'si' THEN true ELSE false END,
      ${cover}, ${teacher}
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

export async function toggleCourse(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE lms_courses SET published = NOT published WHERE id = ${id}`;
  refresh();
}

export async function deleteCourse(formData: FormData) {
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
  const sql = await crm();
  const points = positive(field(formData, 'points')) || 10;
  await sql`
    UPDATE lms_lessons
    SET title = ${title},
      content = ${field(formData, 'content')},
      video_url = ${field(formData, 'video_url') || null},
      section_id = ${field(formData, 'section_id') || null},
      points = ${points},
      duration_min = ${positive(field(formData, 'duration_min'))}
    WHERE id = ${id} AND course_id = ${courseId}
  `;
  refresh();
  redirect(`/dashboard/cursos/${courseId}`);
}

export async function deleteLesson(formData: FormData) {
  const id = field(formData, 'id');
  const courseId = field(formData, 'course_id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM lms_lessons WHERE id = ${id}`;
  refresh();
  if (courseId) redirect(`/dashboard/cursos/${courseId}`);
}

export async function updateCourseMeta(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    UPDATE lms_courses
    SET cover_url = ${cover},
      teacher_id = ${field(formData, 'teacher_id') || null},
      description = ${field(formData, 'description')},
      price_cents = ${cents(formData, 'price')}
    WHERE id = ${id}
  `;
  refresh();
}

export async function createSection(formData: FormData) {
  const courseId = field(formData, 'course_id');
  const title = field(formData, 'title');
  if (!courseId || !title) return;
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
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE lms_lessons SET section_id = NULL WHERE section_id = ${id}`;
  await sql`DELETE FROM lms_sections WHERE id = ${id}`;
  refresh();
}

export async function createResource(formData: FormData) {
  const lessonId = field(formData, 'lesson_id');
  const title = field(formData, 'title');
  const kind = field(formData, 'kind') || 'enlace';
  if (!lessonId || !title) return;
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
  await sql`DELETE FROM lms_resources WHERE id = ${id}`;
  refresh();
}

export async function enrollPerson(formData: FormData) {
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
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM lms_enrollments WHERE id = ${id}`;
  refresh();
}

export async function saveFinalGrade(formData: FormData) {
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
