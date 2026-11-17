import { createHmac, timingSafeEqual } from 'crypto';
import { site } from '@/lib/site';
import { crm } from './db';
import { deliverEmail, deliverSms, deliverWhatsapp, emailConfigured, smsConfigured, whatsappConfigured } from './deliver';
import { signingSecret } from './session';

// Enlace de baja firmado: el correo va en el token, así no hace falta guardar nada aparte.
function unsubscribeSignature(email: string) {
  return createHmac('sha256', signingSecret()).update(`baja:${email}`).digest('base64url');
}

export function unsubscribeToken(email: string) {
  const clean = email.trim().toLowerCase();
  return `${Buffer.from(clean).toString('base64url')}.${unsubscribeSignature(clean)}`;
}

export function readUnsubscribeToken(token: string) {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return '';
  const email = Buffer.from(encoded, 'base64url').toString('utf8');
  const expected = Buffer.from(unsubscribeSignature(email));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected) ? email : '';
}

function publicBase() {
  return process.env.NODE_ENV === 'production' ? site.url : process.env.LOCAL_SITE_URL || 'http://localhost:3000';
}

export function unsubscribeUrl(email: string) {
  return `${publicBase()}/api/crm/baja?t=${unsubscribeToken(email)}`;
}

// Encola a toda la audiencia. El envío lo hacen processCampaignSends y la tarea programada.
export async function queueCampaign(campaignId: string, channel: string) {
  const sql = await crm();
  if (channel === 'email') {
    if (!emailConfigured()) return { ready: false, queued: 0, reason: 'correo' };
    await sql`
      INSERT INTO campaign_sends (id, campaign_id, channel, recipient, name)
      SELECT gen_random_uuid()::text, ${campaignId}, 'email', lower(email), name
      FROM subscribers WHERE status = 'subscribed'
      ON CONFLICT (campaign_id, recipient) DO NOTHING
    `;
  } else {
    const via = whatsappConfigured() ? 'whatsapp' : smsConfigured() ? 'sms' : '';
    if (!via) return { ready: false, queued: 0, reason: 'canal' };
    await sql`
      INSERT INTO campaign_sends (id, campaign_id, channel, recipient, name)
      SELECT gen_random_uuid()::text, ${campaignId}, ${via}, regexp_replace(phone, '[^0-9]', '', 'g'), name
      FROM contacts WHERE phone IS NOT NULL AND length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 8
      ON CONFLICT (campaign_id, recipient) DO NOTHING
    `;
  }
  const rows = await sql`SELECT count(*)::int AS total FROM campaign_sends WHERE campaign_id = ${campaignId}`;
  return { ready: true, queued: Number((rows[0] as { total?: number } | undefined)?.total) || 0, reason: '' };
}

// ponytail: lote secuencial; si las listas crecen a decenas de miles, pasar a la API batch de Resend.
export async function processCampaignSends(limit = 80, campaignId?: string) {
  const sql = await crm();
  const claimed = campaignId
    ? await sql`
        UPDATE campaign_sends SET status = 'enviando', sent_at = now()
        WHERE id IN (
          SELECT id FROM campaign_sends WHERE status = 'pendiente' AND campaign_id = ${campaignId}
          ORDER BY id LIMIT ${limit} FOR UPDATE SKIP LOCKED
        )
        RETURNING id, campaign_id, channel, recipient, name
      `
    : await sql`
        UPDATE campaign_sends SET status = 'enviando', sent_at = now()
        WHERE id IN (
          SELECT id FROM campaign_sends
          WHERE status = 'pendiente' OR (status = 'enviando' AND sent_at < now() - interval '15 minutes')
          ORDER BY id LIMIT ${limit} FOR UPDATE SKIP LOCKED
        )
        RETURNING id, campaign_id, channel, recipient, name
      `;
  if (!claimed.length) return { sent: 0, failed: 0 };

  const ids = [...new Set(claimed.map((row) => String((row as { campaign_id: string }).campaign_id)))];
  const campaigns = await sql`SELECT id, name, subject, body FROM campaigns WHERE id = ANY(${ids})`;
  const byId = new Map(campaigns.map((row) => [String((row as { id: string }).id), row as { name?: string; subject?: string; body?: string }]));

  let sent = 0;
  let failed = 0;
  for (const row of claimed) {
    const item = row as { id: string; campaign_id: string; channel: string; recipient: string; name?: string };
    const campaign = byId.get(item.campaign_id);
    const body = String(campaign?.body || '');
    let ok = false;
    if (campaign && body) {
      if (item.channel === 'email') {
        const link = unsubscribeUrl(item.recipient);
        ok = await deliverEmail(
          item.recipient,
          String(campaign.subject || campaign.name || 'Cluster'),
          `Hola ${item.name || ''},\n\n${body}\n\n—\nSi no querés recibir más correos: ${link}\n`,
          undefined,
          { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        );
      } else if (item.channel === 'whatsapp') {
        ok = await deliverWhatsapp(item.recipient, body);
      } else if (item.channel === 'sms') {
        ok = await deliverSms(item.recipient, body);
      }
    }
    await sql`UPDATE campaign_sends SET status = ${ok ? 'enviado' : 'fallido'}, sent_at = now() WHERE id = ${item.id}`;
    if (ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}
