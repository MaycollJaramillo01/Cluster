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

// Con error devuelve el código y el correo (para no escribirlo de nuevo); si todo está bien, pasa al segundo factor.
export async function login(previous: { error: string; email: string; attempt: number }, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  // attempt cambia en cada error, para que el campo vuelva a marcarse aunque el mensaje sea el mismo.
  const fail = (error: string) => ({ error, email, attempt: previous.attempt + 1 });
  if (password.length < 8) return fail('corta');
  // Correo desconocido y clave incorrecta dan el mismo mensaje: el formulario no revela quién es del equipo.
  if (!(await staffRole(email))) return fail('clave');

  if (!(await adminHasPassword(email))) {
    // Sin clave guardada solo puede arrancar el dueño, con la clave del servidor.
    if (email !== PRIMARY_ADMIN || !isAdminEmail(email)) return fail('clave');
    if (!bootstrapPasswordOk(password)) return fail('setup');
    await saveAdminPassword(email, password);
  } else if (!(await passwordMatches(email, password))) {
    return fail('clave');
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
