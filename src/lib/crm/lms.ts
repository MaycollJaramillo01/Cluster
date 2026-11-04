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
  };
}

export async function listCourses() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.*,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
      (SELECT count(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS students
    FROM lms_courses c
    ORDER BY c.created_at DESC
  `;
  return rows.map((row) => mapCourse(row as Record<string, unknown>));
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
    SELECT id, course_id, slug, title, content, video_url, points, duration_min, section_id, sort_order
    FROM lms_lessons
    WHERE course_id = ${id}
    ORDER BY sort_order, title
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
    SELECT id, course_id, slug, title, content, video_url, points, duration_min, section_id, sort_order
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
    ...mapLesson(entry),
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
