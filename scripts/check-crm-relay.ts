import assert from 'node:assert/strict';
import { crm } from '@/lib/crm/db';
import { captureLead } from '@/lib/crm/leads';
import { retryLeadRelay } from '@/lib/crm/ingest-relay';

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Usa npm run test:lms para aislar los datos');
  process.env.CRM_INGEST_URL = 'https://academia.example.test/api/crm/ingest';
  process.env.CRM_INGEST_TOKEN = 'token-ficticio-de-prueba-para-la-cola';

  const sent: { id: string; path: string; campaign: string; lead: { form: string; automate: boolean } }[] = [];
  const originalFetch = globalThis.fetch;
  let available = false;
  globalThis.fetch = async (input, init) => {
    if (String(input) !== process.env.CRM_INGEST_URL) return originalFetch(input, init);
    assert.equal(new Headers(init?.headers).get('x-crm-source'), 'www.cluster.marketing');
    sent.push(JSON.parse(String(init?.body)));
    return available ? Response.json({ accepted: false }) : new Response(null, { status: 503 });
  };

  try {
    const request = new Request('https://www.cluster.marketing/api/contact', {
      headers: { referer: 'https://www.cluster.marketing/es/contacto?utm_campaign=qa&email=private@example.test' },
    });
    const forms = ['contacto', 'podcast-editorial', 'ruta-local', 'acuerdo-proveedores', 'empleo-qa'];
    for (const form of forms) await captureLead({ name: 'Prueba', email: 'qa@example.test', form }, request);
    const sql = await crm();
    const [pending] = await sql`SELECT count(*)::int AS total FROM crm_ingest_outbox`;
    assert.equal(pending.total, forms.length);
    assert.deepEqual(await sql`SELECT id FROM contacts WHERE email = 'qa@example.test'`, []);
    assert.deepEqual(sent.map((event) => event.lead.form), forms);
    assert.ok(sent.every((event) => event.path === '/es/contacto' && event.campaign === 'qa' && !event.lead.automate));

    available = true;
    assert.equal(await retryLeadRelay(), forms.length);
    assert.deepEqual(new Set(sent.slice(5).map((event) => event.id)), new Set(sent.slice(0, 5).map((event) => event.id)));
    assert.equal(await retryLeadRelay(), 0);
    assert.deepEqual(await sql`SELECT id FROM crm_ingest_outbox`, []);
    console.log('OK Cinco formularios conservan el ID al reintentar y escriben en un solo CRM');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
