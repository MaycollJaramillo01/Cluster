import { NextResponse } from 'next/server';
import {
  clearSession,
  hasPassword,
  isAdminRequest,
  setupPassword,
  verifyPassword,
  withSession,
} from '@/lib/careers/auth';

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

function locked(ip: string) {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || now > row.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  return row.count >= 8;
}

function fail(ip: string) {
  const row = attempts.get(ip) ?? { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  row.count += 1;
  attempts.set(ip, row);
}

export async function GET() {
  if (await isAdminRequest()) {
    return NextResponse.json({ ok: true, authed: true });
  }
  const configured = await hasPassword();
  return NextResponse.json({
    ok: false,
    authed: false,
    setup: !configured,
  });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (locked(ip)) {
    return NextResponse.json({ ok: false, error: 'locked' }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const password = String(body.password ?? '');
  if (!(await hasPassword())) {
    return NextResponse.json({ ok: false, error: 'needs_setup' }, { status: 400 });
  }
  if (!(await verifyPassword(password))) {
    fail(ip);
    return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 });
  }

  attempts.delete(ip);
  return withSession(NextResponse.json({ ok: true, authed: true }));
}

export async function PUT(request: Request) {
  const ip = clientIp(request);
  if (locked(ip)) {
    return NextResponse.json({ ok: false, error: 'locked' }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const password = String(body.password ?? '');
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: 'password_too_short' }, { status: 400 });
  }

  const result = await setupPassword(password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  attempts.delete(ip);
  return withSession(NextResponse.json({ ok: true, authed: true }));
}

export async function DELETE() {
  return clearSession(NextResponse.json({ ok: true, authed: false }));
}
