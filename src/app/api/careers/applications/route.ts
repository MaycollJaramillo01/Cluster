import { NextResponse } from 'next/server';
import { listApplications, pingBlob } from '@/lib/careers/store';
import { unauthorizedIfGuest } from '@/lib/careers/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const [applications, blob] = await Promise.all([listApplications(), pingBlob()]);
  return NextResponse.json({ ok: true, applications, blob });
}
