import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

type PodcastLead = {
  kind?: string;
  data?: Record<string, unknown>;
  attribution?: Record<string, unknown>;
  path?: string;
  referrer?: string;
};

function text(value: unknown) {
  return String(value ?? '').trim();
}

function leadName(lead: PodcastLead) {
  return text(lead.data?.nombre) || 'Sin nombre';
}

function leadEmail(lead: PodcastLead) {
  return text(lead.data?.email);
}

function serializeGroup(title: string, values?: Record<string, unknown>) {
  if (!values) return '';
  return [
    title,
    ...Object.entries(values).map(([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(', ') : text(value)}`,
    ),
  ].join('\n');
}

function buildBody(lead: PodcastLead) {
  return [
    'Nuevo lead de Cluster Podcast',
    `Tipo: ${text(lead.kind)}`,
    `Ruta: ${text(lead.path)}`,
    `Referencia: ${text(lead.referrer) || 'directo'}`,
    '',
    serializeGroup('Datos', lead.data),
    '',
    serializeGroup('Atribución', lead.attribution),
  ].join('\n');
}

async function sendWithResend(subject: string, body: string, replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'Cluster Podcast <onboarding@resend.dev>',
      to: [site.email],
      reply_to: replyTo || undefined,
      subject,
      text: body,
    }),
  });
  if (!response.ok) throw new Error(`resend_failed: ${await response.text()}`);
  return 'resend';
}

async function sendWithFormSubmit(lead: PodcastLead, subject: string, body: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: leadName(lead),
      email: leadEmail(lead) || site.email,
      phone: text(lead.data?.telefono),
      company: text(lead.data?.empresa),
      message: body,
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    }),
  });
  if (!response.ok) throw new Error(`formsubmit_failed: ${await response.text()}`);
  return 'formsubmit';
}

export async function POST(request: Request) {
  let lead: PodcastLead;
  try {
    lead = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const kind = text(lead.kind);
  const nombre = leadName(lead);
  const telefono = text(lead.data?.telefono);
  if (!kind || nombre === 'Sin nombre' || !telefono) {
    return NextResponse.json({ ok: false, error: 'missing_required_fields' }, { status: 400 });
  }

  const subject = `Cluster Podcast | ${kind} | ${nombre}`;
  const body = buildBody(lead);
  const webhook = process.env.PODCAST_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'cluster-podcast', subject, body, ...lead }),
      });
      if (!response.ok) throw new Error(`webhook_failed: ${await response.text()}`);
      return NextResponse.json({ ok: true, channel: 'webhook' });
    } catch (error) {
      console.error('[podcast-lead] webhook error:', error);
      return NextResponse.json({ ok: false, error: 'webhook_failed' }, { status: 502 });
    }
  }

  try {
    const resend = await sendWithResend(subject, body, leadEmail(lead));
    if (resend) return NextResponse.json({ ok: true, channel: resend });
    return NextResponse.json({ ok: true, channel: await sendWithFormSubmit(lead, subject, body) });
  } catch (error) {
    console.error('[podcast-lead] delivery error:', error);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
