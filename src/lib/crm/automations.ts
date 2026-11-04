import { crm } from './db';
import { deliverEmail, deliverWhatsapp } from './deliver';
import type { AutomationStep } from './types';

type Person = { id: string; name: string; email: string; phone: string | null };
type Flow = { id: string; name: string; steps: AutomationStep[] };

function parseWait(detail: string) {
  const clean = detail.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const amount = Number(clean.match(/\d+/)?.[0] || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (clean.includes('dia')) return amount * 24 * 60;
  if (clean.includes('hora')) return amount * 60;
  return amount;
}

async function person(id: string): Promise<Person | null> {
  const sql = await crm();
  const rows = await sql`SELECT id, name, email, phone FROM contacts WHERE id = ${id}`;
  const row = rows[0] as { id?: string; name?: string; email?: string; phone?: string | null } | undefined;
  if (!row?.id || !row.email) return null;
  return { id: row.id, name: row.name || '', email: row.email, phone: row.phone || null };
}

async function activeFlows(): Promise<Flow[]> {
  const sql = await crm();
  const rows = await sql`SELECT id, name, steps FROM automations WHERE status = 'activa'`;
  return rows.map((row) => {
    const entry = row as { id?: string; name?: string; steps?: unknown };
    let steps: AutomationStep[] = [];
    try {
      const parsed = JSON.parse(String(entry.steps || '[]')) as AutomationStep[];
      if (Array.isArray(parsed)) steps = parsed;
    } catch {
      steps = [];
    }
    return { id: String(entry.id), name: String(entry.name || 'Automatización'), steps };
  });
}

async function applyTag(contactId: string, name: string) {
  const tag = name.trim();
  if (!tag) return;
  const sql = await crm();
  const existing = await sql`SELECT id FROM tags WHERE name = ${tag}`;
  let tagId = String((existing[0] as { id?: string } | undefined)?.id || '');
  if (!tagId) {
    tagId = crypto.randomUUID();
    await sql`INSERT INTO tags (id, name) VALUES (${tagId}, ${tag}) ON CONFLICT (name) DO NOTHING`;
    const again = await sql`SELECT id FROM tags WHERE name = ${tag}`;
    tagId = String((again[0] as { id?: string } | undefined)?.id || tagId);
  }
  await sql`INSERT INTO contact_tags (contact_id, tag_id) VALUES (${contactId}, ${tagId}) ON CONFLICT DO NOTHING`;
}

async function enqueue(automationId: string, contactId: string, stepIndex: number, minutes: number) {
  const sql = await crm();
  const when = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  await sql`
    INSERT INTO automation_jobs (id, automation_id, contact_id, step_index, run_at)
    VALUES (${crypto.randomUUID()}, ${automationId}, ${contactId}, ${stepIndex}, ${when})
  `;
}

async function walk(flow: Flow, contact: Person, from: number) {
  for (let index = from; index < flow.steps.length; index += 1) {
    const step = flow.steps[index];
    if (step.kind === 'espera') {
      const minutes = parseWait(step.detail);
      if (minutes > 0) {
        await enqueue(flow.id, contact.id, index + 1, minutes);
        return;
      }
      continue;
    }
    if (step.kind === 'etiqueta') await applyTag(contact.id, step.detail);
    if (step.kind === 'email') {
      await deliverEmail(contact.email, flow.name, `Hola ${contact.name},\n\n${step.detail}\n`);
    }
    if (step.kind === 'whatsapp' && contact.phone) await deliverWhatsapp(contact.phone, step.detail);
  }
}

async function claim(flow: Flow, contactId: string) {
  const sql = await crm();
  const existing = await sql`
    SELECT automation_id FROM automation_runs WHERE automation_id = ${flow.id} AND contact_id = ${contactId}
  `;
  if (existing.length) return false;
  await sql`INSERT INTO automation_runs (automation_id, contact_id) VALUES (${flow.id}, ${contactId})`;
  return true;
}

export async function startAutomations(contactId: string) {
  const contact = await person(contactId);
  if (!contact) return;
  for (const flow of await activeFlows()) {
    if (!flow.steps.length) continue;
    if (!(await claim(flow, contact.id))) continue;
    await walk(flow, contact, 0);
  }
}

export async function queueAutomations(contactId: string) {
  const contact = await person(contactId);
  if (!contact) return;
  for (const flow of await activeFlows()) {
    if (!flow.steps.length) continue;
    if (!(await claim(flow, contact.id))) continue;
    await enqueue(flow.id, contact.id, 0, 0);
  }
}

export async function processDue(limit = 20) {
  const sql = await crm();
  const jobs = await sql`
    SELECT id, automation_id, contact_id, step_index
    FROM automation_jobs
    WHERE done_at IS NULL AND run_at <= now()
    ORDER BY run_at
    LIMIT ${limit}
  `;
  const flows = await activeFlows();
  for (const job of jobs) {
    const entry = job as { id?: string; automation_id?: string; contact_id?: string; step_index?: unknown };
    if (!entry.id) continue;
    await sql`UPDATE automation_jobs SET done_at = now() WHERE id = ${entry.id} AND done_at IS NULL`;
    const flow = flows.find((item) => item.id === entry.automation_id);
    const contact = entry.contact_id ? await person(entry.contact_id) : null;
    if (!flow || !contact) continue;
    await walk(flow, contact, Number(entry.step_index) || 0);
  }
}
