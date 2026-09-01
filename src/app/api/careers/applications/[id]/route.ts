import { NextResponse } from 'next/server';
import { getApplication, updateApplication } from '@/lib/careers/store';
import { isApplicationStatus } from '@/lib/careers/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const application = await getApplication(id);
  if (!application) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const status = String(body.status ?? '');
  if (!isApplicationStatus(status)) {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 400 });
  }

  const application = await updateApplication(id, { status });
  if (!application) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application });
}
