import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

type ContactPayload = {
  nombre?: string;
  empresa?: string;
  pais?: string;
  ciudad?: string;
  email?: string;
  telefono?: string;
  website?: string;
  servicio?: string;
  mensaje?: string;
  origen?: string;
  auditUrl?: string;
  auditScore?: string | number;
  attribution?: Record<string, string>;
  calculator?: unknown;
};

function asText(value: unknown) {
  return String(value ?? '').trim();
}

function buildEmailBody(lead: ContactPayload) {
  const lines = [
    'Nuevo contacto desde el website de Cluster Media',
    '',
    `Nombre: ${asText(lead.nombre)}`,
    `Empresa: ${asText(lead.empresa)}`,
    `País: ${asText(lead.pais)}`,
    `Ciudad: ${asText(lead.ciudad)}`,
    `Email: ${asText(lead.email)}`,
    `Teléfono: ${asText(lead.telefono)}`,
    `Website/IG: ${asText(lead.website)}`,
    `Servicio de interés: ${asText(lead.servicio)}`,
    `Origen: ${asText(lead.origen) || 'contacto'}`,
  ];

  if (lead.attribution) {
    lines.push(
      '',
      'Atribución',
      ...Object.entries(lead.attribution).map(
        ([key, value]) => `${key}: ${asText(value) || '—'}`,
      ),
    );
  }

  if (lead.calculator != null) {
    lines.push(
      '',
      'Calculadora (voluntaria):',
      typeof lead.calculator === 'string'
        ? lead.calculator
        : JSON.stringify(lead.calculator, null, 2),
    );
  }

  if (lead.auditUrl || lead.auditScore) {
    lines.push(
      '',
      'Contexto SEO Audit',
      `URL auditada: ${asText(lead.auditUrl)}`,
      `Score: ${asText(lead.auditScore)}`,
    );
  }

  if (lead.mensaje) {
    lines.push('', 'Mensaje:', asText(lead.mensaje));
  }

  return lines.join('\n');
}

async function sendViaResend(subject: string, body: string, replyTo: string) {
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
      reply_to: replyTo || undefined,
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`resend_failed: ${detail}`);
  }

  return 'resend' as const;
}

async function sendViaFormSubmit(lead: ContactPayload, subject: string, body: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: asText(lead.nombre),
      email: asText(lead.email),
      phone: asText(lead.telefono),
      company: asText(lead.empresa),
      country: asText(lead.pais),
      city: asText(lead.ciudad),
      service: asText(lead.servicio),
      message: body,
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`formsubmit_failed: ${detail}`);
  }

  return 'formsubmit' as const;
}

export async function POST(request: Request) {
  let lead: ContactPayload;

  try {
    lead = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const nombre = asText(lead.nombre);
  const email = asText(lead.email);
  const pais = asText(lead.pais);

  if (!nombre || !email || !pais) {
    return NextResponse.json(
      { ok: false, error: 'missing_required_fields' },
      { status: 400 },
    );
  }

  const subject = lead.servicio
    ? `Contacto web · ${asText(lead.servicio)} · ${nombre}`
    : `Contacto web · ${nombre}`;
  const body = buildEmailBody(lead);

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'cluster-website-contact',
          to: site.email,
          subject,
          ...lead,
          body,
        }),
      });
      return NextResponse.json({ ok: res.ok, channel: 'webhook' });
    } catch (error) {
      console.error('[contact] webhook error:', error);
      return NextResponse.json({ ok: false, channel: 'webhook' }, { status: 502 });
    }
  }

  try {
    const viaResend = await sendViaResend(subject, body, email);
    if (viaResend) {
      return NextResponse.json({ ok: true, channel: viaResend });
    }

    const viaFormSubmit = await sendViaFormSubmit(lead, subject, body);
    return NextResponse.json({ ok: true, channel: viaFormSubmit });
  } catch (error) {
    console.error('[contact] email error:', error);
    console.info('[contact] lead fallback log:', { subject, body, lead });
    return NextResponse.json(
      {
        ok: false,
        error: 'email_failed',
        mailto: `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      },
      { status: 502 },
    );
  }
}
