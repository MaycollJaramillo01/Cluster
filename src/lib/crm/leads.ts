import { startAutomations } from './automations';
import { crm } from './db';

const IDENTITY_FIELDS = new Set([
  'nombre',
  'name',
  'email',
  'telefono',
  'phone',
  'whatsapp',
  'pais',
  'country',
  'captchaToken',
  'captchaAnswer',
  'contactFax',
]);

function detailText(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => detailText(item)).filter(Boolean).join(', ');
  }
  if (value && typeof value === 'object') {
    const json = JSON.stringify(value);
    return json === '{}' ? '' : json;
  }
  return '';
}

export function leadDetails(input: object, omit: string[] = []) {
  const skip = new Set([...IDENTITY_FIELDS, ...omit]);
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (skip.has(key)) continue;
    const text = detailText(value).slice(0, 4000);
    if (text) details[key] = text;
  }
  return details;
}

export async function captureLead(input: {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  form?: string;
  details?: Record<string, string>;
  automate?: boolean;
}) {
  const email = (input.email || '').trim().toLowerCase();
  const name = input.name.trim();
  if (!name) return;
  const sql = await crm();
  const form = input.form || 'web';
  const details = input.details && Object.keys(input.details).length ? JSON.stringify(input.details) : null;
  const submitId = crypto.randomUUID();
  await sql`
    INSERT INTO form_submits (id, form_name, name, email, phone, country, details)
    VALUES (
      ${submitId}, ${form}, ${name}, ${email || 'sin-correo'},
      ${input.phone || null}, ${input.country || null}, ${details}
    )
  `;
  if (!email.includes('@')) return;
  const existing = await sql`SELECT id FROM contacts WHERE email = ${email}`;
  let id = String((existing[0] as { id?: string } | undefined)?.id || '');
  if (!id) {
    id = crypto.randomUUID();
    await sql`
      INSERT INTO contacts (id, name, email, phone, country, city, state, source)
      VALUES (
        ${id}, ${name}, ${email}, ${input.phone || null}, ${input.country || null},
        ${input.city || null}, ${input.state || null}, ${form}
      )
    `;
  } else if (input.phone || input.country || input.city || input.state) {
    await sql`
      UPDATE contacts SET
        phone = COALESCE(${input.phone || null}, phone),
        country = COALESCE(${input.country || null}, country),
        city = COALESCE(${input.city || null}, city),
        state = COALESCE(${input.state || null}, state)
      WHERE id = ${id}
    `;
  }
  await sql`UPDATE form_submits SET contact_id = ${id} WHERE id = ${submitId}`;
  if (input.automate !== false) await startAutomations(id);
}
