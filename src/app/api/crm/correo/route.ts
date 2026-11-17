import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { saveInbound } from '@/lib/crm/inbound';

export const runtime = 'nodejs';

// Webhook de Resend (firmado con Svix): HMAC-SHA256 de "id.timestamp.cuerpo" con el secreto whsec_.
function signed(raw: string, headers: Headers) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET?.trim();
  const id = headers.get('svix-id') || '';
  const stamp = headers.get('svix-timestamp') || '';
  const signatures = (headers.get('svix-signature') || '').split(' ');
  if (!secret || !id || !stamp || Math.abs(Date.now() / 1000 - Number(stamp)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = Buffer.from(createHmac('sha256', key).update(`${id}.${stamp}.${raw}`).digest('base64'));
  return signatures.some((item) => {
    const given = Buffer.from(item.split(',')[1] || '');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

type Received = {
  type?: string;
  data?: { email_id?: string; id?: string; from?: string; subject?: string; text?: string };
};

function sender(from: string) {
  const match = from.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>/);
  return match ? { name: match[1].trim(), email: match[2].trim() } : { name: '', email: from.trim() };
}

// El aviso no siempre trae el cuerpo; se pide a la API de correos recibidos.
async function bodyOf(data: NonNullable<Received['data']>) {
  if (data.text) return data.text;
  const id = data.email_id || data.id;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!id || !key) return '';
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return '';
    const email = (await res.json()) as { text?: string };
    return email.text || '';
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!signed(raw, request.headers)) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  let event: Received;
  try {
    event = JSON.parse(raw) as Received;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (event.type !== 'email.received' || !event.data) return NextResponse.json({ received: true });
  try {
    const who = sender(event.data.from || '');
    const text = await bodyOf(event.data);
    const subject = event.data.subject ? `Asunto: ${event.data.subject}\n\n` : '';
    await saveInbound({ channel: 'email', from: who.email, name: who.name, body: `${subject}${text}` || '(correo sin texto)' });
  } catch (error) {
    console.error('[crm] correo entrante:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
