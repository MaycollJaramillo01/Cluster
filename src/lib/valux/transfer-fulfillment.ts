import { crm } from '@/lib/crm/db';
import { grantAccess, grantBump, type GrantKind } from './fulfill';

export async function fulfillApprovedTransfer(id: string) {
  const sql = await crm();
  const [row] = await sql`
    SELECT reference, kind, item_id, buyer_name, buyer_email, amount_cents, months, bump_item_id, bump_cents, coupon_code, reviewed_at
    FROM valux_transfers WHERE id = ${id} AND status = 'aprobando'
  `;
  if (!row) return false;
  const kind = String(row.kind) as GrantKind;
  const name = String(row.buyer_name);
  const email = String(row.buyer_email);
  const months = Number(row.months) || 1;
  const amount = Number(row.amount_cents);
  const bumpCents = Number(row.bump_cents) || 0;
  const orderId = `tr_${row.reference}`;
  const paidAt = row.reviewed_at ? new Date(String(row.reviewed_at)) : undefined;
  const primary = await grantAccess({
    kind, name, email, months,
    itemId: row.item_id ? String(row.item_id) : null,
    monthlyCents: kind === 'donacion' ? Math.round(amount / Math.max(1, months)) : undefined,
    amountCents: kind === 'donacion' ? undefined : amount - bumpCents,
    paypalOrderId: orderId,
    couponCode: row.coupon_code ? String(row.coupon_code) : null,
    paidAt,
  });
  if (primary.path.includes('error=reembolso')) {
    await sql`UPDATE valux_transfers SET status = 'reembolsada' WHERE id = ${id} AND status = 'aprobando'`;
    return false;
  }
  await grantBump({ name, email, orderId, bumpCents, bumpItemId: row.bump_item_id ? String(row.bump_item_id) : '', paidAt });
  const [transfer] = await sql`UPDATE valux_transfers SET status = 'aprobada' WHERE id = ${id} AND status = 'aprobando' RETURNING id`;
  return Boolean(transfer);
}

export async function retryApprovedTransfers() {
  const sql = await crm();
  const rows = await sql`
    WITH pending AS (
      SELECT t.id FROM valux_transfers t
      WHERE (t.fulfillment_attempted_at IS NULL OR t.fulfillment_attempted_at < now() - interval '15 minutes')
        AND (t.status = 'aprobando' OR (
          t.status = 'aprobada' AND t.reviewed_at IS NOT NULL AND NULLIF(trim(t.bank_ref), '') IS NOT NULL
          AND NOT EXISTS (SELECT FROM valux_revoked_orders WHERE order_id = 'tr_' || t.reference)
          AND NOT EXISTS (SELECT FROM valux_sales WHERE paypal_order_id = 'tr_' || t.reference AND refunded_at IS NOT NULL)
          AND (
            (t.kind = 'donacion' AND NOT EXISTS (SELECT FROM valux_donations WHERE paypal_order_id = 'tr_' || t.reference))
            OR (t.kind = 'suscripcion' AND NOT EXISTS (SELECT FROM valux_subscriptions WHERE paypal_order_id = 'tr_' || t.reference))
            OR (t.kind IN ('curso', 'producto') AND NOT EXISTS (SELECT FROM valux_sales WHERE paypal_order_id = 'tr_' || t.reference))
            OR (t.kind = 'curso' AND EXISTS (
              SELECT FROM valux_sales s WHERE s.paypal_order_id = 'tr_' || t.reference AND s.entitlement_applied_at IS NULL
                AND NOT EXISTS (SELECT FROM lms_enrollments e WHERE e.course_id = s.course_id AND e.person_id = s.buyer_id)
                AND NOT EXISTS (SELECT FROM academia_events WHERE id = 'purchase_completed:tr_' || t.reference)
            ))
            OR (t.bump_item_id IS NOT NULL AND t.bump_cents > 0
              AND NOT EXISTS (SELECT FROM valux_sales WHERE paypal_order_id = 'tr_' || t.reference || ':bump')
              AND NOT EXISTS (SELECT FROM valux_revoked_orders WHERE order_id = 'tr_' || t.reference || ':bump'))
          )
        ))
      ORDER BY t.fulfillment_attempted_at NULLS FIRST, t.reviewed_at LIMIT 25
      FOR UPDATE SKIP LOCKED
    )
    UPDATE valux_transfers t SET fulfillment_attempted_at = now(), status = 'aprobando'
    FROM pending WHERE t.id = pending.id RETURNING t.id
  `;
  let delivered = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      if (await fulfillApprovedTransfer(String(row.id))) delivered += 1;
    } catch (error) {
      failed += 1;
      console.error('[academia] entrega de transferencia:', row.id, error);
    }
  }
  return { delivered, failed };
}
