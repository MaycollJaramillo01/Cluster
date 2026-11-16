import { createHmac, timingSafeEqual } from 'crypto';
import { paypalConfigured } from './paypal';

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function paymentReady() {
  return paypalConfigured() || stripeConfigured();
}

async function stripeApi<T>(path: string, init?: { method?: string; body?: URLSearchParams }) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init?.method || (init?.body ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init?.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: init?.body,
  });
  if (!res.ok) throw new Error(`Stripe respondió ${res.status} en ${path.split('/')[0]}`);
  return (await res.json()) as T;
}

export async function createStripeCheckout(input: {
  amountCents: number;
  description: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  // Suscripción: cobro mensual que Stripe repite solo.
  recurring?: boolean;
}) {
  const body = new URLSearchParams();
  body.set('mode', input.recurring ? 'subscription' : 'payment');
  body.set('customer_email', input.email);
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'usd');
  body.set('line_items[0][price_data][unit_amount]', String(input.amountCents));
  body.set('line_items[0][price_data][product_data][name]', input.description.slice(0, 120));
  if (input.recurring) body.set('line_items[0][price_data][recurring][interval]', 'month');
  for (const [key, value] of Object.entries(input.metadata)) {
    body.set(`metadata[${key}]`, value);
    if (input.recurring) body.set(`subscription_data[metadata][${key}]`, value);
  }
  const data = await stripeApi<{ id?: string; url?: string }>('checkout/sessions', { body });
  if (!data.id || !data.url) throw new Error('Stripe no devolvió el enlace de pago');
  return { id: data.id, url: data.url };
}

export async function readStripeCheckout(sessionId: string) {
  const data = await stripeApi<{
    payment_status?: string;
    amount_total?: number;
    metadata?: Record<string, string>;
    subscription?: string | { id?: string } | null;
    invoice?: string | { id?: string } | null;
  }>(`checkout/sessions/${encodeURIComponent(sessionId)}`);
  const ref = (value: string | { id?: string } | null | undefined) =>
    typeof value === 'string' ? value : value?.id || '';
  return {
    paid: data.payment_status === 'paid',
    amountCents: Number(data.amount_total) || 0,
    metadata: data.metadata || {},
    subscriptionId: ref(data.subscription),
    invoiceId: ref(data.invoice),
  };
}

export async function readStripeSubscription(id: string) {
  const data = await stripeApi<{
    status?: string;
    current_period_end?: number;
    items?: { data?: { current_period_end?: number }[] };
  }>(`subscriptions/${encodeURIComponent(id)}`);
  // Las versiones nuevas de la API movieron el fin del periodo a cada item.
  const end = Number(data.current_period_end ?? data.items?.data?.[0]?.current_period_end) || 0;
  return { status: data.status || '', periodEnd: end ? new Date(end * 1000) : null };
}

export async function cancelStripeSubscription(id: string, atPeriodEnd: boolean) {
  const path = `subscriptions/${encodeURIComponent(id)}`;
  if (atPeriodEnd) {
    await stripeApi(path, { body: new URLSearchParams({ cancel_at_period_end: 'true' }) });
  } else {
    await stripeApi(path, { method: 'DELETE' });
  }
}

export type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

// Firma de Stripe: HMAC-SHA256 de "t.cuerpo" con el secreto del endpoint, 5 minutos de tolerancia.
export function verifyStripeEvent(raw: string, header: string): StripeEvent | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !header) return null;
  const parts = header.split(',').map((part) => part.split('='));
  const stamp = parts.find(([key]) => key === 't')?.[1] || '';
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value || '');
  if (!stamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(stamp)) > 300) return null;
  const expected = createHmac('sha256', secret).update(`${stamp}.${raw}`).digest();
  const valid = signatures.some((value) => {
    const given = Buffer.from(value, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!valid) return null;
  try {
    return JSON.parse(raw) as StripeEvent;
  } catch {
    return null;
  }
}
