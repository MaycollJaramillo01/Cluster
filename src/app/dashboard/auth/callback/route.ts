import { NextResponse, type NextRequest } from 'next/server';
import { finishGoogle, SESSION_COOKIE, sessionCookieOptions, STATE_COOKIE } from '@/lib/crm/session';

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
  if (!('session' in result)) return failed(result.error);
  const response = NextResponse.redirect(new URL('/dashboard', origin));
  response.cookies.set(STATE_COOKIE, '', sessionCookieOptions(0));
  response.cookies.set(SESSION_COOKIE, result.session, sessionCookieOptions());
  return response;
}
