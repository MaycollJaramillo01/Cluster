import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'cluster_dashboard';
export const STATE_COOKIE = 'cluster_oauth_state';
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

export type DashboardSession = { email: string; name: string };

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function allowedEmails() {
  const raw = `${process.env.DASHBOARD_ALLOWED_EMAILS || ''},${process.env.CAREERS_ADMIN_EMAILS || ''}`;
  return [...new Set(raw.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export function googleRedirectUri(origin: string) {
  return `${origin}/dashboard/auth/callback`;
}

export async function dashboardSession(): Promise<DashboardSession | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value || '');
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

export async function finishGoogle(origin: string, code: string, state: string, expected: string) {
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
  if (!email || profile.email_verified === false || !allowedEmails().includes(email)) return { error: 'cuenta' as const };

  const payload = Buffer.from(
    JSON.stringify({ email, name: profile.name || email, exp: Date.now() + SESSION_MS }),
  ).toString('base64url');
  return { session: `${payload}.${signature(payload)}` };
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { ...cookieOptions(0), maxAge: 0 });
}

export function sessionCookieOptions(maxAge = SESSION_MS / 1000) {
  return cookieOptions(maxAge);
}

function readSession(token: string): DashboardSession | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !same(sig, signature(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { email?: string; name?: string; exp?: number };
    const email = (data.email || '').trim().toLowerCase();
    if (!email || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (!allowedEmails().includes(email)) return null;
    return { email, name: data.name || email };
  } catch {
    return null;
  }
}

function signature(value: string) {
  const secret = process.env.CAREERS_AUTH_SECRET || process.env.DASHBOARD_AUTH_SECRET || 'cluster-dashboard';
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
