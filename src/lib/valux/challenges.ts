import { crm } from '@/lib/crm/db';

export type ChallengeKind = 'xp' | 'misiones' | 'curso';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  kind: ChallengeKind;
  target: number;
  course_id: string | null;
  course_title: string;
  bonus_xp: number;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

export const CHALLENGE_KINDS: { id: ChallengeKind; label: string }[] = [
  { id: 'xp', label: 'Juntar XP de misiones' },
  { id: 'misiones', label: 'Aprobar misiones' },
  { id: 'curso', label: 'Terminar un curso' },
];

// Neon devuelve Date: se pasa a ISO para volver a usarlo como parámetro.
function iso(value: unknown) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapChallenge(row: Record<string, unknown>): Challenge {
  const kind = String(row.kind);
  return {
    id: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    kind: kind === 'misiones' || kind === 'curso' ? kind : 'xp',
    target: Number(row.target) || 0,
    course_id: row.course_id ? String(row.course_id) : null,
    course_title: String(row.course_title || ''),
    bonus_xp: Number(row.bonus_xp) || 0,
    ends_at: row.ends_at ? iso(row.ends_at) : null,
    active: row.active === true || row.active === 't',
    created_at: iso(row.created_at),
  };
}

export async function listChallenges(onlyOpen = false) {
  const sql = await crm();
  const rows = await sql`
    SELECT h.*, c.title AS course_title
    FROM lms_challenges h LEFT JOIN lms_courses c ON c.id = h.course_id
    WHERE ${!onlyOpen} OR (h.active AND (h.ends_at IS NULL OR h.ends_at > now()))
    ORDER BY h.created_at DESC
  `;
  return rows.map((row) => mapChallenge(row as Record<string, unknown>));
}

export async function getChallenge(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT h.*, c.title AS course_title
    FROM lms_challenges h LEFT JOIN lms_courses c ON c.id = h.course_id
    WHERE h.id = ${id}
  `;
  return rows[0] ? mapChallenge(rows[0] as Record<string, unknown>) : null;
}

// Avance medido en el servidor. xp y misiones cuentan desde que se creó el reto
// (y solo en el curso del reto si tiene uno); curso cuenta clases completadas de ese curso.
export async function challengeProgress(personId: string, challenge: Challenge) {
  const sql = await crm();
  const course = challenge.course_id || '';
  if (challenge.kind === 'curso') {
    const rows = await sql`
      SELECT count(*) AS total,
        count(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM lms_progress p WHERE p.lesson_id = l.id AND p.person_id = ${personId} AND p.completed_at IS NOT NULL
        )) AS done
      FROM lms_lessons l WHERE l.course_id = ${course}
    `;
    const row = rows[0] as { total?: unknown; done?: unknown } | undefined;
    const total = Number(row?.total) || 0;
    return { value: Number(row?.done) || 0, goal: total, met: total > 0 && Number(row?.done) >= total };
  }
  const rows = await sql`
    SELECT COALESCE(sum(x.xp), 0) AS xp, count(*) AS missions
    FROM lms_xp x JOIN lms_lessons l ON l.id = x.lesson_id
    WHERE x.person_id = ${personId} AND x.created_at >= ${challenge.created_at}
      AND (${course} = '' OR l.course_id = ${course})
  `;
  const row = rows[0] as { xp?: unknown; missions?: unknown } | undefined;
  const value = challenge.kind === 'xp' ? Number(row?.xp) || 0 : Number(row?.missions) || 0;
  return { value, goal: challenge.target, met: challenge.target > 0 && value >= challenge.target };
}

export async function claimedChallenges(personId: string) {
  if (!personId) return new Set<string>();
  const sql = await crm();
  const rows = await sql`SELECT challenge_id FROM lms_challenge_claims WHERE person_id = ${personId}`;
  return new Set((rows as { challenge_id: string }[]).map((row) => row.challenge_id));
}
