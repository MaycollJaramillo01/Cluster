import { NextResponse } from 'next/server';
import { listApplications, pingBlob } from '@/lib/careers/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const [applications, blob] = await Promise.all([listApplications(), pingBlob()]);
  return NextResponse.json({ ok: true, applications, blob });
}
