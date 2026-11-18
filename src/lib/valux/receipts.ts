import { crm } from '@/lib/crm/db';

export type Receipt = {
  id: string;
  number: string;
  concept: string;
  kind: string;
  amount_cents: number;
  method: string;
  created_at: string;
  refunded_at: string | null;
  refund_reason: string;
  buyer_name: string;
  buyer_email: string;
};

// Método según la referencia guardada en la venta.
function methodOf(ref: string) {
  if (ref.startsWith('cs_') || ref.startsWith('in_')) return 'Tarjeta (Stripe)';
  if (ref.startsWith('TR-') || ref.startsWith('tr_') || ref.includes('transfer')) return 'Transferencia bancaria';
  if (!ref) return 'Registro manual';
  return 'PayPal';
}

// Solo las ventas de quien pregunta: el id de persona sale siempre de la sesión.
export async function listReceipts(personId: string, id?: string): Promise<Receipt[]> {
  if (!personId) return [];
  const sql = await crm();
  const rows = await sql`
    SELECT s.id, s.kind, s.amount_cents, s.paypal_order_id, s.created_at, s.refunded_at, s.refund_reason,
      COALESCE(c.title, p.title, CASE WHEN s.kind = 'suscripcion' THEN 'Membresía de la academia' ELSE s.kind END) AS concept,
      b.name AS buyer_name, b.email AS buyer_email
    FROM valux_sales s
    JOIN valux_people b ON b.id = s.buyer_id
    LEFT JOIN lms_courses c ON c.id = s.course_id
    LEFT JOIN valux_products p ON p.id = s.product_id
    WHERE s.buyer_id = ${personId} AND (${id || ''} = '' OR s.id = ${id || ''})
    ORDER BY s.created_at DESC
  `;
  return (rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    number: String(row.id).slice(0, 8).toUpperCase(),
    concept: String(row.concept || ''),
    kind: String(row.kind || ''),
    amount_cents: Number(row.amount_cents) || 0,
    method: methodOf(String(row.paypal_order_id || '')),
    created_at: String(row.created_at),
    refunded_at: row.refunded_at ? String(row.refunded_at) : null,
    refund_reason: String(row.refund_reason || ''),
    buyer_name: String(row.buyer_name || ''),
    buyer_email: String(row.buyer_email || ''),
  }));
}
