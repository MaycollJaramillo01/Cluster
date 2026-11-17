import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { saveInbound } from '@/lib/crm/inbound';

export const runtime = 'nodejs';

// Meta verifica la URL una vez con hub.verify_token.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (expected && params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === expected) {
    return new NextResponse(params.get('hub.challenge') || '', { status: 200 });
  }
  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}

function signed(raw: string, header: string) {
  const secret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!secret || !header.startsWith('sha256=')) return false;
  const given = Buffer.from(header.slice(7), 'hex');
  const expected = createHmac('sha256', secret).update(raw).digest();
  return given.length === expected.length && timingSafeEqual(given, expected);
}

type Message = {
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
};

type Payload = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: Message[];
      };
    }[];
  }[];
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!signed(raw, request.headers.get('x-hub-signature-256') || '')) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }
  let payload: Payload;
  try {
    payload = JSON.parse(raw) as Payload;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  try {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        for (const message of value.messages || []) {
          const from = message.from || '';
          const name = value.contacts?.find((item) => item.wa_id === from)?.profile?.name || '';
          const body =
            message.text?.body ||
            message.button?.text ||
            message.interactive?.button_reply?.title ||
            message.interactive?.list_reply?.title ||
            `[${message.type || 'mensaje'} sin texto]`;
          await saveInbound({ channel: 'whatsapp', from, name, body });
        }
      }
    }
  } catch (error) {
    console.error('[crm] whatsapp entrante:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
