import { NextResponse } from 'next/server';
import { fulfillPaypalOrder, fulfillPaypalSubscription } from '@/lib/valux/fulfill';
import { academiaLanding } from '@/lib/valux/landing';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Una suscripción vuelve con subscription_id; un pago único, con token (id de la orden).
  const subscriptionId = url.searchParams.get('subscription_id') || '';
  const token = url.searchParams.get('token') || '';
  try {
    const result = subscriptionId
      ? await fulfillPaypalSubscription(subscriptionId)
      : token
        ? await fulfillPaypalOrder(token)
        : null;
    return academiaLanding(result, url.origin);
  } catch {
    return NextResponse.redirect(new URL('/academia?error=pago', url.origin));
  }
}
