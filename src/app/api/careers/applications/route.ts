import { NextResponse } from 'next/server';
import { listApplications, pingBlob, updateApplications } from '@/lib/careers/store';
import { unauthorizedIfGuest } from '@/lib/careers/auth';
import { coerceStatus } from '@/lib/careers/types';
import type { ApplicationPatchInput } from '@/lib/careers/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const [applications, blob] = await Promise.all([listApplications(), pingBlob()]);
  return NextResponse.json({ ok: true, applications, blob });
}

export async function PATCH(request: Request) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  let body: { ids?: string[]; patch?: ApplicationPatchInput };
  try {
    body = (await request.json()) as { ids?: string[]; patch?: ApplicationPatchInput };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map((id) => String(id)) : [];
  const patch = body.patch ?? {};
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_ids' }, { status: 400 });
  }
  if (patch.status !== undefined && !coerceStatus(String(patch.status))) {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 400 });
  }
  if (
    patch.status === undefined &&
    patch.rating === undefined &&
    patch.tags === undefined &&
    patch.nextAction === undefined &&
    patch.nextActionAt === undefined &&
    patch.rejectionReason === undefined &&
    !patch.note?.text
  ) {
    return NextResponse.json({ ok: false, error: 'empty_patch' }, { status: 400 });
  }

  const applications = await updateApplications(ids, {
    actor: String(patch.actor ?? '').trim(),
    status: patch.status !== undefined ? String(patch.status) : undefined,
    rating: patch.rating !== undefined ? Number(patch.rating) : undefined,
    tags: Array.isArray(patch.tags) ? patch.tags.map((tag) => String(tag)) : undefined,
    nextAction: patch.nextAction !== undefined ? String(patch.nextAction) : undefined,
    nextActionAt: patch.nextActionAt !== undefined ? String(patch.nextActionAt) : undefined,
    rejectionReason:
      patch.rejectionReason !== undefined ? String(patch.rejectionReason) : undefined,
    note: patch.note?.text
      ? { author: String(patch.note.author ?? '').trim(), text: String(patch.note.text) }
      : undefined,
  });

  return NextResponse.json({ ok: true, applications });
}
