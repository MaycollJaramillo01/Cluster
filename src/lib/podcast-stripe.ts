type CheckoutData = Record<string, unknown>;

export type PodcastCheckoutSession = {
  id: string;
  url?: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  status: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string> | null;
};

function secretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || '';
}

async function stripeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const key = secretKey();
  if (!key) throw new Error('stripe_not_configured');

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`stripe_request_failed_${response.status}`);
  return response.json() as Promise<T>;
}

function field(data: CheckoutData, name: string, maxLength = 500) {
  return String(data[name] ?? '').trim().slice(0, maxLength);
}

export async function createPodcastCheckoutSession(data: CheckoutData, origin: string, returnPath: string) {
  const form = new URLSearchParams();
  const name = field(data, 'nombre');
  const email = field(data, 'email', 254).toLowerCase();
  const phone = field(data, 'telefono', 80);
  const company = field(data, 'empresa');
  const flow = 'podcast-commercial-interview';

  form.set('mode', 'payment');
  form.set('locale', 'es');
  form.set('submit_type', 'book');
  form.set('customer_email', email);
  form.set('phone_number_collection[enabled]', 'true');
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', 'usd');
  form.set('line_items[0][price_data][unit_amount]', '60000');
  form.set('line_items[0][price_data][product_data][name]', 'Entrevista comercial en Cluster Podcast');
  form.set('line_items[0][price_data][product_data][description]', 'Entrevista de podcast con producción y distribución multiplataforma.');
  form.set('success_url', `${origin}${returnPath}/gracias?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${origin}${returnPath}/gracias?payment=cancelled&session_id={CHECKOUT_SESSION_ID}`);

  const metadata = {
    flow,
    return_path: returnPath,
    nombre: name,
    email,
    telefono: phone,
    empresa: company,
    instagram: field(data, 'instagram'),
    categoria: field(data, 'businessType'),
    antiguedad: field(data, 'businessAge'),
    temas: Array.isArray(data.storyTypes) ? data.storyTypes.map(String).join(', ').slice(0, 500) : '',
    historia: field(data, 'story'),
  };

  for (const [key, value] of Object.entries(metadata)) {
    form.set(`metadata[${key}]`, value);
    form.set(`payment_intent_data[metadata][${key}]`, value);
  }

  return stripeRequest<PodcastCheckoutSession>('checkout/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
}

export async function getPodcastCheckoutSession(sessionId: string) {
  return stripeRequest<PodcastCheckoutSession>(`checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export function isPaidPodcastSession(session: PodcastCheckoutSession | null | undefined) {
  return Boolean(
    session &&
    session.payment_status === 'paid' &&
    session.amount_total === 60000 &&
    session.currency?.toLowerCase() === 'usd' &&
    session.metadata?.flow === 'podcast-commercial-interview',
  );
}

export function checkoutFormData(session: PodcastCheckoutSession | null | undefined) {
  const metadata = session?.metadata;
  if (!metadata || metadata.flow !== 'podcast-commercial-interview') return null;

  return {
    nombre: metadata.nombre || '',
    email: metadata.email || '',
    telefono: metadata.telefono || '',
    empresa: metadata.empresa || '',
    instagram: metadata.instagram || '',
    businessType: metadata.categoria || '',
    businessAge: metadata.antiguedad || '',
    storyTypes: metadata.temas || '',
    story: metadata.historia || '',
  };
}
