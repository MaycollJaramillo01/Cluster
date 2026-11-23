import type { Sql } from './db';

// Conserva las notas y el avance cuando una misma persona estaba matriculada
// por separado como contacto del CRM y como alumna de la Academia.
export async function migrateCrmEnrollments(sql: Sql) {
  await sql.query(`
    DO $$
    DECLARE
      legacy record;
      mark record;
      learner text;
      canonical text;
    BEGIN
      IF EXISTS (SELECT 1 FROM crm_meta WHERE key = 'lms_contact_identity_v1') THEN RETURN; END IF;
      PERFORM pg_advisory_xact_lock(hashtext('lms_contact_identity_v1'));
      IF EXISTS (SELECT 1 FROM crm_meta WHERE key = 'lms_contact_identity_v1') THEN RETURN; END IF;
      LOCK TABLE lms_enrollments, lms_progress IN SHARE ROW EXCLUSIVE MODE;

      ALTER TABLE lms_enrollments DROP CONSTRAINT IF EXISTS lms_enrollments_contact_id_fkey;
      ALTER TABLE lms_enrollments ADD CONSTRAINT lms_enrollments_contact_id_fkey
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
      ALTER TABLE lms_progress DROP CONSTRAINT IF EXISTS lms_progress_contact_id_fkey;
      ALTER TABLE lms_progress ADD CONSTRAINT lms_progress_contact_id_fkey
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

      UPDATE lms_enrollments e SET manual_access = true
      WHERE e.person_id IS NOT NULL AND NOT e.manual_access
        AND NOT EXISTS (
          SELECT FROM valux_sales s WHERE s.course_id = e.course_id AND s.buyer_id = e.person_id
            AND s.created_at <= e.created_at
        );

      FOR legacy IN
        SELECT e.*, lower(btrim(c.email)) AS email, c.name
        FROM lms_enrollments e JOIN contacts c ON c.id = e.contact_id
        WHERE e.person_id IS NULL AND lower(btrim(c.email)) ~ '^[^[:space:]@]+@[^[:space:]@]+$'
        ORDER BY e.created_at, e.id
      LOOP
        INSERT INTO valux_people (id, name, email)
        VALUES (gen_random_uuid()::text, COALESCE(NULLIF(btrim(legacy.name), ''), legacy.email), legacy.email)
        ON CONFLICT (email) DO NOTHING;
        SELECT id INTO learner FROM valux_people WHERE email = legacy.email;
        SELECT id INTO canonical FROM lms_enrollments WHERE course_id = legacy.course_id AND person_id = learner;
        IF canonical IS NULL THEN
          UPDATE lms_enrollments SET person_id = learner, manual_access = true WHERE id = legacy.id;
        ELSE
          DELETE FROM lms_enrollments WHERE id = legacy.id;
          UPDATE lms_enrollments SET
            contact_id = COALESCE(contact_id, legacy.contact_id), manual_access = true,
            final_grade = COALESCE(final_grade, legacy.final_grade),
            notes = CASE WHEN notes IS NULL OR notes = '' THEN legacy.notes
              WHEN legacy.notes IS NULL OR legacy.notes = '' OR legacy.notes = notes THEN notes
              ELSE notes || chr(10) || legacy.notes END,
            created_at = LEAST(created_at, legacy.created_at)
          WHERE id = canonical;
        END IF;

        FOR mark IN
          SELECT p.* FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
          WHERE p.contact_id = legacy.contact_id AND p.person_id IS NULL AND l.course_id = legacy.course_id
        LOOP
          INSERT INTO lms_progress (id, lesson_id, person_id, score, completed_at, graded_at)
          VALUES (gen_random_uuid()::text, mark.lesson_id, learner, mark.score, mark.completed_at, mark.graded_at)
          ON CONFLICT (person_id, lesson_id) WHERE person_id IS NOT NULL DO UPDATE SET
            completed_at = LEAST(lms_progress.completed_at, EXCLUDED.completed_at),
            score = CASE WHEN EXCLUDED.graded_at >= lms_progress.graded_at OR lms_progress.graded_at IS NULL
              THEN COALESCE(EXCLUDED.score, lms_progress.score) ELSE lms_progress.score END,
            graded_at = GREATEST(lms_progress.graded_at, EXCLUDED.graded_at);
          DELETE FROM lms_progress WHERE id = mark.id;
        END LOOP;
      END LOOP;
      INSERT INTO crm_meta (key, value) VALUES ('lms_contact_identity_v1', 'done');
    END $$;
  `);
}
