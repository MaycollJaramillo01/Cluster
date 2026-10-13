import { NextResponse } from 'next/server';
import { createContactCaptcha } from '@/lib/contact-captcha';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await createContactCaptcha(), {
      headers: { 'Cache-Control': 'no-store, private' },
    });
  } catch (error) {
    console.error('[contact] captcha unavailable:', error);
    return NextResponse.json({ ok: false, error: 'captcha_unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store, private' },
    });
  }
}
