'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crm } from '@/lib/crm/db';
import { requireDashboard } from '@/lib/crm/session';
import { fulfillApprovedTransfer } from './transfer-fulfillment';
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
  const sql = await crm();
  if (bankRef) {
    await sql`
      UPDATE valux_transfers SET status = 'aprobando', bank_ref = ${bankRef}, reviewed_at = now()
      WHERE id = ${id} AND status IN ('pendiente', 'vencida')
    `;
  } else {
    const [transfer] = await sql`SELECT status FROM valux_transfers WHERE id = ${id}`;
    if (transfer?.status !== 'aprobando') redirect('/dashboard/cursos/transferencias?error=banco');
  }
  try {
    if (!(await fulfillApprovedTransfer(id))) redirect('/dashboard/cursos/transferencias');
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('[academia] aprobar transferencia:', error);
    redirect('/dashboard/cursos/transferencias?estado=aprobando&error=acceso');
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
