import { NextResponse, type NextRequest } from 'next/server';
import { allowedEmails, beginGoogle, googleConfigured, sessionCookieOptions, STATE_COOKIE } from '@/lib/crm/session';

export async function GET(request: NextRequest) {
  const login = new URL('/dashboard/login', request.nextUrl.origin);
  if (!googleConfigured()) {
    login.searchParams.set('error', 'config');
    return NextResponse.redirect(login);
  }
  if (!allowedEmails().length) {
    login.searchParams.set('error', 'lista');
    return NextResponse.redirect(login);
  }
  const { state, url } = beginGoogle(request.nextUrl.origin);
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, sessionCookieOptions(60 * 10));
  return response;
}
