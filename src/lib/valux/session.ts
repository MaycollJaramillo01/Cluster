import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { signingSecret } from '@/lib/crm/session';

export const ACADEMIA_COOKIE = 'cluster_academia';

export const academiaCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 90,
  secure: process.env.NODE_ENV === 'production',
};

function sign(value: string) {
  return createHmac('sha256', signingSecret()).update(`academia:${value}`).digest('base64url');
}

function verified(value: string, sig: string) {
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(value));
  return a.length === b.length && timingSafeEqual(a, b);
}

// La cookie lleva el id firmado: sin firma, conocer un id bastaría para entrar como otra persona.
export function academiaCookieValue(id: string) {
  return `${id}.${sign(id)}`;
}

export async function academiaPersonId() {
  const jar = await cookies();
  const raw = jar.get(ACADEMIA_COOKIE)?.value || '';
  const cut = raw.lastIndexOf('.');
  if (cut < 1) return '';
  const id = raw.slice(0, cut);
  return verified(id, raw.slice(cut + 1)) ? id : '';
}

export async function setAcademiaPerson(id: string) {
  const jar = await cookies();
  jar.set(ACADEMIA_COOKIE, academiaCookieValue(id), academiaCookieOptions);
}
