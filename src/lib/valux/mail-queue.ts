import { randomUUID } from 'crypto';
import { crm } from '@/lib/crm/db';
import { sendAcademiaMail } from './mail';

export async function sendQueuedAcademiaMail(id: string) {
  const sql = await crm();
  const rows = await sql`
    UPDATE academia_mail_queue SET locked_until = now() + interval '5 minutes'
    WHERE id = ${id} AND sent_at IS NULL AND next_attempt <= now()
      AND (locked_until IS NULL OR locked_until < now())
    RETURNING email, subject, body
  `;
  const row = rows[0] as { email: string; subject: string; body: string } | undefined;
  if (!row) return false;
  const sent = await sendAcademiaMail(row.email, row.subject, row.body, `queue:${id}`);
  if (sent) {
    await sql`UPDATE academia_mail_queue SET sent_at = now(), locked_until = NULL WHERE id = ${id}`;
  } else {
    await sql`UPDATE academia_mail_queue SET locked_until = NULL, next_attempt = now() + interval '5 minutes' WHERE id = ${id}`;
  }
  return sent;
}

// Los correos posteriores a una compra o transferencia sobreviven a un fallo de Resend.
export async function queueAcademiaMail(email: string, subject: string, text: string) {
  const sql = await crm();
  const id = randomUUID();
  await sql`INSERT INTO academia_mail_queue (id, email, subject, body) VALUES (${id}, ${email}, ${subject}, ${text})`;
  return sendQueuedAcademiaMail(id);
}

export async function retryAcademiaMail() {
  const sql = await crm();
  const rows = await sql`
    SELECT id FROM academia_mail_queue WHERE sent_at IS NULL AND next_attempt <= now()
      AND (locked_until IS NULL OR locked_until < now()) ORDER BY created_at LIMIT 50
  `;
  let sent = 0;
  for (const row of rows) if (await sendQueuedAcademiaMail(String(row.id))) sent += 1;
  return { pending: rows.length, sent };
}
