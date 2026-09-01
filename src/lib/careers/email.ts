import { site } from '@/lib/site';
import type { Application } from './types';

function asText(value: unknown) {
  return String(value ?? '').trim();
}

export function buildApplicationEmail(application: Application) {
  const files = application.files.length
    ? application.files.map((file) => `- ${file.originalName} (${file.field})`).join('\n')
    : '—';

  return [
    `Nueva postulación · ${application.jobSlug}`,
    '',
    `Nombre: ${application.name}`,
    `Email: ${application.email}`,
    `WhatsApp: ${application.whatsapp}`,
    `País: ${application.country}`,
    `Aspiración salarial (USD): ${application.salaryUsd}`,
    `Portafolio URL: ${application.portfolioUrl || '—'}`,
    `LinkedIn: ${application.linkedin || '—'}`,
    `Archivos:`,
    files,
    '',
    `Perfil: ${site.url}/postulaciones/${application.id}`,
  ].join('\n');
}

export async function notifyApplication(application: Application) {
  const subject = `Postulación · Editor de video · ${application.name}`;
  const body = buildApplicationEmail(application);
  const apiKey = process.env.RESEND_API_KEY;
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'cluster-website-careers',
          to: site.email,
          subject,
          application,
          body,
        }),
      });
    } catch (error) {
      console.error('[careers] webhook error:', error);
    }
  }

  if (!apiKey) return;

  const from = process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [site.email],
        reply_to: asText(application.email) || undefined,
        subject,
        text: body,
      }),
    });
  } catch (error) {
    console.error('[careers] email error:', error);
  }
}
