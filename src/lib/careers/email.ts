import { site } from '@/lib/site';
import { ownerEmails } from './auth';
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

export async function sendCareersResetEmail(to: string, resetUrl: string) {
  const subject = 'Restablecer contraseña · Selección Cluster';
  const text = [
    'Hola,',
    '',
    'Pediste restablecer la contraseña del tablero de selección.',
    'Este enlace vale 1 hora:',
    resetUrl,
    '',
    'Si no lo pediste, ignorá este correo.',
  ].join('\n');
  const apiKey = process.env.RESEND_API_KEY;
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'cluster-website-careers-reset',
          to,
          subject,
          body: text,
          resetUrl,
        }),
      });
    } catch (error) {
      console.error('[careers] reset webhook error:', error);
    }
  }

  if (!apiKey) {
    console.info('[careers] reset link (no RESEND_API_KEY):', to, resetUrl);
    return;
  }

  const from = process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
  } catch (error) {
    console.error('[careers] reset email error:', error);
  }
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

async function sendTextEmail(to: string[], subject: string, text: string, source: string) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const apiKey = process.env.RESEND_API_KEY;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, to, subject, body: text }),
      });
    } catch (error) {
      console.error(`[careers] ${source} webhook error:`, error);
    }
  }

  if (!apiKey) {
    console.info(`[careers] ${source} (no RESEND_API_KEY):`, to, subject, text);
    return;
  }

  const from = process.env.CONTACT_FROM_EMAIL || 'Cluster Media <onboarding@resend.dev>';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
  } catch (error) {
    console.error(`[careers] ${source} email error:`, error);
  }
}

export async function notifyUserSignup(input: { name: string; email: string }) {
  const boardUrl = `${site.url}/postulaciones/equipo`;
  const subject = `Nuevo acceso pendiente · ${input.name}`;
  const text = [
    'Hay un pedido de acceso al tablero de selección.',
    '',
    `Nombre: ${input.name}`,
    `Correo: ${input.email}`,
    '',
    `Revisalo acá: ${boardUrl}`,
  ].join('\n');
  await sendTextEmail(
    ownerEmails(),
    subject,
    text,
    'cluster-website-careers-signup',
  );
}

export async function notifyUserApproved(to: string, name: string) {
  const boardUrl = `${site.url}/postulaciones`;
  const subject = 'Ya podés entrar al tablero de selección · Cluster';
  const text = [
    `Hola ${name || ''},`.trim(),
    '',
    'Un admin de Cluster aprobó tu acceso al tablero de selección.',
    `Entrá con tu correo y contraseña: ${boardUrl}`,
  ].join('\n');
  await sendTextEmail([to], subject, text, 'cluster-website-careers-approved');
}
