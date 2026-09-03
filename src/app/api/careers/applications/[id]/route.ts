import { NextResponse } from 'next/server';
import { getApplication, updateApplication } from '@/lib/careers/store';
import { coerceStatus } from '@/lib/careers/types';
import type { ApplicationPatchInput } from '@/lib/careers/types';
import { unauthorizedIfGuest } from '@/lib/careers/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const { id } = await context.params;
  const application = await getApplication(id);
  if (!application) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application });
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const { id } = await context.params;
  let body: ApplicationPatchInput;
  try {
    body = (await request.json()) as ApplicationPatchInput;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (body.status !== undefined && !coerceStatus(String(body.status))) {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 400 });
  }

  if (
    body.status === undefined &&
    body.rating === undefined &&
    body.tags === undefined &&
    body.nextAction === undefined &&
    body.nextActionAt === undefined &&
    body.rejectionReason === undefined &&
    !body.note?.text
  ) {
    return NextResponse.json({ ok: false, error: 'empty_patch' }, { status: 400 });
  }

  const patch: ApplicationPatchInput = {
    actor: String(body.actor ?? '').trim(),
  };
  if (body.status !== undefined) patch.status = String(body.status);
  if (body.rating !== undefined) patch.rating = Number(body.rating);
  if (body.tags !== undefined) {
    patch.tags = Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : [];
  }
  if (body.nextAction !== undefined) patch.nextAction = String(body.nextAction);
  if (body.nextActionAt !== undefined) patch.nextActionAt = String(body.nextActionAt);
  if (body.rejectionReason !== undefined) {
    patch.rejectionReason = String(body.rejectionReason);
  }
  if (body.note?.text) {
    patch.note = {
      author: String(body.note.author ?? '').trim(),
      text: String(body.note.text),
    };
  }

  const application = await updateApplication(id, patch);
  if (!application) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application });
}
