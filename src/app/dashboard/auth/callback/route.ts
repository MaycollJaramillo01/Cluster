import { NextResponse, type NextRequest } from 'next/server';
import { finishGoogle, MFA_COOKIE, pendingCookieOptions, sessionCookieOptions, STATE_COOKIE } from '@/lib/crm/session';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get('code') || '';
  const state = request.nextUrl.searchParams.get('state') || '';
  const expected = request.cookies.get(STATE_COOKIE)?.value || '';
  const failed = (error: string) => {
    const response = NextResponse.redirect(new URL(`/dashboard/login?error=${error}`, origin));
    response.cookies.set(STATE_COOKIE, '', sessionCookieOptions(0));
    return response;
  };
  if (request.nextUrl.searchParams.get('error') || !code || !state) return failed('google');
  const result = await finishGoogle(origin, code, state, expected);
  if (!('pending' in result)) return failed(result.error);
  const response = NextResponse.redirect(new URL('/dashboard/login/mfa', origin));
  response.cookies.set(STATE_COOKIE, '', sessionCookieOptions(0));
  response.cookies.set(MFA_COOKIE, result.pending, pendingCookieOptions());
  return response;
}
