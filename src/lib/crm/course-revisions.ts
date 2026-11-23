import { crm } from './db';

export async function findCourseRevision(courseId: string) {
  const sql = await crm();
  const [row] = await sql`SELECT d.id, d.review_requested_at, d.teacher_id IS NOT DISTINCT FROM c.teacher_id AS same_owner
    FROM lms_courses d JOIN lms_courses c ON c.id = d.revision_of WHERE c.id = ${courseId}`;
  return row ? { id: String(row.id), pending: Boolean(row.review_requested_at), sameOwner: Boolean(row.same_owner) } : null;
}

export async function createCourseRevision(courseId: string, teacherId: string | null) {
  const sql = await crm();
  const draftId = crypto.randomUUID();
  const [, rows] = await sql.transaction((tx) => [
    tx`SELECT id FROM lms_courses WHERE id = ${courseId} FOR UPDATE`,
    tx`WITH draft AS (
        INSERT INTO lms_courses (id, slug, title, description, price_cents, cover_url, teacher_id, plan_level,
          learning_outcomes, audience, prerequisites, revision_of, revision_base_version)
        SELECT ${draftId}, ${`borrador-${draftId}`}, title, description, price_cents, cover_url, teacher_id, plan_level,
          learning_outcomes, audience, prerequisites, id, authoring_version
        FROM lms_courses WHERE id = ${courseId} AND published AND revision_of IS NULL
          AND (${teacherId}::text IS NULL OR teacher_id = ${teacherId})
        ON CONFLICT (revision_of) WHERE revision_of IS NOT NULL DO NOTHING RETURNING id
      ), sections AS (
        INSERT INTO lms_sections (id, course_id, title, sort_order, source_id)
        SELECT md5('copy-section:' || draft.id || ':' || s.id), draft.id, s.title, s.sort_order, s.id
        FROM draft CROSS JOIN lms_sections s WHERE s.course_id = ${courseId} RETURNING id, source_id
      ), lessons AS (
        INSERT INTO lms_lessons (id, course_id, section_id, slug, title, content, video_url, points, duration_min,
          sort_order, mission, preview_public, source_id)
        SELECT md5('copy-lesson:' || draft.id || ':' || l.id), draft.id, sections.id, l.slug, l.title, l.content, l.video_url, l.points,
          l.duration_min, l.sort_order, l.mission, l.preview_public, l.id
        FROM draft CROSS JOIN lms_lessons l LEFT JOIN sections ON sections.source_id = l.section_id
        WHERE l.course_id = ${courseId} RETURNING id, source_id
      ), materials AS (
        INSERT INTO lms_resources (id, lesson_id, kind, title, url, content, sort_order, source_id)
        SELECT md5('copy-resource:' || l.id || ':' || r.id), l.id, r.kind, r.title, r.url, r.content, r.sort_order, r.id
        FROM lessons l JOIN lms_resources r ON r.lesson_id = l.source_id
      )
      SELECT id FROM draft UNION ALL SELECT d.id FROM lms_courses d JOIN lms_courses c ON c.id = d.revision_of
      WHERE c.id = ${courseId} AND c.published
        AND (${teacherId}::text IS NULL OR (c.teacher_id = ${teacherId} AND d.teacher_id = ${teacherId}))`,
  ]);
  return rows[0] ? String(rows[0].id) : '';
}

export async function publishCourseRevision(draftId: string, courseId: string, version: number) {
  const sql = await crm();
  const results = await sql.transaction((tx) => {
    const valid = tx`EXISTS (SELECT FROM lms_courses d JOIN lms_courses c ON c.id = d.revision_of
      WHERE d.id = ${draftId} AND c.id = ${courseId} AND c.published AND NOT d.published
        AND d.review_requested_at IS NOT NULL AND d.authoring_version = ${version}
        AND c.authoring_version = d.revision_base_version AND c.teacher_id IS NOT DISTINCT FROM d.teacher_id
        AND NOT EXISTS (SELECT FROM lms_lessons live WHERE live.course_id = c.id
          AND NOT EXISTS (SELECT FROM lms_lessons copy WHERE copy.course_id = d.id
            AND COALESCE(copy.source_id, md5('revision-lesson:' || copy.id)) = live.id)))`;
    return [
      tx`SELECT id FROM lms_courses WHERE id IN (${courseId}, ${draftId}) ORDER BY id FOR UPDATE`,
      tx`INSERT INTO lms_sections (id, course_id, title, sort_order)
        SELECT COALESCE(s.source_id, md5('revision-section:' || s.id)), ${courseId}, s.title, s.sort_order
        FROM lms_sections s WHERE s.course_id = ${draftId} AND ${valid}
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, sort_order = EXCLUDED.sort_order`,
      tx`INSERT INTO lms_lessons (id, course_id, section_id, slug, title, content, video_url, points, duration_min, sort_order, mission, preview_public)
        SELECT COALESCE(l.source_id, md5('revision-lesson:' || l.id)), ${courseId},
          COALESCE(s.source_id, md5('revision-section:' || s.id)), l.slug, l.title, l.content, l.video_url,
          l.points, l.duration_min, l.sort_order, l.mission, l.preview_public
        FROM lms_lessons l LEFT JOIN lms_sections s ON s.id = l.section_id AND s.course_id = l.course_id
        WHERE l.course_id = ${draftId} AND ${valid}
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, video_url = EXCLUDED.video_url,
          points = EXCLUDED.points, duration_min = EXCLUDED.duration_min, sort_order = EXCLUDED.sort_order,
          mission = EXCLUDED.mission, section_id = EXCLUDED.section_id, preview_public = EXCLUDED.preview_public`,
      tx`INSERT INTO lms_resources (id, lesson_id, kind, title, url, content, sort_order)
        SELECT COALESCE(r.source_id, md5('revision-resource:' || r.id)), COALESCE(l.source_id, md5('revision-lesson:' || l.id)),
          r.kind, r.title, r.url, r.content, r.sort_order
        FROM lms_resources r JOIN lms_lessons l ON l.id = r.lesson_id WHERE l.course_id = ${draftId} AND ${valid}
        ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, title = EXCLUDED.title, url = EXCLUDED.url,
          content = EXCLUDED.content, sort_order = EXCLUDED.sort_order`,
      tx`DELETE FROM lms_resources r USING lms_lessons l WHERE r.lesson_id = l.id AND l.course_id = ${courseId} AND ${valid}
        AND NOT EXISTS (SELECT FROM lms_resources copy JOIN lms_lessons dl ON dl.id = copy.lesson_id
          WHERE dl.course_id = ${draftId} AND COALESCE(copy.source_id, md5('revision-resource:' || copy.id)) = r.id)`,
      tx`DELETE FROM lms_sections s WHERE s.course_id = ${courseId} AND ${valid}
        AND NOT EXISTS (SELECT FROM lms_sections copy WHERE copy.course_id = ${draftId}
          AND COALESCE(copy.source_id, md5('revision-section:' || copy.id)) = s.id)`,
      tx`WITH updated AS (
          UPDATE lms_courses live SET title = draft.title, description = draft.description, cover_url = draft.cover_url,
            learning_outcomes = draft.learning_outcomes, audience = draft.audience, prerequisites = draft.prerequisites,
            authoring_version = live.authoring_version + 1
          FROM lms_courses draft WHERE live.id = ${courseId} AND draft.id = ${draftId} AND ${valid} RETURNING live.id
        ), discard AS (
          DELETE FROM lms_courses WHERE id = ${draftId} AND EXISTS (SELECT FROM updated)
        ) SELECT id FROM updated`,
    ];
  });
  return Boolean(results.at(-1)?.length);
}
