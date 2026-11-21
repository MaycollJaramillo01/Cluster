import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { crm } from '@/lib/crm/db';
import { signingSecret } from '@/lib/crm/session';
import { getPersonByEmail } from './data';
import { ensurePerson } from './fulfill';
import { saveLead, trackEvent, type Lead } from './events';
import { sendAcademiaMail } from './mail';
import { courseLoginQuery } from './login-course';

const LOGIN_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 5;

function hash(value: string) {
  return createHmac('sha256', signingSecret()).update(`login:${value}`).digest('hex');
}

// Solo en local sin Resend: el código no sale por correo, así que la pantalla lo muestra.
const localMail = () => process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY?.trim();
const g = globalThis as { __devLoginCodes?: Map<string, string> };
const devCodes = (g.__devLoginCodes ??= new Map());

export function devLoginCode(id: string) {
  return localMail() ? devCodes.get(id) || '' : '';
}

function sameHash(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function cleanPhone(raw: string) {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length < 8 || digits.length > 15) return '';
  return raw.trim().startsWith('+') ? `+${digits}` : digits;
}

// Siempre devuelve un id: la pantalla del código es igual exista o no el correo (sin enumeración).
export async function startLogin(input: { email: string; name?: string; phone?: string; register: boolean; base: string; lead?: Lead; course?: string }) {
  const id = crypto.randomUUID();
  const email = input.email.trim().toLowerCase();
  if (!email.includes('@')) return id;
  const sql = await crm();
  const recent = await sql`
    SELECT count(*) AS n FROM academia_logins WHERE email = ${email} AND created_at > now() - interval '1 hour'
  `;
  // Los avisos van solo a los registros del servidor: la pantalla sigue igual para no revelar qué correos existen.
  if (Number((recent[0] as { n?: unknown } | undefined)?.n) >= MAX_PER_HOUR) {
    console.warn('Entrada a la academia: ese correo ya pidió 5 códigos en la última hora');
    return id;
  }
  const person = await getPersonByEmail(email);
  const name = (input.name || '').trim();
  const phone = input.phone || '';
  if (!person && !(input.register && name && phone)) {
    console.warn(`Entrada a la academia: correo sin cuenta (${input.register ? 'registro sin nombre o WhatsApp válido' : 'pestaña Entrar'})`);
    return id;
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const token = randomBytes(32).toString('base64url');
  // Un código nuevo anula los anteriores.
  await sql`UPDATE academia_logins SET expires_at = now() WHERE email = ${email} AND used_at IS NULL AND expires_at > now()`;
  await sql`
    INSERT INTO academia_logins (id, email, name, phone, code_hash, token_hash, expires_at, lead)
    VALUES (
      ${id}, ${email}, ${name || null}, ${phone || null}, ${hash(`${id}:${code}`)}, ${hash(token)},
      now() + ${`${LOGIN_MINUTES} minutes`}::interval, ${input.lead ? JSON.stringify(input.lead) : null}
    )
  `;
  if (localMail()) devCodes.set(id, code);
  const delivered = await sendAcademiaMail(
    email,
    `Tu código para entrar: ${code}`,
    [
      'Hola,',
      '',
      `Tu código para entrar a la academia de Cluster es: ${code}`,
      '',
      'O abre este enlace:',
      `${input.base}/academia/entrar/confirmar?t=${token}${courseLoginQuery(input.course)}`,
      '',
      `Sirve una sola vez y vence en ${LOGIN_MINUTES} minutos. Si no lo pediste, ignora este correo.`,
    ].join('\n'),
  );
  if (!delivered) {
    await sql`UPDATE academia_logins SET expires_at = now() WHERE id = ${id}`;
    throw new Error('No se pudo enviar el código');
  }
  return id;
}

async function finish(row: { email: string; name: string | null; phone: string | null; lead: string | null }) {
  const sql = await crm();
  const known = (await sql`SELECT id FROM valux_people WHERE email = ${row.email}`).length > 0;
  const personId = await ensurePerson(row.email, row.name || row.email.split('@')[0]);
  if (row.phone) {
    await sql`UPDATE valux_people SET phone = COALESCE(NULLIF(phone, ''), ${row.phone}) WHERE id = ${personId}`;
  }
  if (row.lead) {
    try {
      await saveLead(personId, JSON.parse(row.lead) as Lead);
    } catch {
      // Un lead mal formado no impide entrar.
    }
  }
  if (!known) await trackEvent('lead_created', { id: `lead_created:${personId}`, personId, email: row.email });
  return personId;
}

// Cada intento cuenta aunque falle; al quinto el código muere.
export async function verifyLoginCode(id: string, code: string) {
  if (!id || !/^\d{6}$/.test(code)) return '';
  const sql = await crm();
  const rows = await sql`
    UPDATE academia_logins SET attempts = attempts + 1
    WHERE id = ${id} AND used_at IS NULL AND expires_at > now() AND attempts < ${MAX_ATTEMPTS}
    RETURNING code_hash, email, name, phone, lead
  `;
  const row = rows[0] as { code_hash: string; email: string; name: string | null; phone: string | null; lead: string | null } | undefined;
  if (!row || !sameHash(row.code_hash, hash(`${id}:${code}`))) return '';
  const claimed = await sql`UPDATE academia_logins SET used_at = now() WHERE id = ${id} AND used_at IS NULL RETURNING id`;
  return claimed.length ? finish(row) : '';
}

export async function verifyLoginLink(token: string) {
  if (!token) return '';
  const sql = await crm();
  const rows = await sql`
    UPDATE academia_logins SET used_at = now()
    WHERE token_hash = ${hash(token)} AND used_at IS NULL AND expires_at > now()
    RETURNING email, name, phone, lead
  `;
  const row = rows[0] as { email: string; name: string | null; phone: string | null; lead: string | null } | undefined;
  return row ? finish(row) : '';
}
