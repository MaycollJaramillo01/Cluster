import { NextResponse } from 'next/server';
import { probeBlobWrite } from '@/lib/careers/store';
import { unauthorizedIfGuest } from '@/lib/careers/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await unauthorizedIfGuest();
  if (denied) return denied;

  const blob = await probeBlobWrite();
  return NextResponse.json({ ok: blob.ok, blob });
}
