import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { saveInbound } from '@/lib/crm/inbound';

export const runtime = 'nodejs';

// Firma de Twilio: HMAC-SHA1 (base64) de la URL pública + cada parámetro ordenado como clave+valor.
function signed(url: string, params: URLSearchParams, header: string) {
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!token || !header) return false;
  const data = [...new Set(params.keys())].sort().reduce((text, key) => text + key + (params.get(key) ?? ''), url);
  const expected = Buffer.from(createHmac('sha1', token).update(data).digest('base64'));
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function publicUrl(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  return `${proto}://${host}${url.pathname}${url.search}`;
}

export async function POST(request: Request) {
  const params = new URLSearchParams(await request.text());
  if (!signed(publicUrl(request), params, request.headers.get('x-twilio-signature') || '')) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }
  try {
    await saveInbound({ channel: 'sms', from: params.get('From') || '', body: params.get('Body') || '' });
  } catch (error) {
    console.error('[crm] sms entrante:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  // TwiML vacío: no responde nada automático al remitente.
  return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
}
