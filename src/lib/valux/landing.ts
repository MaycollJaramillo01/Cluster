import { NextResponse } from 'next/server';
import type { Fulfilled } from './fulfill';
import { ACADEMIA_COOKIE, academiaCookieOptions, academiaCookieValue } from './session';

// Retorno de la pasarela: entra al alumno y lo deja en lo que compró.
export function academiaLanding(result: Fulfilled, origin: string) {
  if (!result) return NextResponse.redirect(new URL('/academia?error=pago', origin));
  const response = NextResponse.redirect(new URL(result.path, origin));
  if (result.personId) {
    response.cookies.set(ACADEMIA_COOKIE, academiaCookieValue(result.personId), academiaCookieOptions);
  }
  return response;
}
