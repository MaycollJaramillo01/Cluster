import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { captureLead, leadDetails } from '@/lib/crm/leads';
import { site } from '@/lib/site';
import {
  EDITORIAL_FIELD_LABELS,
  editorialLeadFromInput,
  podcastLogoContentType,
  podcastLogoError,
  type EditorialProfile,
} from '@/lib/podcast-editorial';

export const runtime = 'nodejs';
export const maxDuration = 30;

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

function printable(value: unknown) {
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (Array.isArray(value)) return value.map((item) => text(item)).join(', ');
  return text(value);
}

function serializeGroup(title: string, values?: Record<string, unknown>) {
  if (!values) return '';
  return [
    title,
    ...Object.entries(values).map(([key, value]) => `${key}: ${printable(value)}`),
  ].join('\n');
}

function serializeEditorial(values?: Record<string, unknown>) {
  const data = values ?? {};
  const used = new Set<string>();
  const lines = (Object.entries(EDITORIAL_FIELD_LABELS) as [keyof EditorialProfile, string][]).map(([key, label]) => {
    used.add(key);
    return `${label}: ${printable(data[key])}`;
  });
  for (const [key, value] of Object.entries(data)) {
    if (!used.has(key)) lines.push(`${key}: ${printable(value)}`);
  }
  return ['Datos', ...lines].join('\n');
}

function buildBody(lead: PodcastLead) {
  const dataBlock = text(lead.kind) === 'editorial'
    ? serializeEditorial(lead.data)
    : serializeGroup('Datos', lead.data);
  return [
    'Nuevo lead de Cluster Podcast',
    `Tipo: ${text(lead.kind)}`,
    `Ruta: ${text(lead.path)}`,
    `Referencia: ${text(lead.referrer) || 'directo'}`,
    '',
    dataBlock,
    '',
    serializeGroup('Atribución', lead.attribution),
  ].join('\n');
}

function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  ).trim();
}

function attributionFrom(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(text(value)) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
}

function leadFromFormData(form: FormData) {
  const data: Record<string, unknown> = {};
  let logo: File | null = null;
  for (const [key, value] of form.entries()) {
    if (key === 'kind' || key === 'attribution' || key === 'path' || key === 'referrer') continue;
    if (key === 'logotipo') {
      if (typeof value !== 'string' && value.size > 0) logo = value;
      continue;
    }
    if (typeof value === 'string') data[key] = value.trim();
  }
  const lead: PodcastLead = {
    kind: text(form.get('kind')),
    data,
    attribution: attributionFrom(form.get('attribution')),
    path: text(form.get('path')),
    referrer: text(form.get('referrer')),
  };
  return { lead, logo };
}

async function storeLogo(file: File) {
  const token = blobToken();
  if (!token) throw new Error('logo_storage_unavailable');
  const contentType = podcastLogoContentType(file);
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const date = new Date().toISOString().slice(0, 10);
  const blob = await put(`podcast-leads/logos/${date}/${crypto.randomUUID()}.${extension}`, file, {
    token,
    access: 'public',
    addRandomSuffix: false,
    contentType,
  });
  return blob.url;
}

async function persistLead(lead: PodcastLead) {
  const token = blobToken();
  if (!token) return null;

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const date = createdAt.slice(0, 10);
  await put(
    `podcast-leads/${date}/${createdAt.replaceAll(':', '-')}-${id}.json`,
    JSON.stringify({ id, createdAt, ...lead }, null, 2),
    {
      token,
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    },
  );
  return 'blob';
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
  const contentType = request.headers.get('content-type') || '';
  let lead: PodcastLead;
  let logo: File | null = null;

  if (contentType.includes('multipart/form-data')) {
    try {
      const parsed = leadFromFormData(await request.formData());
      lead = parsed.lead;
      logo = parsed.logo;
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_form' }, { status: 400 });
    }
  } else {
    try {
      lead = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }
  }

  const kind = text(lead.kind);
  const nombre = leadName(lead);
  const telefono = text(lead.data?.telefono);
  if (!kind || nombre === 'Sin nombre' || !telefono) {
    return NextResponse.json({ ok: false, error: 'missing_required_fields' }, { status: 400 });
  }

  if (kind === 'editorial') {
    const normalized = editorialLeadFromInput(lead.data ?? {});
    if (!normalized.ok) {
      return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 });
    }
    const data: Record<string, unknown> = { ...normalized.data };
    if (logo) {
      const logoProblem = podcastLogoError(logo);
      if (logoProblem) return NextResponse.json({ ok: false, error: logoProblem }, { status: 400 });
      try {
        data.logotipo = await storeLogo(logo);
      } catch (error) {
        console.error('[podcast-lead] logo error:', error);
        return NextResponse.json(
          { ok: false, error: blobToken() ? 'logo_upload_failed' : 'logo_storage_unavailable' },
          { status: 502 },
        );
      }
    }
    lead.data = data;
  }

  try {
    const data = lead.data ?? {};
    await captureLead({
      name: text(data.nombre) || nombre,
      email: text(data.email),
      phone: telefono,
      city: text(data.ciudad),
      state: text(data.departamento),
      country: text(data.pais) || text(data.country),
      form: `podcast-${kind}`,
      details: leadDetails(data),
    });
  } catch (error) {
    console.error('[podcast-lead] crm:', error);
  }

  const subject = `Cluster Podcast | ${kind} | ${nombre}`;
  const body = buildBody(lead);
  const webhook = process.env.PODCAST_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  const channels: string[] = [];

  try {
    const storage = await persistLead(lead);
    if (storage) channels.push(storage);
  } catch (error) {
    console.error('[podcast-lead] Blob storage error:', error);
  }

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'cluster-podcast', subject, body, ...lead }),
      });
      if (!response.ok) throw new Error(`webhook_failed: ${await response.text()}`);
      channels.push('webhook');
    } catch (error) {
      console.error('[podcast-lead] webhook error:', error);
    }
  }

  let emailDelivered = false;

  try {
    const resend = await sendWithResend(subject, body, leadEmail(lead));
    if (resend) {
      channels.push(resend);
      emailDelivered = true;
    }
  } catch (error) {
    console.error('[podcast-lead] Resend error:', error);
  }

  if (!emailDelivered && channels.length === 0) {
    try {
      channels.push(await sendWithFormSubmit(lead, subject, body));
    } catch (error) {
      console.error('[podcast-lead] FormSubmit error:', error);
    }
  }

  if (channels.length > 0) {
    return NextResponse.json({ ok: true, channels });
  }

  return NextResponse.json(
    { ok: false, error: 'delivery_failed' },
    { status: 502 },
  );
}
