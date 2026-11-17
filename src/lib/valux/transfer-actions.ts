'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crm } from '@/lib/crm/db';
import { requireDashboard } from '@/lib/crm/session';
import { grantAccess, grantBump } from './fulfill';
import { RECEIPT_TYPES, getTransfer, storeReceipt } from './transfers';

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function refresh() {
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/academia', 'layout');
}

// El comprador sube el comprobante. Solo ayuda a encontrar el depósito: no da acceso.
export async function attachReceipt(formData: FormData) {
  const reference = field(formData, 'reference').toUpperCase();
  const transfer = await getTransfer(reference);
  if (!transfer) redirect('/academia');
  const path = `/academia/transferencia/${transfer.reference}`;
  if (transfer.status !== 'pendiente') redirect(path);
  const file = formData.get('receipt');
  if (!(file instanceof File) || file.size === 0) redirect(`${path}?error=archivo`);
  if (file.size > 8 * 1024 * 1024 || !RECEIPT_TYPES.includes(file.type)) redirect(`${path}?error=archivo`);
  let url = '';
  try {
    url = await storeReceipt(transfer.reference, file);
  } catch (error) {
    console.error('[academia] comprobante:', error);
    redirect(`${path}?error=subida`);
  }
  const sql = await crm();
  await sql`UPDATE valux_transfers SET receipt_url = ${url} WHERE id = ${transfer.id} AND status = 'pendiente'`;
  refresh();
  redirect(`${path}?subido=1`);
}

// Finanzas aprueba solo después de ver el movimiento en el banco; el número de operación queda anotado.
export async function approveTransfer(formData: FormData) {
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  const bankRef = field(formData, 'bank_ref');
  if (!id) return;
  if (!bankRef) redirect('/dashboard/cursos/transferencias?error=banco');
  const sql = await crm();
  const taken = await sql`
    UPDATE valux_transfers SET status = 'aprobada', bank_ref = ${bankRef}, reviewed_at = now()
    WHERE id = ${id} AND status IN ('pendiente', 'vencida')
    RETURNING reference, kind, item_id, buyer_name, buyer_email, amount_cents, months, bump_item_id, bump_cents
  `;
  const row = taken[0] as
    | {
        reference: string;
        kind: string;
        item_id: string | null;
        buyer_name: string;
        buyer_email: string;
        amount_cents: number;
        months: number;
        bump_item_id: string | null;
        bump_cents: number;
      }
    | undefined;
  if (!row) redirect('/dashboard/cursos/transferencias');
  try {
    await grantAccess({
      kind: row.kind as Parameters<typeof grantAccess>[0]['kind'],
      itemId: row.item_id,
      name: row.buyer_name,
      email: row.buyer_email,
      months: Number(row.months) || 1,
      monthlyCents: row.kind === 'donacion' ? Math.round(Number(row.amount_cents) / Math.max(1, Number(row.months) || 1)) : undefined,
      amountCents: row.kind === 'donacion' ? undefined : Number(row.amount_cents) - (Number(row.bump_cents) || 0),
      // Mismo id para cualquier reintento: grantAccess no crea una segunda venta.
      paypalOrderId: `tr_${row.reference}`,
    });
    await grantBump({
      bumpItemId: row.bump_item_id || '',
      bumpCents: Number(row.bump_cents) || 0,
      name: row.buyer_name,
      email: row.buyer_email,
      orderId: `tr_${row.reference}`,
    });
  } catch (error) {
    console.error('[academia] aprobar transferencia:', error);
    await sql`UPDATE valux_transfers SET status = 'pendiente', reviewed_at = NULL WHERE id = ${id}`;
    redirect('/dashboard/cursos/transferencias?error=acceso');
  }
  refresh();
  redirect('/dashboard/cursos/transferencias?ok=1');
}

export async function rejectTransfer(formData: FormData) {
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`
    UPDATE valux_transfers SET status = 'rechazada', note = ${field(formData, 'note') || null}, reviewed_at = now()
    WHERE id = ${id} AND status IN ('pendiente', 'vencida')
  `;
  refresh();
}
