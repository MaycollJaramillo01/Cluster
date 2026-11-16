import { NextResponse } from 'next/server';
import { ACADEMIA_COOKIE, academiaCookieOptions, academiaCookieValue, readLoginLinkToken } from '@/lib/valux/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = readLoginLinkToken(url.searchParams.get('t') || '');
  if (!id) return NextResponse.redirect(new URL('/academia/entrar?error=enlace', url.origin));
  const response = NextResponse.redirect(new URL('/academia', url.origin));
  response.cookies.set(ACADEMIA_COOKIE, academiaCookieValue(id), academiaCookieOptions);
  return response;
}
