import { NextResponse } from 'next/server';
import {
  clearSession,
  createResetToken,
  isAdminRequest,
  loginUser,
  lookupEmail,
  normalizeEmail,
  readAdminSession,
  registerUser,
  resetPassword,
  setupUserPassword,
  withSession,
} from '@/lib/careers/auth';
import { notifyUserSignup, sendCareersResetEmail } from '@/lib/careers/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  );
}

function locked(key: string) {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || now > row.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  return row.count >= 8;
}

function fail(key: string) {
  const row = attempts.get(key) ?? { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  row.count += 1;
  attempts.set(key, row);
}

type Body = {
  action?: string;
  email?: string;
  password?: string;
  token?: string;
  name?: string;
};

export async function GET() {
  const session = await readAdminSession();
  if (session) {
    return NextResponse.json({
      ok: true,
      authed: true,
      email: session.email,
      name: session.name,
      role: session.role,
      pendingCount: session.pendingCount,
    });
  }
  return NextResponse.json({ ok: false, authed: false });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const action = String(body.action ?? 'login');
  const email = String(body.email ?? '');
  const password = String(body.password ?? '');
  const token = String(body.token ?? '');
  const name = String(body.name ?? '');
  const key = `${ip}:${action}`;

  if (action !== 'lookup' && locked(key)) {
    return NextResponse.json({ ok: false, error: 'locked' }, { status: 429 });
  }

  if (action === 'lookup') {
    const next = await lookupEmail(email);
    return NextResponse.json({ ok: true, next });
  }

  if (action === 'register') {
    const result = await registerUser({ email, password, name });
    if (!result.ok) {
      fail(key);
      const status = result.error === 'already_registered' ? 409 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    attempts.delete(key);
    if (result.authed) {
      return withSession(
        NextResponse.json({
          ok: true,
          authed: true,
          email: result.email,
          name: result.name,
          status: result.status,
        }),
        result.email,
      );
    }
    await notifyUserSignup({ name: result.name, email: result.email });
    return NextResponse.json({
      ok: true,
      authed: false,
      email: result.email,
      status: result.status,
    });
  }

  if (action === 'setup') {
    const result = await setupUserPassword(email, password, name);
    if (!result.ok) {
      fail(key);
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    attempts.delete(key);
    return withSession(
      NextResponse.json({ ok: true, authed: true, email: result.email, name: result.name }),
      result.email,
    );
  }

  if (action === 'login') {
    const result = await loginUser(email, password);
    if (!result.ok) {
      fail(key);
      const status =
        result.error === 'needs_setup' || result.error === 'pending' ? 400 : 401;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    attempts.delete(key);
    return withSession(
      NextResponse.json({
        ok: true,
        authed: true,
        email: result.email,
        name: result.name,
        role: result.role,
      }),
      result.email,
    );
  }

  if (action === 'forgot') {
    const origin = new URL(request.url).origin;
    const result = await createResetToken(email);
    if (result.token) {
      const resetUrl = `${origin}/postulaciones?reset=${result.token}`;
      await sendCareersResetEmail(normalizeEmail(email), resetUrl);
    }
    return NextResponse.json({ ok: true, sent: true });
  }

  if (action === 'reset') {
    const result = await resetPassword(token, password);
    if (!result.ok) {
      fail(key);
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    attempts.delete(key);
    return withSession(
      NextResponse.json({ ok: true, authed: true, email: result.email, name: result.name }),
      result.email,
    );
  }

  return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
}

export async function DELETE() {
  if (!(await isAdminRequest())) {
    return clearSession(NextResponse.json({ ok: true, authed: false }));
  }
  return clearSession(NextResponse.json({ ok: true, authed: false }));
}
