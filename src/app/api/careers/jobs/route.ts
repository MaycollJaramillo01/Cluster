import { NextResponse } from 'next/server';
import { createJob, listJobs, updateJob } from '@/lib/careers/jobs';
import { readAdminSession, unauthorizedIfGuest } from '@/lib/careers/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await readAdminSession();
  const jobs = await listJobs();
  return NextResponse.json({
    ok: true,
    jobs: session ? jobs : jobs.filter((item) => item.open),
  });
}

export async function POST(request: Request) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  let body: {
    title?: string;
    summary?: string;
    description?: string;
    location?: string;
    employment?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const result = await createJob({
    title: String(body.title ?? ''),
    summary: String(body.summary ?? ''),
    description: String(body.description ?? ''),
    location: String(body.location ?? ''),
    employment: String(body.employment ?? ''),
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, job: result.job });
}

export async function PATCH(request: Request) {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  let body: {
    slug?: string;
    title?: string;
    summary?: string;
    description?: string;
    location?: string;
    employment?: string;
    open?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const slug = String(body.slug ?? '').trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 400 });
  }

  const result = await updateJob(slug, {
    title: body.title,
    summary: body.summary,
    description: body.description,
    location: body.location,
    employment: body.employment,
    open: body.open,
  });
  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, job: result.job });
}
