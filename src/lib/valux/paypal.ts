import { crm } from '@/lib/crm/db';
import { hnlToUsdCents } from './money';

export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

function paypalLive() {
  return process.env.PAYPAL_MODE === 'live';
}

function paypalBase() {
  return paypalLive() ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function paypalToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('PayPal no autenticó la academia');
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function paypalApi<T>(path: string, body?: unknown) {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PayPal respondió ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function toCents(value?: string) {
  return Math.round(Number(value || 0) * 100) || 0;
}

export async function createPaypalOrder(input: {
  amountCents: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const data = await paypalApi<{ id?: string; links?: { rel: string; href: string }[] }>('/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: input.description.slice(0, 120),
        amount: { currency_code: 'USD', value: dollars(hnlToUsdCents(input.amountCents)) },
      },
    ],
    application_context: {
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      user_action: 'PAY_NOW',
    },
  });
  const approve = data.links?.find((link) => link.rel === 'approve')?.href;
  if (!data.id || !approve) throw new Error('PayPal no devolvió el enlace de pago');
  return { id: data.id, approveUrl: approve };
}

type PaypalOrder = {
  status?: string;
  purchase_units?: { payments?: { captures?: { amount?: { value?: string } }[] }; amount?: { value?: string } }[];
};

function orderAmount(data: PaypalOrder) {
  const unit = data.purchase_units?.[0];
  return toCents(unit?.payments?.captures?.[0]?.amount?.value || unit?.amount?.value);
}

// El retorno y el webhook pueden llegar juntos: si la captura ya la hizo el otro,
// PayPal rechaza la segunda y se lee la orden.
export async function paypalOrderPaid(orderId: string) {
  const id = encodeURIComponent(orderId);
  let data: PaypalOrder;
  try {
    data = await paypalApi<PaypalOrder>(`/v2/checkout/orders/${id}/capture`, {});
  } catch {
    data = await paypalApi<PaypalOrder>(`/v2/checkout/orders/${id}`);
  }
  return { paid: data.status === 'COMPLETED', amountCents: orderAmount(data) };
}

// Un plan mensual por precio. Se guarda en crm_meta para no crearlo en cada compra.
async function paypalPlan(amountCents: number) {
  const sql = await crm();
  const mode = paypalLive() ? 'live' : 'sandbox';
  const planKey = `paypal_plan_${mode}_${amountCents}`;
  const cached = await sql`SELECT value FROM crm_meta WHERE key = ${planKey}`;
  const known = (cached[0] as { value?: string } | undefined)?.value;
  if (known) return known;

  const productKey = `paypal_product_${mode}`;
  const products = await sql`SELECT value FROM crm_meta WHERE key = ${productKey}`;
  let productId = (products[0] as { value?: string } | undefined)?.value || '';
  if (!productId) {
    const product = await paypalApi<{ id?: string }>('/v1/catalogs/products', {
      name: 'Suscripción de la academia',
      type: 'DIGITAL',
    });
    if (!product.id) throw new Error('PayPal no creó el producto');
    productId = product.id;
    await sql`INSERT INTO crm_meta (key, value) VALUES (${productKey}, ${productId}) ON CONFLICT (key) DO NOTHING`;
  }

  const plan = await paypalApi<{ id?: string }>('/v1/billing/plans', {
    product_id: productId,
    name: `Academia mensual ${dollars(hnlToUsdCents(amountCents))} USD`,
    billing_cycles: [
      {
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: dollars(hnlToUsdCents(amountCents)), currency_code: 'USD' } },
      },
    ],
    payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 1 },
  });
  if (!plan.id) throw new Error('PayPal no creó el plan');
  await sql`INSERT INTO crm_meta (key, value) VALUES (${planKey}, ${plan.id}) ON CONFLICT (key) DO NOTHING`;
  return plan.id;
}

export async function createPaypalSubscription(input: {
  amountCents: number;
  email: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const data = await paypalApi<{ id?: string; links?: { rel: string; href: string }[] }>('/v1/billing/subscriptions', {
    plan_id: await paypalPlan(input.amountCents),
    subscriber: { email_address: input.email },
    application_context: {
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      user_action: 'SUBSCRIBE_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  });
  const approve = data.links?.find((link) => link.rel === 'approve')?.href;
  if (!data.id || !approve) throw new Error('PayPal no devolvió el enlace de suscripción');
  return { id: data.id, approveUrl: approve };
}

export async function readPaypalSubscription(id: string) {
  const data = await paypalApi<{ status?: string; billing_info?: { next_billing_time?: string } }>(
    `/v1/billing/subscriptions/${encodeURIComponent(id)}`,
  );
  const next = data.billing_info?.next_billing_time;
  return { status: data.status || '', periodEnd: next ? new Date(next) : null };
}

export async function cancelPaypalSubscription(id: string) {
  await paypalApi(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, { reason: 'Cancelada desde la academia' });
}

// Cobros ya hechos de una suscripción; el id coincide con el del webhook PAYMENT.SALE.COMPLETED.
export async function paypalSubscriptionPayments(id: string) {
  const end = new Date();
  const start = new Date(end.getTime() - 400 * 24 * 60 * 60 * 1000);
  const data = await paypalApi<{
    transactions?: { id?: string; status?: string; amount_with_breakdown?: { gross_amount?: { value?: string } } }[];
  }>(
    `/v1/billing/subscriptions/${encodeURIComponent(id)}/transactions?start_time=${start.toISOString()}&end_time=${end.toISOString()}`,
  );
  return (data.transactions || [])
    .filter((item) => item.id && item.status === 'COMPLETED')
    .map((item) => ({ id: item.id as string, amountCents: toCents(item.amount_with_breakdown?.gross_amount?.value) }));
}

// PayPal verifica su propia firma; hace falta el id del webhook creado en el panel de PayPal.
export async function verifyPaypalEvent(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId || !paypalConfigured()) return false;
  try {
    const data = await paypalApi<{ verification_status?: string }>('/v1/notifications/verify-webhook-signature', {
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    });
    return data.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}

export async function sendPaypalPayout(input: { payoutId: string; email: string; amountCents: number }) {
  if (!paypalConfigured() || !input.email || input.amountCents <= 0) return false;
  try {
    await paypalApi('/v1/payments/payouts', {
      sender_batch_header: {
        sender_batch_id: input.payoutId,
        email_subject: 'Liquidación de la academia',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: dollars(hnlToUsdCents(input.amountCents)), currency: 'USD' },
          receiver: input.email,
          sender_item_id: input.payoutId,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
