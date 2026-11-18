import { NextResponse } from 'next/server';
import { crm } from '@/lib/crm/db';
import { alertTeam } from '@/lib/valux/alerts';
import { sendPaymentFailed } from '@/lib/valux/followups';
import { fulfillStripeSession, recordSubscriptionPayment, revokeSales, setSubscriptionEnded } from '@/lib/valux/fulfill';
import { cancelStripeSubscription, stripePaymentRefs, verifyStripeEvent } from '@/lib/valux/stripe';

export const runtime = 'nodejs';

function ref(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id?: unknown }).id || '');
  return '';
}

// Reembolso total o disputa abierta: se quita el acceso y la membresía deja de cobrarse.
async function revokeCharge(paymentIntent: string, invoice: string, reason: string) {
  const { refs, subscriptionId } = await stripePaymentRefs(paymentIntent, invoice);
  await revokeSales(refs, reason);
  if (subscriptionId) await cancelStripeSubscription(subscriptionId, false).catch(() => undefined);
}

// Webhook de Stripe: entrega aunque el alumno cierre la pestaña y lleva las renovaciones.
export async function POST(request: Request) {
  const raw = await request.text();
  const event = verifyStripeEvent(raw, request.headers.get('stripe-signature') || '');
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  const item = event.data.object;

  // Registro por id: un evento ya procesado (reintento o reenvío de Stripe) no se vuelve a aplicar.
  const sql = await crm();
  await sql`INSERT INTO stripe_events (id, type) VALUES (${event.id}, ${event.type}) ON CONFLICT (id) DO NOTHING`;
  const seen = await sql`SELECT processed_at FROM stripe_events WHERE id = ${event.id}`;
  if ((seen[0] as { processed_at?: unknown } | undefined)?.processed_at) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillStripeSession(ref(item.id));
        break;
      case 'invoice.paid': {
        const parent = item.parent as { subscription_details?: { subscription?: unknown } } | undefined;
        const subscriptionId = ref(item.subscription) || ref(parent?.subscription_details?.subscription);
        const lines = item.lines as { data?: { period?: { end?: number } }[] } | undefined;
        const end = Number(lines?.data?.[0]?.period?.end) || 0;
        if (subscriptionId) {
          await recordSubscriptionPayment({
            gatewayId: subscriptionId,
            paymentId: ref(item.id),
            amountCents: Number(item.amount_paid) || 0,
            periodEnd: end ? new Date(end * 1000) : null,
          });
        }
        break;
      }
      case 'customer.subscription.updated':
        if (item.cancel_at_period_end) await setSubscriptionEnded(ref(item.id), 'no_renueva');
        break;
      case 'customer.subscription.deleted':
        await setSubscriptionEnded(ref(item.id), 'vencida');
        break;
      case 'charge.refunded':
        // ponytail: un reembolso parcial no quita acceso; se decide a mano desde Ventas.
        if (item.refunded) await revokeCharge(ref(item.payment_intent), ref(item.invoice), 'reembolso');
        break;
      case 'invoice.payment_failed':
        // Renovación rechazada: aviso al alumno con el enlace de Stripe para pagar con otra tarjeta.
        await sendPaymentFailed({
          invoiceId: ref(item.id),
          email: String(item.customer_email || ''),
          amountCents: Number(item.amount_due) || 0,
          payUrl: String(item.hosted_invoice_url || ''),
        });
        break;
      case 'charge.dispute.created':
        await revokeCharge(ref(item.payment_intent), '', 'disputa');
        break;
    }
  } catch (error) {
    // 500 hace que Stripe reintente.
    await alertTeam(`webhook de Stripe (${event.type})`, error);
    await sql`UPDATE stripe_events SET error = ${String(error instanceof Error ? error.message : error).slice(0, 500)} WHERE id = ${event.id}`;
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  await sql`UPDATE stripe_events SET processed_at = now(), error = NULL WHERE id = ${event.id}`;
  return NextResponse.json({ received: true });
}
