import { NextResponse } from 'next/server';
import { fulfillStripeSession, recordSubscriptionPayment, setSubscriptionEnded } from '@/lib/valux/fulfill';
import { verifyStripeEvent } from '@/lib/valux/stripe';

export const runtime = 'nodejs';

function ref(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id?: unknown }).id || '');
  return '';
}

// Webhook de Stripe: entrega aunque el alumno cierre la pestaña y lleva las renovaciones.
export async function POST(request: Request) {
  const raw = await request.text();
  const event = verifyStripeEvent(raw, request.headers.get('stripe-signature') || '');
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  const item = event.data.object;

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
    }
  } catch (error) {
    // 500 hace que Stripe reintente.
    console.error('[academia] stripe webhook:', event.type, error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
