import { crm } from './db';

const digits = (value: string) => value.replace(/\D/g, '');

// Busca el contacto por teléfono (los últimos 8 dígitos absorben el código de país).
// Si no existe lo crea: contacts exige correo, así que lleva uno .invalid que nunca recibe nada.
async function contactByPhone(phone: string, name: string, source: string) {
  const sql = await crm();
  const clean = digits(phone);
  if (clean.length < 8) return '';
  const tail = clean.slice(-8);
  const rows = await sql`
    SELECT id FROM contacts
    WHERE phone IS NOT NULL AND right(regexp_replace(phone, '[^0-9]', '', 'g'), 8) = ${tail}
    ORDER BY created_at LIMIT 1
  `;
  const found = (rows[0] as { id?: string } | undefined)?.id;
  if (found) return found;
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO contacts (id, name, email, phone, source)
    VALUES (${id}, ${name || `+${clean}`}, ${`${clean}@${source}.invalid`}, ${`+${clean}`}, ${source})
    ON CONFLICT (email) DO NOTHING
  `;
  const again = await sql`SELECT id FROM contacts WHERE email = ${`${clean}@${source}.invalid`}`;
  return (again[0] as { id?: string } | undefined)?.id || '';
}

async function contactByEmail(email: string, name: string) {
  const sql = await crm();
  const clean = email.trim().toLowerCase();
  if (!clean.includes('@')) return '';
  await sql`
    INSERT INTO contacts (id, name, email, source)
    VALUES (${crypto.randomUUID()}, ${name || clean}, ${clean}, 'correo')
    ON CONFLICT (email) DO NOTHING
  `;
  const rows = await sql`SELECT id FROM contacts WHERE email = ${clean}`;
  return (rows[0] as { id?: string } | undefined)?.id || '';
}

export async function saveInbound(input: {
  channel: 'whatsapp' | 'sms' | 'email';
  from: string;
  name?: string;
  body: string;
}) {
  const body = input.body.trim().slice(0, 8000);
  if (!body) return false;
  const contactId =
    input.channel === 'email'
      ? await contactByEmail(input.from, input.name || '')
      : await contactByPhone(input.from, input.name || '', input.channel);
  if (!contactId) return false;
  const sql = await crm();
  await sql`
    INSERT INTO messages (id, contact_id, channel, direction, body, delivered)
    VALUES (${crypto.randomUUID()}, ${contactId}, ${input.channel}, 'in', ${body}, true)
  `;
  return true;
}
