import { startAutomations } from './automations';
import { crm } from './db';

export async function captureLead(input: {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  form?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name) return;
  const sql = await crm();
  const form = input.form || 'web';
  await sql`
    INSERT INTO form_submits (id, form_name, name, email, phone, country)
    VALUES (
      ${crypto.randomUUID()}, ${form}, ${name}, ${email || 'sin-correo'},
      ${input.phone || null}, ${input.country || null}
    )
  `;
  if (!email.includes('@')) return;
  const existing = await sql`SELECT id FROM contacts WHERE email = ${email}`;
  let id = String((existing[0] as { id?: string } | undefined)?.id || '');
  if (!id) {
    id = crypto.randomUUID();
    await sql`
      INSERT INTO contacts (id, name, email, phone, country, source)
      VALUES (${id}, ${name}, ${email}, ${input.phone || null}, ${input.country || null}, 'web')
    `;
  } else if (input.phone || input.country) {
    await sql`
      UPDATE contacts SET
        phone = COALESCE(${input.phone || null}, phone),
        country = COALESCE(${input.country || null}, country)
      WHERE id = ${id}
    `;
  }
  await sql`UPDATE form_submits SET contact_id = ${id} WHERE email = ${email} AND contact_id IS NULL`;
  await startAutomations(id);
}
