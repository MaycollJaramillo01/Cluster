'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminHasPassword, isAdminEmail, passwordMatches, saveAdminPassword } from './admins';
import { checkMfa } from './mfa';
import { homeFor } from './roles';
import {
  bootstrapPasswordOk,
  clearSession,
  dashboardSession,
  issuePending,
  issueSession,
  MFA_COOKIE,
  pendingCookieOptions,
  pendingLogin,
  PRIMARY_ADMIN,
  SESSION_COOKIE,
  sessionCookieOptions,
  staffRole,
} from './session';

export async function dashboardUnlocked() {
  return Boolean(await dashboardSession());
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!(await staffRole(email))) redirect('/dashboard/login?error=cuenta');
  if (password.length < 8) redirect('/dashboard/login?error=corta');

  if (!(await adminHasPassword(email))) {
    // Sin clave guardada solo puede arrancar el dueño, con la clave del servidor.
    if (email !== PRIMARY_ADMIN || !isAdminEmail(email)) redirect('/dashboard/login?error=cuenta');
    if (!bootstrapPasswordOk(password)) redirect('/dashboard/login?error=setup');
    await saveAdminPassword(email, password);
  } else if (!(await passwordMatches(email, password))) {
    redirect('/dashboard/login?error=clave');
  }

  // La clave es el primer factor; la sesión sale recién con el código TOTP.
  const jar = await cookies();
  jar.set(MFA_COOKIE, issuePending(email, 'Administrador'), pendingCookieOptions());
  redirect('/dashboard/login/mfa');
}

export async function confirmMfa(formData: FormData) {
  const pending = await pendingLogin();
  if (!pending) redirect('/dashboard/login?error=vencido');
  const role = await staffRole(pending.email);
  if (!role) redirect('/dashboard/login?error=cuenta');
  const result = await checkMfa(pending.email, String(formData.get('code') ?? ''));
  if (result !== 'ok') redirect(`/dashboard/login/mfa?error=${result === 'locked' ? 'bloqueado' : 'codigo'}`);
  const jar = await cookies();
  jar.set(MFA_COOKIE, '', pendingCookieOptions(0));
  jar.set(SESSION_COOKIE, issueSession(pending.email, pending.name, role), sessionCookieOptions());
  redirect(homeFor(role));
}

export async function logout() {
  await clearSession();
  const jar = await cookies();
  jar.set(MFA_COOKIE, '', pendingCookieOptions(0));
  redirect('/dashboard/login');
}
