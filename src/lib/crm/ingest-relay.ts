import { crm } from './db';

const SOURCE = 'www.cluster.marketing';

function ingestConfig() {
  const url = process.env.CRM_INGEST_URL?.trim();
  const token = process.env.CRM_INGEST_TOKEN?.trim();
  if (!url && !token) return null;
  if (!url || !token || token.length < 32) throw new Error('Configuración incompleta de CRM_INGEST');
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:' || endpoint.pathname !== '/api/crm/ingest' ||
      endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('Endpoint CRM_INGEST inválido');
  }
  return { url: endpoint.href, token };
}

async function sendQueued(id: string, payload: string, config: NonNullable<ReturnType<typeof ingestConfig>>) {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      redirect: 'error',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
        'X-CRM-Source': SOURCE,
      },
      body: payload,
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;
    const receipt = await response.json();
    if (typeof receipt?.accepted !== 'boolean') return false;
    const sql = await crm();
    await sql`DELETE FROM crm_ingest_outbox WHERE id = ${id}`;
    return true;
  } catch {
    return false;
  }
}

export async function relayLead(request: Request, lead: {
  name: string; email?: string; phone?: string; country?: string; city?: string;
  state?: string; form?: string; details?: Record<string, string>; automate?: boolean;
}) {
  const config = ingestConfig();
  if (!config) return false;
  let path = '';
  let campaign = lead.details?.utm_campaign || '';
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const page = new URL(referer);
      if (page.hostname === SOURCE || page.hostname === 'cluster.marketing') {
        path = page.pathname;
        campaign ||= page.searchParams.get('utm_campaign') || '';
      }
    } catch {
      // El referente no es obligatorio.
    }
  }
  const id = crypto.randomUUID();
  const event = {
    id, name: 'lead_submitted', path: path.slice(0, 512), campaign: campaign.slice(0, 120),
    lead: {
      name: lead.name.slice(0, 150), email: lead.email?.slice(0, 254), phone: lead.phone?.slice(0, 80),
      country: lead.country?.slice(0, 80), city: lead.city?.slice(0, 120), state: lead.state?.slice(0, 120),
      form: lead.form?.slice(0, 120), automate: lead.automate === true,
      details: Object.create(null) as Record<string, string>,
    },
  };
  for (const [key, value] of Object.entries(lead.details || {})) {
    event.lead.details[key] = value.slice(0, 4000);
    if (Buffer.byteLength(JSON.stringify(event)) > 31_000) delete event.lead.details[key];
  }
  const payload = JSON.stringify(event);
  const sql = await crm();
  await sql`INSERT INTO crm_ingest_outbox (id, payload) VALUES (${id}, ${payload})`;
  await sendQueued(id, payload, config);
  return true;
}

export async function retryLeadRelay() {
  const config = ingestConfig();
  if (!config) return 0;
  const sql = await crm();
  const queued = await sql`
    SELECT id, payload FROM crm_ingest_outbox
    ORDER BY COALESCE(last_attempt_at, created_at), id LIMIT 20
  `;
  let sent = 0;
  for (const row of queued) {
    await sql`UPDATE crm_ingest_outbox SET last_attempt_at = now() WHERE id = ${row.id}`;
    if (await sendQueued(String(row.id), String(row.payload), config)) sent += 1;
  }
  return sent;
}
