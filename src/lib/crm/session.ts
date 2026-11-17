import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { crm } from './db';
import { canDo, homeFor, isStaffRole, type Area, type StaffRole } from './roles';

export const SESSION_COOKIE = 'cluster_dashboard';
export const STATE_COOKIE = 'cluster_oauth_state';
export const MFA_COOKIE = 'cluster_mfa';
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;
const MFA_MS = 1000 * 60 * 10;

export type DashboardSession = { email: string; name: string; role: StaffRole };

export const PRIMARY_ADMIN = 'leandromatiasgonz@gmail.com';

const DEFAULT_ADMINS = [PRIMARY_ADMIN];

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function allowedEmails() {
  const raw = `${DEFAULT_ADMINS.join(',')},${process.env.DASHBOARD_ALLOWED_EMAILS || ''},${process.env.CAREERS_ADMIN_EMAILS || ''}`;
  return [...new Set(raw.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export function googleRedirectUri(origin: string) {
  return `${origin}/dashboard/auth/callback`;
}

// Los correos de la lista del servidor son superadmin; el resto del equipo vive en crm_staff.
export async function staffRole(email: string): Promise<StaffRole | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  if (allowedEmails().includes(normalized)) return 'superadmin';
  const sql = await crm();
  const rows = await sql`SELECT role FROM crm_staff WHERE email = ${normalized}`;
  const role = String((rows[0] as { role?: string } | undefined)?.role || '');
  return isStaffRole(role) ? role : null;
}

// El rol se lee de la base en cada pedido: quitar a alguien del equipo lo saca en el acto.
export async function dashboardSession(): Promise<DashboardSession | null> {
  const jar = await cookies();
  const session = readSession(jar.get(SESSION_COOKIE)?.value || '');
  if (!session) return null;
  const role = await staffRole(session.email);
  // Si el rol cambió, la cookie (que usa el middleware) quedó vieja: hay que volver a entrar.
  if (!role || role !== session.role) return null;
  return { email: session.email, name: session.name, role };
}

export function beginGoogle(origin: string) {
  const state = randomBytes(24).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: googleRedirectUri(origin),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return { state, url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
}

export async function finishGoogle(origin: string, code: string, state: string, expected: string): Promise<
  { error: 'state' | 'google' | 'cuenta' } | { pending: string }
> {
  if (!same(state, expected)) return { error: 'state' as const };
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: googleRedirectUri(origin),
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  });
  if (!tokenResponse.ok) return { error: 'google' as const };
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return { error: 'google' as const };

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: 'no-store',
  });
  if (!profileResponse.ok) return { error: 'google' as const };
  const profile = (await profileResponse.json()) as { email?: string; email_verified?: boolean; name?: string };
  const email = (profile.email || '').trim().toLowerCase();
  if (!email || profile.email_verified === false || !(await staffRole(email))) return { error: 'cuenta' as const };
  // Google es el primer factor: el segundo (TOTP) sigue siendo obligatorio.
  return { pending: issuePending(email, profile.name || email) };
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { ...cookieOptions(0), maxAge: 0 });
}

export function sessionCookieOptions(maxAge = SESSION_MS / 1000) {
  return cookieOptions(maxAge);
}

// Solo se emite después del segundo factor. El rol va en la cookie para el middleware;
// el servidor igual lo vuelve a leer de la base.
export function issueSession(email: string, name: string, role: StaffRole) {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), name, role, mfa: true, exp: Date.now() + SESSION_MS }),
  ).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

function readSigned(token: string) {
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !same(sig, signature(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      email?: string;
      name?: string;
      exp?: number;
      mfa?: boolean;
      stage?: string;
      role?: string;
    };
    const email = (data.email || '').trim().toLowerCase();
    if (!email || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { ...data, email, name: data.name || email };
  } catch {
    return null;
  }
}

// Sesiones de antes del segundo factor (sin mfa) ya no sirven.
function readSession(token: string) {
  const data = readSigned(token);
  return data?.mfa === true ? { email: data.email, name: data.name, role: data.role || '' } : null;
}

// Primer factor aprobado: 10 minutos para escribir el código.
export function issuePending(email: string, name: string) {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), name, stage: 'mfa', exp: Date.now() + MFA_MS }),
  ).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export async function pendingLogin() {
  const jar = await cookies();
  const data = readSigned(jar.get(MFA_COOKIE)?.value || '');
  return data?.stage === 'mfa' ? { email: data.email, name: data.name } : null;
}

export function pendingCookieOptions(maxAge = MFA_MS / 1000) {
  return cookieOptions(maxAge);
}

function signature(value: string) {
  const secret = signingSecret();
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function same(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/dashboard',
    maxAge,
  };
}

// Secreto compartido por las cookies del panel, de /postulaciones y de la academia.
// El repo es público: nunca un valor por defecto en producción.
export function signingSecret() {
  const secret = (
    process.env.CAREERS_AUTH_SECRET ||
    process.env.DASHBOARD_AUTH_SECRET ||
    process.env.CAREERS_ADMIN_PASSWORD ||
    ''
  ).trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('Falta CAREERS_AUTH_SECRET');
  return 'cluster-dev-only-secret';
}

// La primera clave de una cuenta de dueño solo se acepta si es la clave de
// administrador del servidor: sin esto, quien llegue primero se queda con la cuenta.
export function bootstrapPasswordOk(password: string) {
  const setup = (process.env.CAREERS_ADMIN_PASSWORD || '').trim();
  if (!setup) return process.env.NODE_ENV !== 'production';
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(password), digest(setup));
}

// Toda server action del panel la llama primero: el redirect del layout no
// protege los POST directos a una acción.
// Sin área, la acción es del CRM: solo superadmin.
export async function requireDashboard(area: Area = 'crm') {
  const session = await dashboardSession();
  if (!session) redirect('/dashboard/login');
  if (!canDo(session.role, area)) redirect(homeFor(session.role));
  return session;
}
