import { NextResponse } from 'next/server';
import { listApplications } from '@/lib/careers/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const applications = await listApplications();
  return NextResponse.json({ ok: true, applications });
}
