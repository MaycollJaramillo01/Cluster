import { NextResponse } from 'next/server';
import { probeBlobWrite } from '@/lib/careers/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const blob = await probeBlobWrite();
  return NextResponse.json({ ok: blob.ok, blob });
}
