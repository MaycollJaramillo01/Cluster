import { crm } from '@/lib/crm/db';
import { fulfillStripeSession } from './fulfill';
import { listPaidStripeSessions, stripeConfigured } from './stripe';

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
    for (const id of await listPaidStripeSessions(since)) {
      result.checked += 1;
      try {
        const known = await sql`SELECT 1 FROM valux_sales WHERE paypal_order_id = ${id}`;
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
