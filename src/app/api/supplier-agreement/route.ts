import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

type AgreementPayload = {
  decision?: unknown;
  supplier?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function buildNotification(payload: { decision: 'si' | 'no'; supplier: string }) {
  const decisionLabel = payload.decision === 'si' ? 'Sí' : 'No';
  const receivedAt = new Date();
  const receivedAtLabel = new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'America/Tegucigalpa',
  }).format(receivedAt);

  return {
    subject: `Acuerdo de proveedores | ${decisionLabel} | ${payload.supplier}`,
    body: [
      'Nueva respuesta al Acuerdo de Buenas Prácticas para Proveedores Externos',
      '',
      `Proveedor: ${payload.supplier}`,
      `Respuesta: ${decisionLabel}`,
      `Fecha: ${receivedAtLabel}`,
      `Fecha ISO: ${receivedAt.toISOString()}`,
    ].join('\n'),
    decisionLabel,
    receivedAt: receivedAt.toISOString(),
  };
}

async function sendViaResend(subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const from = process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [site.email],
      subject,
      text: body,
    }),
  });

  if (!response.ok) throw new Error(`resend_failed: ${await response.text()}`);
  return 'resend' as const;
}

async function sendViaFormSubmit(subject: string, body: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: 'Acuerdo de proveedores',
      message: body,
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    }),
  });

  if (!response.ok) throw new Error(`formsubmit_failed: ${await response.text()}`);
  return 'formsubmit' as const;
}

export async function POST(request: Request) {
  let input: AgreementPayload;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const decision = cleanText(input.decision, 2);
  if (decision !== 'si' && decision !== 'no') {
    return NextResponse.json({ ok: false, error: 'invalid_decision' }, { status: 400 });
  }

  const supplier = cleanText(input.supplier, 80) || 'Proveedor no identificado';
  const notification = buildNotification({ decision, supplier });
  const webhook =
    process.env.SUPPLIER_AGREEMENT_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;

  try {
    if (webhook) {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'cluster-supplier-agreement',
          to: site.email,
          supplier,
          decision,
          decisionLabel: notification.decisionLabel,
          receivedAt: notification.receivedAt,
          subject: notification.subject,
          body: notification.body,
        }),
      });

      if (!response.ok) throw new Error(`webhook_failed: ${response.status}`);
      return NextResponse.json({ ok: true, channel: 'webhook' });
    }

    const viaResend = await sendViaResend(notification.subject, notification.body);
    if (viaResend) return NextResponse.json({ ok: true, channel: viaResend });

    const viaFormSubmit = await sendViaFormSubmit(
      notification.subject,
      notification.body,
    );
    return NextResponse.json({ ok: true, channel: viaFormSubmit });
  } catch (error) {
    console.error('[supplier-agreement] notification error:', error);
    return NextResponse.json(
      { ok: false, error: 'notification_failed' },
      { status: 502 },
    );
  }
}
