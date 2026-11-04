import { paypalConfigured } from './paypal';

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function paymentReady() {
  return paypalConfigured() || stripeConfigured();
}

export async function createStripeCheckout(input: {
  amountCents: number;
  description: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('customer_email', input.email);
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'usd');
  body.set('line_items[0][price_data][unit_amount]', String(input.amountCents));
  body.set('line_items[0][price_data][product_data][name]', input.description.slice(0, 120));
  for (const [key, value] of Object.entries(input.metadata)) body.set(`metadata[${key}]`, value);
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) throw new Error('Stripe no creó el cobro');
  const data = (await res.json()) as { id?: string; url?: string };
  if (!data.id || !data.url) throw new Error('Stripe no devolvió el enlace de pago');
  return { id: data.id, url: data.url };
}

export async function readStripeCheckout(sessionId: string) {
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error('Stripe no confirmó el cobro');
  const data = (await res.json()) as {
    payment_status?: string;
    amount_total?: number;
    metadata?: Record<string, string>;
  };
  return {
    paid: data.payment_status === 'paid',
    amountCents: Number(data.amount_total) || 0,
    metadata: data.metadata || {},
  };
}
