import { put } from '@vercel/blob';
import { crm } from '@/lib/crm/db';
import { site } from '@/lib/site';
import type { GrantKind } from './fulfill';
import { sendAcademiaMail } from './mail';
import { academyMoney } from './money';
import { stripeConfigured } from './stripe';

// Plazo para pagar una orden por transferencia; después la tarea programada la vence.
export const TRANSFER_HOURS = 72;

export type Transfer = {
  id: string;
  reference: string;
  kind: GrantKind;
  item_id: string;
  description: string;
  buyer_name: string;
  buyer_email: string;
  amount_cents: number;
  months: number;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida';
  receipt_url: string;
  bank_ref: string;
  note: string;
  expires_at: string;
  created_at: string;
  reviewed_at: string;
};

const text = (value: unknown) => (value == null ? '' : String(value));

function mapTransfer(row: Record<string, unknown>): Transfer {
  return {
    id: text(row.id),
    reference: text(row.reference),
    kind: text(row.kind) as GrantKind,
    item_id: text(row.item_id),
    description: text(row.description),
    buyer_name: text(row.buyer_name),
    buyer_email: text(row.buyer_email),
    amount_cents: Number(row.amount_cents) || 0,
    months: Number(row.months) || 1,
    status: text(row.status) as Transfer['status'],
    receipt_url: text(row.receipt_url),
    bank_ref: text(row.bank_ref),
    note: text(row.note),
    expires_at: text(row.expires_at),
    created_at: text(row.created_at),
    reviewed_at: text(row.reviewed_at),
  };
}

// Sin 0/O ni 1/I para que se dicte sin errores por teléfono.
function newReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `CL-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`;
}

export async function bankDetails() {
  const sql = await crm();
  const rows = await sql`SELECT bank_details FROM valux_settings WHERE id = 'valux'`;
  return text((rows[0] as { bank_details?: string } | undefined)?.bank_details).trim();
}

export async function paymentOptions() {
  return { card: stripeConfigured(), transfer: Boolean(await bankDetails()) };
}

function publicBase() {
  return process.env.NODE_ENV === 'production' ? site.url : process.env.LOCAL_SITE_URL || 'http://localhost:3000';
}

export async function createTransfer(input: {
  kind: GrantKind;
  itemId?: string | null;
  description: string;
  name: string;
  email: string;
  amountCents: number;
  months?: number;
  // amountCents ya incluye el bump.
  bump?: { itemId: string; cents: number; title: string } | null;
}) {
  const sql = await crm();
  const description = input.bump ? `${input.description} + ${input.bump.title}` : input.description;
  const expires = new Date(Date.now() + TRANSFER_HOURS * 60 * 60 * 1000);
  let reference = '';
  for (let attempt = 0; attempt < 5 && !reference; attempt += 1) {
    const candidate = newReference();
    const rows = await sql`
      INSERT INTO valux_transfers (
        id, reference, kind, item_id, description, buyer_name, buyer_email, amount_cents, months, expires_at,
        bump_item_id, bump_cents
      ) VALUES (
        ${crypto.randomUUID()}, ${candidate}, ${input.kind}, ${input.itemId || null}, ${description.slice(0, 160)},
        ${input.name.trim()}, ${input.email.trim().toLowerCase()}, ${input.amountCents}, ${input.months || 1}, ${expires.toISOString()},
        ${input.bump?.itemId || null}, ${input.bump?.cents || 0}
      )
      ON CONFLICT (reference) DO NOTHING
      RETURNING reference
    `;
    reference = text((rows[0] as { reference?: string } | undefined)?.reference);
  }
  if (!reference) throw new Error('No se pudo generar la referencia');

  const bank = await bankDetails();
  await sendAcademiaMail(
    input.email,
    `Datos para tu transferencia (${reference})`,
    [
      `Hola ${input.name.trim()},`,
      '',
      `Para completar "${input.description}" transferí ${academyMoney(input.amountCents)} a:`,
      bank,
      '',
      `Poné esta referencia en el concepto: ${reference}`,
      `Tenés ${TRANSFER_HOURS} horas. Cuando confirmemos el depósito en el banco te llega el acceso.`,
      '',
      `Podés subir el comprobante aquí: ${publicBase()}/academia/transferencia/${reference}`,
    ].join('\n'),
  );
  return reference;
}

export async function getTransfer(reference: string) {
  const sql = await crm();
  const rows = await sql`SELECT * FROM valux_transfers WHERE reference = ${reference.trim().toUpperCase()}`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapTransfer(row) : null;
}

export async function getTransferById(id: string) {
  const sql = await crm();
  const rows = await sql`SELECT * FROM valux_transfers WHERE id = ${id}`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapTransfer(row) : null;
}

export async function listTransfers(status?: string) {
  const sql = await crm();
  const rows = status
    ? await sql`SELECT * FROM valux_transfers WHERE status = ${status} ORDER BY created_at DESC LIMIT 200`
    : await sql`SELECT * FROM valux_transfers ORDER BY created_at DESC LIMIT 200`;
  return rows.map((row) => mapTransfer(row as Record<string, unknown>));
}

export async function expireTransfers() {
  const sql = await crm();
  const rows = await sql`
    UPDATE valux_transfers SET status = 'vencida'
    WHERE status = 'pendiente' AND expires_at < now()
    RETURNING id
  `;
  return rows.length;
}

function blobToken() {
  return (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN || '').trim();
}

export const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Los comprobantes traen datos bancarios: van privados y solo se ven desde el panel.
export async function storeReceipt(reference: string, file: File) {
  const token = blobToken();
  if (!token) throw new Error('Falta BLOB_READ_WRITE_TOKEN');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80) || 'comprobante';
  const blob = await put(`academia/transferencias/${reference}/${crypto.randomUUID()}-${safe}`, file, {
    access: 'private',
    token,
    contentType: file.type || undefined,
  });
  return blob.url;
}

export async function readReceipt(url: string) {
  const token = blobToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) return null;
  return { body: await res.arrayBuffer(), type: res.headers.get('content-type') || 'application/octet-stream' };
}
