import { crm } from '@/lib/crm/db';
import { fulfillStripeSession } from './fulfill';
import { listPaidStripeSessions, stripeConfigured } from './stripe';

export async function retryPendingStripePayments() {
  const result = { delivered: 0, failed: 0 };
  if (!stripeConfigured()) return result;
  const sql = await crm();
  const rows = await sql`
    WITH pending AS (
      SELECT id FROM valux_intents
      WHERE payment_validated_at IS NOT NULL AND fulfilled_at IS NULL
        AND (fulfillment_attempted_at IS NULL OR fulfillment_attempted_at < now() - interval '5 minutes')
      ORDER BY fulfillment_attempted_at NULLS FIRST, payment_validated_at LIMIT 25
      FOR UPDATE SKIP LOCKED
    )
    UPDATE valux_intents i SET fulfillment_attempted_at = now()
    FROM pending WHERE i.id = pending.id RETURNING i.paypal_order_id
  `;
  for (const row of rows) {
    try {
      if (await fulfillStripeSession(String(row.paypal_order_id))) result.delivered += 1;
      else result.failed += 1;
    } catch (error) {
      result.failed += 1;
      console.error('[academia] reintento de pago:', row.paypal_order_id, error);
    }
  }
  return result;
}

// Cierre nocturno: una vez al día, después de las 3 a. m. de Honduras.
// Vuelve a entregar cualquier pago de Stripe de las últimas 48 h cuyo webhook no llegó o falló
// (la entrega es idempotente) y marca como inactivos a los miembros sin membresía vigente.
export async function nightlyReconcile(now = new Date()) {
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' }));
  if (local.getHours() < 3) return null;
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
  const sql = await crm();
  // Reclamar el día de forma atómica: dos crons simultáneos no corren dos veces.
  const claimed = await sql`
    INSERT INTO crm_meta (key, value) VALUES ('academia_nightly', ${today})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE crm_meta.value < EXCLUDED.value
    RETURNING value
  `;
  if (!claimed.length) return null;
  return runReconcile(now);
}

export async function runReconcile(now = new Date()) {
  const sql = await crm();
  const result = { checked: 0, granted: 0, failed: 0, inactive: 0, eventErrors: 0 };
  if (stripeConfigured()) {
    const since = Math.floor(now.getTime() / 1000) - 48 * 3600;
    // Intenciones verificadas que quedaron incompletas se reintentan aun pasadas 48 h.
    const pending = await sql`
      SELECT i.paypal_order_id FROM valux_intents i
      WHERE i.paypal_order_id LIKE 'cs_%' AND i.fulfilled_at IS NULL AND (
        i.payment_validated_at IS NOT NULL OR EXISTS (
          SELECT FROM valux_sales s WHERE s.paypal_order_id = i.paypal_order_id AND s.refunded_at IS NULL
            AND (s.entitlement_applied_at IS NULL OR (
              i.bump_item_id IS NOT NULL AND NOT EXISTS (SELECT FROM valux_sales b WHERE b.paypal_order_id = i.paypal_order_id || ':bump')
            ))
        )
      ) ORDER BY i.payment_validated_at NULLS LAST, i.created_at LIMIT 100
    `;
    const sessions = new Set([...pending.map((row) => String(row.paypal_order_id)), ...await listPaidStripeSessions(since)]);
    for (const id of sessions) {
      result.checked += 1;
      try {
        const known = await sql`SELECT 1 FROM valux_intents WHERE paypal_order_id = ${id} AND fulfilled_at IS NOT NULL`;
        if (known.length) continue;
        if (await fulfillStripeSession(id)) result.granted += 1;
      } catch (error) {
        result.failed += 1;
        console.error('[academia] conciliación:', id, error);
      }
    }
  }
  const inactive = await sql`
    UPDATE valux_people p SET stage = 'inactivo'
    WHERE p.stage = 'miembro'
      AND NOT EXISTS (
        SELECT 1 FROM valux_subscriptions s
        WHERE s.person_id = p.id AND s.status IN ('activa', 'no_renueva') AND s.current_period_end > now()
      )
    RETURNING id
  `;
  result.inactive = inactive.length;
  const errors = await sql`SELECT count(*) AS n FROM stripe_events WHERE processed_at IS NULL AND received_at > now() - interval '2 days'`;
  result.eventErrors = Number((errors[0] as { n?: unknown } | undefined)?.n) || 0;
  await sql`
    INSERT INTO crm_meta (key, value) VALUES ('academia_reconcile', ${JSON.stringify({ at: now.toISOString(), ...result })})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  return result;
}
