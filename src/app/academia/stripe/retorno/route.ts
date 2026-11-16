import { NextResponse } from 'next/server';
import { fulfillStripeSession } from '@/lib/valux/fulfill';
import { academiaLanding } from '@/lib/valux/landing';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id') || '';
  try {
    return academiaLanding(sessionId ? await fulfillStripeSession(sessionId) : null, url.origin);
  } catch {
    return NextResponse.redirect(new URL('/academia?error=pago', url.origin));
  }
}
