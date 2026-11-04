'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminHasPassword, isAdminEmail, passwordMatches, saveAdminPassword } from './admins';
import { clearSession, dashboardSession, issueSession, PRIMARY_ADMIN, SESSION_COOKIE, sessionCookieOptions } from './session';

export async function dashboardUnlocked() {
  return Boolean(await dashboardSession());
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!isAdminEmail(email)) redirect('/dashboard/login?error=cuenta');
  if (password.length < 8) redirect('/dashboard/login?error=corta');

  if (!(await adminHasPassword(email))) {
    if (email !== PRIMARY_ADMIN) redirect('/dashboard/login?error=cuenta');
    await saveAdminPassword(email, password);
  } else if (!(await passwordMatches(email, password))) {
    redirect('/dashboard/login?error=clave');
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, issueSession(email, 'Administrador'), sessionCookieOptions());
  redirect('/dashboard');
}

export async function logout() {
  await clearSession();
  redirect('/dashboard/login');
}
