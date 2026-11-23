import { crm } from './db';

export type LmsCourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  published: boolean;
  cover_url: string | null;
  teacher_id: string | null;
  created_at: string;
  lessons: number;
  students: number;
  plan_level: number;
  bump_course_id: string | null;
  bump_cents: number;
  upsell_course_id: string | null;
  upsell_cents: number;
  review_requested_at: string | null;
  review_feedback: string;
  learning_outcomes: string;
  audience: string;
  prerequisites: string;
  authoring_version: number;
  revision_of: string | null;
};

export type LmsSection = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
};

export type LmsResource = {
  id: string;
  lesson_id: string;
  kind: string;
  title: string;
  url: string | null;
  content: string | null;
  sort_order: number;
};

export type LmsLesson = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  content: string;
  video_url: string | null;
  points: number;
  duration_min: number | null;
  section_id: string | null;
  sort_order: number;
  mission: string;
  resources_count: number;
  preview_public: boolean;
  source_id: string | null;
};

export type LmsEnrollment = {
  id: string;
  course_id: string;
  contact_id: string;
  person_id: string | null;
  contact_name: string;
  email: string;
  final_grade: number | null;
  notes: string | null;
  created_at: string;
};

export type LmsProgress = {
  contact_id: string;
  person_id: string | null;
  lesson_id: string;
  score: number | null;
  completed_at: string | null;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown) {
  return value == null ? '' : String(value);
}

function bool(value: unknown) {
  return value === true || value === 't' || value === 'true';
}

function mapCourse(row: Record<string, unknown>): LmsCourseRow {
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    description: text(row.description),
    price_cents: num(row.price_cents),
    published: bool(row.published),
    cover_url: row.cover_url == null ? null : text(row.cover_url),
    teacher_id: row.teacher_id == null ? null : text(row.teacher_id),
    created_at: text(row.created_at),
    lessons: num(row.lessons),
    students: num(row.students),
    plan_level: row.plan_level == null ? 1 : num(row.plan_level),
    bump_course_id: row.bump_course_id ? text(row.bump_course_id) : null,
    bump_cents: num(row.bump_cents),
    upsell_course_id: row.upsell_course_id ? text(row.upsell_course_id) : null,
    upsell_cents: num(row.upsell_cents),
    review_requested_at: row.review_requested_at ? text(row.review_requested_at) : null,
    review_feedback: text(row.review_feedback),
    learning_outcomes: text(row.learning_outcomes),
    audience: text(row.audience),
    prerequisites: text(row.prerequisites),
    authoring_version: num(row.authoring_version),
    revision_of: row.revision_of ? text(row.revision_of) : null,
  };
}

export async function listCourses() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.*,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
      (SELECT count(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS students
    FROM lms_courses c
    WHERE c.revision_of IS NULL
    ORDER BY c.created_at DESC
  `;
  return rows.map((row) => mapCourse(row as Record<string, unknown>));
}

export async function listCourseReviewRequests() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.title, c.review_requested_at, c.revision_of, COALESCE(v.name, '') AS teacher_name,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons
    FROM lms_courses c LEFT JOIN valux_people v ON v.id = c.teacher_id
    WHERE c.review_requested_at IS NOT NULL AND NOT c.published
    ORDER BY c.review_requested_at, c.id
  `;
  return rows.map((row) => ({ id: text(row.id), title: text(row.title), teacher: text(row.teacher_name), requestedAt: text(row.review_requested_at), lessons: num(row.lessons), revision: Boolean(row.revision_of) }));
}

export async function getCourse(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT c.*,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
      (SELECT count(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS students
    FROM lms_courses c
    WHERE c.id = ${id}
  `;
  const course = rows[0] ? mapCourse(rows[0] as Record<string, unknown>) : null;
  if (!course) return null;

  const sections = await sql`
    SELECT id, course_id, title, sort_order
    FROM lms_sections
    WHERE course_id = ${id}
    ORDER BY sort_order, title
  `;
  const lessons = await sql`
    SELECT l.*, (SELECT count(*) FROM lms_resources r WHERE r.lesson_id = l.id
      AND (btrim(COALESCE(r.url, '')) <> '' OR btrim(COALESCE(r.content, '')) <> '')) AS resources_count
    FROM lms_lessons l
    WHERE l.course_id = ${id}
    ORDER BY l.sort_order, l.title, l.id
  `;
  const enrollments = await sql`
    SELECT e.id, e.course_id, e.contact_id, e.person_id,
      COALESCE(p.name, v.name, '') AS contact_name,
      COALESCE(p.email, v.email, '') AS email,
      e.final_grade, e.notes, e.created_at
    FROM lms_enrollments e
    LEFT JOIN contacts p ON p.id = e.contact_id
    LEFT JOIN valux_people v ON v.id = e.person_id
    WHERE e.course_id = ${id}
    ORDER BY e.created_at
  `;
  const progress = await sql`
    SELECT g.contact_id, g.person_id, g.lesson_id, g.score, g.completed_at
    FROM lms_progress g
    JOIN lms_lessons l ON l.id = g.lesson_id
    WHERE l.course_id = ${id}
  `;

  return {
    course,
    sections: sections.map((row) => mapSection(row as Record<string, unknown>)),
    lessons: lessons.map((row) => mapLesson(row as Record<string, unknown>)),
    enrollments: enrollments.map((row) => {
      const entry = row as Record<string, unknown>;
      return {
        id: text(entry.id),
        course_id: text(entry.course_id),
        contact_id: entry.contact_id == null ? '' : text(entry.contact_id),
        person_id: entry.person_id == null ? null : text(entry.person_id),
        contact_name: text(entry.contact_name),
        email: text(entry.email),
        final_grade: entry.final_grade == null ? null : num(entry.final_grade),
        notes: entry.notes == null ? null : text(entry.notes),
        created_at: text(entry.created_at),
      } satisfies LmsEnrollment;
    }),
    progress: progress.map((row) => {
      const entry = row as Record<string, unknown>;
      return {
        contact_id: entry.contact_id == null ? '' : text(entry.contact_id),
        person_id: entry.person_id == null ? null : text(entry.person_id),
        lesson_id: text(entry.lesson_id),
        score: entry.score == null ? null : num(entry.score),
        completed_at: entry.completed_at == null ? null : text(entry.completed_at),
      } satisfies LmsProgress;
    }),
  };
}

export async function getLesson(courseId: string, lessonId: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, course_id, slug, title, content, video_url, points, duration_min, section_id, sort_order, mission, preview_public, source_id
    FROM lms_lessons
    WHERE id = ${lessonId} AND course_id = ${courseId}
  `;
  const entry = rows[0] as Record<string, unknown> | undefined;
  if (!entry) return null;
  const resources = await sql`
    SELECT id, lesson_id, kind, title, url, content, sort_order
    FROM lms_resources
    WHERE lesson_id = ${lessonId}
    ORDER BY sort_order, title
  `;
  return {
    ...mapLesson({ ...entry, resources_count: resources.length }),
    resources: resources.map((row) => mapResource(row as Record<string, unknown>)),
  };
}

function mapSection(entry: Record<string, unknown>): LmsSection {
  return {
    id: text(entry.id),
    course_id: text(entry.course_id),
    title: text(entry.title),
    sort_order: num(entry.sort_order),
  };
}

function mapLesson(entry: Record<string, unknown>): LmsLesson {
  return {
    id: text(entry.id),
    course_id: text(entry.course_id),
    slug: text(entry.slug),
    title: text(entry.title),
    content: text(entry.content),
    video_url: entry.video_url == null ? null : text(entry.video_url),
    points: num(entry.points),
    duration_min: entry.duration_min == null ? null : num(entry.duration_min),
    section_id: entry.section_id == null ? null : text(entry.section_id),
    sort_order: num(entry.sort_order),
    mission: text(entry.mission),
    resources_count: num(entry.resources_count),
    preview_public: bool(entry.preview_public),
    source_id: entry.source_id ? text(entry.source_id) : null,
  };
}

function mapResource(entry: Record<string, unknown>): LmsResource {
  return {
    id: text(entry.id),
    lesson_id: text(entry.lesson_id),
    kind: text(entry.kind),
    title: text(entry.title),
    url: entry.url == null ? null : text(entry.url),
    content: entry.content == null ? null : text(entry.content),
    sort_order: num(entry.sort_order),
  };
}
