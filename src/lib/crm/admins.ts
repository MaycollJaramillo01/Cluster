import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { crm } from './db';
import { allowedEmails } from './session';

const scrypt = promisify(scryptCb);

export function isAdminEmail(email: string) {
  return allowedEmails().includes(email.trim().toLowerCase());
}

export async function adminHasPassword(email: string) {
  const sql = await crm();
  const rows = await sql`SELECT email FROM crm_admins WHERE email = ${email.trim().toLowerCase()}`;
  return rows.length > 0;
}

export async function saveAdminPassword(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const salt = randomBytes(16).toString('base64url');
  const hash = await hashPassword(password, salt);
  const sql = await crm();
  await sql`
    INSERT INTO crm_admins (email, name, salt, hash)
    VALUES (${normalized}, ${'Administrador'}, ${salt}, ${hash})
    ON CONFLICT (email) DO UPDATE SET salt = EXCLUDED.salt, hash = EXCLUDED.hash
  `;
}

export async function passwordMatches(email: string, password: string) {
  const sql = await crm();
  const rows = await sql`SELECT salt, hash FROM crm_admins WHERE email = ${email.trim().toLowerCase()}`;
  const row = rows[0] as { salt?: string; hash?: string } | undefined;
  if (!row?.salt || !row.hash) return false;
  const left = Buffer.from(row.hash);
  const right = Buffer.from(await hashPassword(password, row.salt));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function hashPassword(password: string, salt: string) {
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return hash.toString('base64url');
}
