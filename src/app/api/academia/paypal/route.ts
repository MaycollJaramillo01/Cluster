import { NextResponse } from 'next/server';
import {
  fulfillPaypalOrder,
  fulfillPaypalSubscription,
  recordSubscriptionPayment,
  setSubscriptionEnded,
} from '@/lib/valux/fulfill';
import { readPaypalSubscription, verifyPaypalEvent } from '@/lib/valux/paypal';

export const runtime = 'nodejs';

type PaypalEvent = {
  event_type?: string;
  resource?: { id?: string; billing_agreement_id?: string; amount?: { total?: string } };
};

// Webhook de PayPal: captura órdenes aprobadas y lleva las renovaciones.
export async function POST(request: Request) {
  let event: PaypalEvent;
  try {
    event = (await request.json()) as PaypalEvent;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!(await verifyPaypalEvent(request.headers, event))) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }
  const resource = event.resource || {};
  const id = resource.id || '';

  try {
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await fulfillPaypalOrder(id);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await fulfillPaypalSubscription(id);
        break;
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id || '';
        if (!subscriptionId) break;
        const subscription = await readPaypalSubscription(subscriptionId).catch(() => null);
        const known = await recordSubscriptionPayment({
          gatewayId: subscriptionId,
          paymentId: id,
          amountCents: Math.round(Number(resource.amount?.total || 0) * 100),
          periodEnd: subscription?.periodEnd ?? null,
        });
        // Primer cobro antes de que el alumno vuelva: se da de alta desde el intento.
        if (!known) await fulfillPaypalSubscription(subscriptionId);
        break;
      }
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await setSubscriptionEnded(id, 'no_renueva');
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await setSubscriptionEnded(id, 'vencida');
        break;
    }
  } catch (error) {
    const { alertTeam } = await import('@/lib/valux/alerts');
    await alertTeam(`webhook de PayPal (${event.event_type})`, error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
