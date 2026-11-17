import { crm } from './db';
import { newTotpSecret, verifyTotp } from './totp';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

type MfaRow = { secret: string | null; pending: string | null; last_step: unknown; fails: unknown; locked_until: string | null };

async function row(email: string) {
  const sql = await crm();
  const rows = await sql`SELECT secret, pending, last_step, fails, locked_until FROM crm_mfa WHERE email = ${email}`;
  return rows[0] as MfaRow | undefined;
}

export async function mfaEnrolled(email: string) {
  return Boolean((await row(email))?.secret);
}

// Alta: el secreto queda "pendiente" hasta que la persona escribe un código válido con él.
export async function pendingSecret(email: string) {
  const current = await row(email);
  if (current?.secret) return '';
  if (current?.pending) return current.pending;
  const secret = newTotpSecret();
  const sql = await crm();
  await sql`
    INSERT INTO crm_mfa (email, pending) VALUES (${email}, ${secret})
    ON CONFLICT (email) DO UPDATE SET pending = COALESCE(crm_mfa.pending, EXCLUDED.pending)
  `;
  return (await row(email))?.pending || secret;
}

// 5 códigos malos bloquean 15 minutos. Un código ya usado no se acepta otra vez.
export async function checkMfa(email: string, code: string): Promise<'ok' | 'bad' | 'locked'> {
  const current = await row(email);
  if (!current) return 'bad';
  if (current.locked_until && new Date(current.locked_until).getTime() > Date.now()) return 'locked';
  const secret = current.secret || current.pending;
  if (!secret) return 'bad';
  const step = verifyTotp(secret, code.replace(/\s/g, ''), Number(current.last_step) || 0);
  const sql = await crm();
  if (step === null) {
    const fails = (Number(current.fails) || 0) + 1;
    if (fails >= MAX_FAILS) {
      await sql`
        UPDATE crm_mfa SET fails = 0, locked_until = now() + ${`${LOCK_MINUTES} minutes`}::interval WHERE email = ${email}
      `;
      return 'locked';
    }
    await sql`UPDATE crm_mfa SET fails = ${fails} WHERE email = ${email}`;
    return 'bad';
  }
  // Paso guardado con condición: dos envíos simultáneos del mismo código no entran los dos.
  const claimed = await sql`
    UPDATE crm_mfa SET
      secret = COALESCE(secret, pending), pending = NULL, last_step = ${step}, fails = 0, locked_until = NULL
    WHERE email = ${email} AND last_step < ${step}
    RETURNING email
  `;
  return claimed.length ? 'ok' : 'bad';
}

export async function resetMfa(email: string) {
  const sql = await crm();
  await sql`DELETE FROM crm_mfa WHERE email = ${email.trim().toLowerCase()}`;
}
