import { cookies } from 'next/headers';

export const ACADEMIA_COOKIE = 'cluster_academia';

export async function academiaPersonId() {
  const jar = await cookies();
  return jar.get(ACADEMIA_COOKIE)?.value || '';
}

export async function setAcademiaPerson(id: string) {
  const jar = await cookies();
  jar.set(ACADEMIA_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
    secure: process.env.NODE_ENV === 'production',
  });
}
