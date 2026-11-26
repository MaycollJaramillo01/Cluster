import { crm } from '@/lib/crm/db';
import { canReadCourse, getPerson } from './data';

export const certificatesPath = '/academia/constancias';
export function publicCertificatePath(code: string) {
  return `${certificatesPath}/verificar/${code}`;
}

export function isCertificateCode(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export type Certificate = {
  id: string;
  course_title: string;
  student_name: string;
  lesson_count: number;
  completed_at: string;
  issued_at: string;
  share_code: string | null;
};

export async function listCertificates(personId: string) {
  if (!personId) return [];
  const sql = await crm();
  const rows = await sql`SELECT id, course_title, lesson_count, completed_at, issued_at, share_code IS NOT NULL AS shared FROM lms_course_certificates
    WHERE person_id = ${personId} ORDER BY issued_at DESC, id`;
  return rows as (Pick<Certificate, 'id' | 'course_title' | 'lesson_count' | 'completed_at' | 'issued_at'> & { shared: boolean })[];
}

export async function ownedCertificate(personId: string, id: string) {
  if (!personId || !isCertificateCode(id)) return null;
  const sql = await crm();
  const [row] = await sql`SELECT id, course_title, student_name, lesson_count, completed_at, issued_at, share_code
    FROM lms_course_certificates WHERE id = ${id} AND person_id = ${personId}`;
  return (row as Certificate | undefined) ?? null;
}

export async function verifyCertificate(code: string) {
  if (!isCertificateCode(code)) return null;
  const sql = await crm();
  const [row] = await sql`SELECT id, course_title, student_name, lesson_count, completed_at, issued_at
    FROM lms_course_certificates WHERE share_code = ${code}`;
  return (row as Omit<Certificate, 'share_code'> | undefined) ?? null;
}

export async function issueCourseCertificate(personId: string, slug: string) {
  const person = await getPerson(personId);
  if (!person?.is_active) return { error: 'acceso' } as const;
  const sql = await crm();
  const [course] = await sql`SELECT c.id, c.price_cents, c.teacher_id, c.plan_level, c.published, cert.id AS certificate_id
    FROM lms_courses c LEFT JOIN lms_course_certificates cert ON cert.course_id = c.id AND cert.person_id = ${personId}
    WHERE c.slug = ${slug}`;
  if (course?.certificate_id) return { id: String(course.certificate_id) } as const;
  if (!course?.published || !(await canReadCourse(personId, {
    id: String(course.id), price_cents: Number(course.price_cents), teacher_id: String(course.teacher_id || ''), plan_level: Number(course.plan_level),
  }))) return { error: 'acceso' } as const;
  const name = person.name.trim();
  if (!name || name.length > 140 || name.toLowerCase() === person.email.toLowerCase()) return { error: 'nombre' } as const;
  const courseId = String(course.id);
  const [issued] = await sql`
    WITH completion AS (
      SELECT count(*)::integer AS lesson_count, max(p.completed_at) AS completed_at
      FROM lms_lessons l
      LEFT JOIN lms_progress p ON p.person_id = ${personId} AND p.lesson_id = l.id
      LEFT JOIN lms_assignment_submissions a ON a.person_id = ${personId} AND a.lesson_id = l.id
      LEFT JOIN lms_xp x ON x.person_id = ${personId} AND x.lesson_id = l.id
      WHERE l.course_id = ${courseId}
      HAVING count(*) > 0 AND bool_and(p.completed_at IS NOT NULL AND CASE
        WHEN btrim(l.mission) = '' THEN true
        WHEN lower(btrim(split_part(l.mission, chr(10), 1), chr(13))) = '[tarea]' THEN COALESCE(a.status = 'aprobada', false)
        ELSE x.lesson_id IS NOT NULL END)
    )
    INSERT INTO lms_course_certificates (id, person_id, course_id, course_title, student_name, lesson_count, completed_at)
    SELECT ${crypto.randomUUID()}, v.id, c.id, c.title, ${name}, completion.lesson_count, completion.completed_at
    FROM completion CROSS JOIN lms_courses c CROSS JOIN valux_people v
    WHERE c.id = ${courseId} AND c.published AND v.id = ${personId} AND v.is_active
    ON CONFLICT (person_id, course_id) DO NOTHING RETURNING id
  `;
  if (issued) return { id: String(issued.id) } as const;
  const [existing] = await sql`SELECT id FROM lms_course_certificates WHERE person_id = ${personId} AND course_id = ${courseId}`;
  return existing ? { id: String(existing.id) } as const : { error: 'incompleto' } as const;
}
