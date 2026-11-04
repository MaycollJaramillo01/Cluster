export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

function paypalBase() {
  return process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
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

export async function createPaypalOrder(input: {
  amountCents: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: input.description.slice(0, 120),
          amount: { currency_code: 'USD', value: (input.amountCents / 100).toFixed(2) },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: 'PAY_NOW',
      },
    }),
  });
  if (!res.ok) throw new Error('PayPal no creó la orden');
  const data = (await res.json()) as { id?: string; links?: { rel: string; href: string }[] };
  const approve = data.links?.find((link) => link.rel === 'approve')?.href;
  if (!data.id || !approve) throw new Error('PayPal no devolvió el enlace de pago');
  return { id: data.id, approveUrl: approve };
}

export async function capturePaypalOrder(orderId: string) {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('PayPal no capturó el pago');
  const data = (await res.json()) as {
    status?: string;
    purchase_units?: { payments?: { captures?: { amount?: { value?: string } }[] }; amount?: { value?: string } }[];
  };
  const unit = data.purchase_units?.[0];
  const value = unit?.payments?.captures?.[0]?.amount?.value || unit?.amount?.value || '0';
  return { status: data.status || '', amountCents: Math.round(Number(value) * 100) };
}

export async function sendPaypalPayout(input: { payoutId: string; email: string; amountCents: number }) {
  if (!paypalConfigured() || !input.email || input.amountCents <= 0) return false;
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: input.payoutId,
        email_subject: 'Liquidación de la academia',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: (input.amountCents / 100).toFixed(2), currency: 'USD' },
          receiver: input.email,
          sender_item_id: input.payoutId,
        },
      ],
    }),
  });
  return res.ok;
}
