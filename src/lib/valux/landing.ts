import { NextResponse } from 'next/server';
import type { Fulfilled } from './fulfill';

// Pagar por un correo no demuestra ser su dueño. La sesión se obtiene con el código.
export function academiaLanding(result: Fulfilled, origin: string) {
  if (!result) return NextResponse.redirect(new URL('/academia?error=pago', origin));
  const response = NextResponse.redirect(new URL(result.path, origin));
  return response;
}
