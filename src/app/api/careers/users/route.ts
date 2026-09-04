import { NextResponse } from 'next/server';
import {
  listUsers,
  readAdminSession,
  unauthorizedIfGuest,
  updateUser,
  type UserStatus,
} from '@/lib/careers/auth';
import { notifyUserApproved } from '@/lib/careers/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const session = await readAdminSession();
  if (session?.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ ok: true, users });
}

export async function PATCH(request: Request) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const session = await readAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { email?: string; name?: string; status?: UserStatus };
  try {
    body = (await request.json()) as { email?: string; name?: string; status?: UserStatus };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = String(body.email ?? session.email);
  const status =
    body.status === 'pending' || body.status === 'approved' || body.status === 'rejected'
      ? body.status
      : undefined;
  const name = typeof body.name === 'string' ? body.name : undefined;

  const result = await updateUser({
    actorEmail: session.email,
    email,
    name,
    status,
  });

  if (!result.ok) {
    const code =
      result.error === 'unauthorized'
        ? 401
        : result.error === 'forbidden' || result.error === 'protected'
          ? 403
          : result.error === 'not_found'
            ? 404
            : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status: code });
  }

  if (status === 'approved' && result.previousStatus !== 'approved') {
    await notifyUserApproved(result.user.email, result.user.name);
  }

  return NextResponse.json({ ok: true, user: result.user });
}
