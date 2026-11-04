import { NextResponse } from 'next/server';
import { getIntent } from '@/lib/valux/data';
import { alreadyPaid, grantAccess } from '@/lib/valux/fulfill';
import { ACADEMIA_COOKIE } from '@/lib/valux/session';
import { readStripeCheckout } from '@/lib/valux/stripe';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id') || '';
  const intent = sessionId ? await getIntent(sessionId) : null;
  if (!intent) return NextResponse.redirect(new URL('/academia?error=pago', url.origin));

  try {
    const paid = await alreadyPaid(sessionId);
    if (!paid) {
      const session = await readStripeCheckout(sessionId);
      if (!session.paid || session.amountCents + 1 < intent.amountCents) {
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
      paypalOrderId: sessionId,
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
