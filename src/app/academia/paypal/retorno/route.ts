import { NextResponse } from 'next/server';
import { getIntent } from '@/lib/valux/data';
import { alreadyPaid, grantAccess } from '@/lib/valux/fulfill';
import { capturePaypalOrder } from '@/lib/valux/paypal';
import { ACADEMIA_COOKIE } from '@/lib/valux/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const intent = token ? await getIntent(token) : null;
  if (!intent) return NextResponse.redirect(new URL('/academia?error=pago', url.origin));

  try {
    const paid = await alreadyPaid(token);
    if (!paid) {
      const captured = await capturePaypalOrder(token);
      if (captured.status !== 'COMPLETED' || captured.amountCents + 1 < intent.amountCents) {
        return NextResponse.redirect(new URL('/academia?error=pago', url.origin));
      }
    }
    const result = await grantAccess({
      kind: intent.kind,
      itemId: intent.itemId || null,
      name: intent.name,
      email: intent.email,
      months: intent.months,
      monthlyCents: intent.kind === 'donacion' ? Math.round(intent.amountCents / Math.max(1, intent.months)) : undefined,
      paypalOrderId: token,
    });
    const response = NextResponse.redirect(new URL(result.path, url.origin));
    if (result.personId) {
      response.cookies.set(ACADEMIA_COOKIE, result.personId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  } catch {
    return NextResponse.redirect(new URL('/academia?error=pago', url.origin));
  }
}
