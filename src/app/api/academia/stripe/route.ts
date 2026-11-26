import { NextResponse } from 'next/server';
import { crm } from '@/lib/crm/db';
import { alertTeam } from '@/lib/valux/alerts';
import { sendPaymentFailed } from '@/lib/valux/followups';
import { fulfillStripeSession, recordSubscriptionPayment, revokeSales, setSubscriptionEnded } from '@/lib/valux/fulfill';
import { cancelStripeSubscription, stripePaymentRefs, verifyStripeEvent } from '@/lib/valux/stripe';
import { CURRENCY } from '@/lib/valux/money';

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
        await fulfillStripeSession(ref(item.id), event.type);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        type SubscriptionDetails = { subscription?: unknown; metadata?: Record<string, string> };
        const parent = item.parent as { subscription_details?: SubscriptionDetails } | undefined;
        const subscriptionId = ref(item.subscription) || ref(parent?.subscription_details?.subscription);
        if (!subscriptionId) break;
        const metadata = parent?.subscription_details?.metadata ?? (item.subscription_details as SubscriptionDetails | undefined)?.metadata;
        const owned = metadata?.kind === 'suscripcion' && Boolean(metadata.buyer_email);
        if (!owned) {
          const [known] = await sql`SELECT 1 FROM valux_subscriptions WHERE gateway_id = ${subscriptionId}`;
          if (!known) break;
        }
        const isAcademyCurrency = String(item.currency).toUpperCase() === CURRENCY;
        if (event.type === 'invoice.payment_failed') {
          await sendPaymentFailed({
            invoiceId: ref(item.id),
            email: String(item.customer_email || ''),
            amountCents: isAcademyCurrency ? Number(item.amount_due) || 0 : null,
            payUrl: String(item.hosted_invoice_url || ''),
          });
          break;
        }
        if (!isAcademyCurrency) throw new Error('Moneda de factura incorrecta');
        const lines = item.lines as { data?: { period?: { end?: number } }[] } | undefined;
        const end = Number(lines?.data?.[0]?.period?.end) || 0;
        const recorded = await recordSubscriptionPayment({
          gatewayId: subscriptionId,
          paymentId: ref(item.id),
          amountCents: Number(item.amount_paid) || 0,
          periodEnd: end ? new Date(end * 1000) : null,
        });
        if (!recorded) throw new Error('La factura llegó antes que el alta de la suscripción');
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
