import { NextResponse } from 'next/server';
import { createPodcastCheckoutSession } from '@/lib/podcast-stripe';

export const runtime = 'nodejs';

function text(value: unknown, maxLength = 500) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  let body: { data?: Record<string, unknown>; returnPath?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const data = body.data || {};
  const name = text(data.nombre, 120);
  const email = text(data.email, 254).toLowerCase();
  const phone = text(data.telefono, 80);
  const company = text(data.empresa, 160);
  const returnPath = text(body.returnPath, 240).replace(/\/$/, '');
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allowedPath = /^\/(?:[a-z]{2}\/)?participa\/asegura-tu-participacion$/i.test(returnPath);

  if (!name || !emailIsValid || !phone || !company || data.consent !== true || data.apoyo === true || !allowedPath) {
    return NextResponse.json({ ok: false, error: 'invalid_checkout_request' }, { status: 400 });
  }

  try {
    const session = await createPodcastCheckoutSession(data, new URL(request.url).origin, returnPath);
    if (!session.url) return NextResponse.json({ ok: false, error: 'checkout_unavailable' }, { status: 502 });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    const status = error instanceof Error && error.message === 'stripe_not_configured' ? 503 : 502;
    console.error('[podcast-checkout] Stripe session could not be created.', status);
    return NextResponse.json({ ok: false, error: status === 503 ? 'stripe_not_configured' : 'checkout_unavailable' }, { status });
  }
}
