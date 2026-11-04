import { NextResponse } from 'next/server';
import { crm } from '@/lib/crm/db';
import { capturePaypalOrder } from '@/lib/valux/paypal';
import { readStripeCheckout } from '@/lib/valux/stripe';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id') || '';
  const token = url.searchParams.get('token') || '';
  const gatewayId = sessionId || token;
  if (!gatewayId) return NextResponse.redirect(new URL('/dashboard/tienda?error=pago', url.origin));

  try {
    if (sessionId) {
      const session = await readStripeCheckout(sessionId);
      if (!session.paid) return NextResponse.redirect(new URL('/dashboard/tienda?error=pago', url.origin));
    } else {
      const captured = await capturePaypalOrder(token);
      if (captured.status !== 'COMPLETED') return NextResponse.redirect(new URL('/dashboard/tienda?error=pago', url.origin));
    }
    const sql = await crm();
    await sql`UPDATE orders SET status = 'pagado' WHERE gateway_id = ${gatewayId}`;
    return NextResponse.redirect(new URL('/dashboard/tienda?ok=1', url.origin));
  } catch {
    return NextResponse.redirect(new URL('/dashboard/tienda?error=pago', url.origin));
  }
}
