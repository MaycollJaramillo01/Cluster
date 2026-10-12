'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crm } from './db';
import { getAutomation, getSite } from './queries';
import { STAGES, type SiteBlock } from './types';

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function cents(formData: FormData, key: string) {
  const value = Number(field(formData, key).replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function refresh() {
  revalidatePath('/dashboard', 'layout');
}

function unique(error: unknown) {
  return /duplicate|unique/i.test(String(error));
}

function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'circulo';
}

function parseCsv(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells: string[] = [];
      let current = '';
      let quoted = false;
      for (const char of line) {
        if (char === '"') quoted = !quoted;
        else if (char === ',' && !quoted) {
          cells.push(current.trim());
          current = '';
        } else current += char;
      }
      cells.push(current.trim());
      return cells;
    });
}

async function tagIdFor(name: string) {
  const sql = await crm();
  const rows = await sql`
    INSERT INTO tags (id, name)
    VALUES (${crypto.randomUUID()}, ${name})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  return String((rows[0] as { id: string }).id);
}

export async function createContact(formData: FormData) {
  const name = field(formData, 'name');
  const email = field(formData, 'email').toLowerCase();
  if (!name || !email.includes('@')) redirect('/dashboard/contactos?error=datos');
  const sql = await crm();
  const id = crypto.randomUUID();
  try {
    await sql`
      INSERT INTO contacts (id, name, email, phone, country, membership, source)
      VALUES (
        ${id}, ${name}, ${email}, ${field(formData, 'phone') || null}, ${field(formData, 'country') || null},
        ${field(formData, 'membership') || null}, 'manual'
      )
    `;
  } catch (error) {
    if (unique(error)) redirect('/dashboard/contactos?error=correo');
    throw error;
  }
  const tag = field(formData, 'tag');
  if (tag) {
    const idTag = await tagIdFor(tag);
    await sql`INSERT INTO contact_tags (contact_id, tag_id) VALUES (${id}, ${idTag}) ON CONFLICT DO NOTHING`;
  }
  refresh();
  redirect(`/dashboard/contactos/${id}`);
}

export async function updateContact(formData: FormData) {
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  const email = field(formData, 'email').toLowerCase();
  if (!id || !name || !email.includes('@')) return;
  const sql = await crm();
  try {
    await sql`
      UPDATE contacts SET
        name = ${name},
        email = ${email},
        phone = ${field(formData, 'phone') || null},
        country = ${field(formData, 'country') || null},
        address = ${field(formData, 'address') || null},
        city = ${field(formData, 'city') || null},
        state = ${field(formData, 'state') || null},
        postal_code = ${field(formData, 'postal_code') || null},
        membership = ${field(formData, 'membership') || null},
        sales_experience = ${field(formData, 'sales_experience') || null}
      WHERE id = ${id}
    `;
  } catch (error) {
    if (unique(error)) redirect(`/dashboard/contactos/${id}?error=correo`);
    throw error;
  }
  refresh();
}

export async function deleteContact(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM contacts WHERE id = ${id}`;
  refresh();
  redirect('/dashboard/contactos');
}

export async function addNote(formData: FormData) {
  const contactId = field(formData, 'contact_id');
  const body = field(formData, 'body');
  if (!contactId || !body) return;
  const sql = await crm();
  await sql`INSERT INTO notes (id, contact_id, body) VALUES (${crypto.randomUUID()}, ${contactId}, ${body})`;
  refresh();
}

export async function deleteNote(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM notes WHERE id = ${id}`;
  refresh();
}

export async function tagContacts(formData: FormData) {
  const ids = field(formData, 'ids').split(',').map((item) => item.trim()).filter(Boolean);
  const tag = field(formData, 'tag');
  if (!ids.length || !tag) return;
  const sql = await crm();
  const idTag = await tagIdFor(tag);
  for (const contactId of ids) {
    await sql`INSERT INTO contact_tags (contact_id, tag_id) VALUES (${contactId}, ${idTag}) ON CONFLICT DO NOTHING`;
  }
  refresh();
}

export async function importContacts(formData: FormData) {
  const rows = parseCsv(await csvText(formData));
  if (!rows.length) redirect('/dashboard/contactos?error=csv');
  const named = columnMap(rows[0]);
  const start = named ? 1 : 0;
  const pending = rows.slice(start);
  const limited = pending.slice(0, 5000);
  const sql = await crm();
  let imported = 0;
  for (const cells of limited) {
    const name = cellAt(cells, named ? named.name : 0);
    const email = cellAt(cells, named ? named.email : 1).toLowerCase();
    if (!name || !email.includes('@')) continue;
    const phone = cellAt(cells, named ? named.phone : 2);
    const country = cellAt(cells, named ? named.country : 3);
    const tag = cellAt(cells, named ? named.tag : 4);
    const inserted = await sql`
      INSERT INTO contacts (id, name, email, phone, country, source)
      VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${phone || null}, ${country || null}, 'importacion')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    if (!inserted.length) continue;
    imported += 1;
    if (tag) {
      const idTag = await tagIdFor(tag);
      await sql`
        INSERT INTO contact_tags (contact_id, tag_id)
        VALUES (${String((inserted[0] as { id: string }).id)}, ${idTag})
        ON CONFLICT DO NOTHING
      `;
    }
  }
  refresh();
  const tope = pending.length > limited.length ? '&tope=1' : '';
  redirect(`/dashboard/contactos?importados=${imported}${tope}`);
}

async function csvText(formData: FormData) {
  const file = formData.get('file');
  if (file instanceof File && file.size > 0 && file.size <= 2_000_000) {
    return (await file.text()).replace(/^\uFEFF/, '');
  }
  return field(formData, 'csv');
}

function columnMap(header: string[]) {
  const cells = header.map(normalizeHeader);
  const name = cells.findIndex((cell) => cell === 'nombre' || cell === 'name');
  const email = cells.findIndex((cell) => cell === 'email' || cell === 'correo' || cell === 'e-mail');
  if (name < 0 || email < 0) return null;
  return {
    name,
    email,
    phone: cells.findIndex((cell) => cell === 'telefono' || cell === 'phone'),
    country: cells.findIndex((cell) => cell === 'pais' || cell === 'country'),
    tag: cells.findIndex((cell) => cell === 'etiqueta' || cell === 'tag' || cell === 'tags'),
  };
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function cellAt(cells: string[], index: number) {
  if (index < 0) return '';
  return cells[index]?.trim() || '';
}

export async function createProperty(formData: FormData) {
  const name = field(formData, 'name');
  const format = field(formData, 'format') || 'Texto';
  if (!name) return;
  const sql = await crm();
  await sql`
    INSERT INTO property_defs (id, name, format, built_in)
    VALUES (${crypto.randomUUID()}, ${name}, ${format}, false)
    ON CONFLICT (name) DO NOTHING
  `;
  refresh();
}

export async function createMembership(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const sql = await crm();
  await sql`INSERT INTO memberships (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
  refresh();
}

export async function createTag(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  await tagIdFor(name);
  refresh();
}

export async function createEvent(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const duration = Number(field(formData, 'duration'));
  const sql = await crm();
  await sql`
    INSERT INTO booking_events (id, name, duration_min, description)
    VALUES (${crypto.randomUUID()}, ${name}, ${Number.isFinite(duration) && duration > 0 ? duration : null}, ${field(formData, 'description') || null})
  `;
  refresh();
}

export async function deleteEvent(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM booking_events WHERE id = ${id}`;
  refresh();
}

export async function createOperator(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const sql = await crm();
  await sql`INSERT INTO operators (id, name, email) VALUES (${crypto.randomUUID()}, ${name}, ${field(formData, 'email') || null})`;
  refresh();
}

export async function deleteOperator(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM operators WHERE id = ${id}`;
  refresh();
}

export async function createService(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const duration = Number(field(formData, 'duration')) || 30;
  const sql = await crm();
  await sql`
    INSERT INTO services (id, name, duration_min, price_cents)
    VALUES (${crypto.randomUUID()}, ${name}, ${duration}, ${cents(formData, 'price')})
  `;
  refresh();
}

export async function deleteService(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM services WHERE id = ${id}`;
  refresh();
}

export async function createBooking(formData: FormData) {
  const title = field(formData, 'title');
  const date = field(formData, 'date');
  const time = field(formData, 'time') || '09:00';
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const start = new Date(`${date}T${time}:00-06:00`);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const sql = await crm();
  await sql`
    INSERT INTO bookings (id, event_id, operator_id, contact_id, title, starts_at, ends_at, status)
    VALUES (
      ${crypto.randomUUID()},
      ${field(formData, 'event_id') || null},
      ${field(formData, 'operator_id') || null},
      ${field(formData, 'contact_id') || null},
      ${title},
      ${start.toISOString()},
      ${end.toISOString()},
      'confirmada'
    )
  `;
  refresh();
}

export async function cancelBooking(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE bookings SET status = 'cancelada' WHERE id = ${id}`;
  refresh();
}

export async function createCampaign(formData: FormData) {
  const name = field(formData, 'name') || 'Campaña sin nombre';
  const channel = field(formData, 'channel') === 'mensaje' ? 'mensaje' : 'email';
  const kind = field(formData, 'kind') === 'ab' ? 'ab' : 'regular';
  const id = crypto.randomUUID();
  const sql = await crm();
  await sql`
    INSERT INTO campaigns (id, name, channel, kind, status)
    VALUES (${id}, ${name}, ${channel}, ${kind}, 'borrador')
  `;
  refresh();
  redirect(`/dashboard/mensajes/campanas/${id}`);
}

export async function saveCampaign(formData: FormData) {
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  if (!id || !name) return;
  const status = field(formData, 'status') === 'enviada' ? 'enviada' : 'borrador';
  const channel = field(formData, 'channel') === 'mensaje' ? 'mensaje' : 'email';
  const kind = field(formData, 'kind') === 'ab' ? 'ab' : 'regular';
  const sql = await crm();
  const audienceRows = await sql`SELECT count(*) AS n FROM subscribers WHERE status = 'subscribed'`;
  const audience = Number((audienceRows[0] as { n: unknown }).n || 0);
  await sql`
    UPDATE campaigns SET
      name = ${name},
      channel = ${channel},
      kind = ${kind},
      subject = ${field(formData, 'subject') || null},
      body = ${field(formData, 'body') || null},
      status = ${status},
      audience = CASE WHEN ${status} = 'enviada' THEN ${audience} ELSE audience END,
      sent_at = CASE WHEN ${status} = 'enviada' AND sent_at IS NULL THEN now() ELSE sent_at END
    WHERE id = ${id}
  `;
  refresh();
}

export async function deleteCampaign(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM campaigns WHERE id = ${id}`;
  refresh();
  redirect('/dashboard/mensajes/campanas');
}

export async function createAutomation(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const id = crypto.randomUUID();
  const sql = await crm();
  await sql`INSERT INTO automations (id, name, status, goal) VALUES (${id}, ${name}, 'borrador', ${field(formData, 'goal') || null})`;
  refresh();
  redirect(`/dashboard/mensajes/automatizaciones/${id}`);
}

export async function addAutomationStep(formData: FormData) {
  const id = field(formData, 'id');
  const detail = field(formData, 'detail');
  const kind = field(formData, 'kind');
  const allowed = ['email', 'espera', 'etiqueta', 'whatsapp'] as const;
  if (!id || !detail || !allowed.includes(kind as (typeof allowed)[number])) return;
  const automation = await getAutomation(id);
  if (!automation) return;
  const steps = [
    ...automation.steps,
    { id: crypto.randomUUID(), kind: kind as (typeof allowed)[number], detail },
  ];
  const sql = await crm();
  await sql`UPDATE automations SET steps = ${JSON.stringify(steps)}, status = 'activa' WHERE id = ${id}`;
  refresh();
}

export async function deleteAutomationStep(formData: FormData) {
  const id = field(formData, 'id');
  const stepId = field(formData, 'step_id');
  const automation = await getAutomation(id);
  if (!automation) return;
  const steps = automation.steps.filter((step) => step.id !== stepId);
  const sql = await crm();
  await sql`UPDATE automations SET steps = ${JSON.stringify(steps)} WHERE id = ${id}`;
  refresh();
}

export async function deleteAutomation(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM automations WHERE id = ${id}`;
  refresh();
  redirect('/dashboard/mensajes/automatizaciones');
}

export async function createSubscriber(formData: FormData) {
  const name = field(formData, 'name');
  const email = field(formData, 'email').toLowerCase();
  if (!name || !email.includes('@')) return;
  const sql = await crm();
  await sql`
    INSERT INTO subscribers (id, name, email)
    VALUES (${crypto.randomUUID()}, ${name}, ${email})
    ON CONFLICT (email) DO NOTHING
  `;
  refresh();
}

export async function unsubscribe(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE subscribers SET status = 'unsubscribed' WHERE id = ${id}`;
  refresh();
}

export async function createTemplate(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const sql = await crm();
  await sql`
    INSERT INTO email_templates (id, name, subject, preview, kind)
    VALUES (${crypto.randomUUID()}, ${name}, ${field(formData, 'subject') || null}, ${field(formData, 'preview') || null}, 'mine')
  `;
  refresh();
}

export async function deleteTemplate(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM email_templates WHERE id = ${id} AND kind = 'mine'`;
  refresh();
}

export async function toggleSystemEmail(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE system_emails SET enabled = NOT enabled WHERE id = ${id}`;
  refresh();
}

export async function addDomain(formData: FormData) {
  const domain = field(formData, 'domain').toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain.includes('.')) return;
  const sql = await crm();
  await sql`
    INSERT INTO sending_domains (id, domain)
    VALUES (${crypto.randomUUID()}, ${domain})
    ON CONFLICT (domain) DO NOTHING
  `;
  refresh();
}

export async function verifyDomain(formData: FormData) {
  const id = field(formData, 'id');
  const which = field(formData, 'which');
  if (!id) return;
  const sql = await crm();
  if (which === 'auth') await sql`UPDATE sending_domains SET auth_verified = true WHERE id = ${id}`;
  else await sql`UPDATE sending_domains SET email_verified = true WHERE id = ${id}`;
  refresh();
}

export async function saveBrand(formData: FormData) {
  const company = field(formData, 'company_name');
  const address = field(formData, 'address');
  const sender = field(formData, 'sender_name');
  if (!company || !address || !sender) return;
  const sql = await crm();
  await sql`
    INSERT INTO brand (id, company_name, address, sender_name, reply_to)
    VALUES (1, ${company}, ${address}, ${sender}, ${field(formData, 'reply_to') || null})
    ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      address = EXCLUDED.address,
      sender_name = EXCLUDED.sender_name,
      reply_to = EXCLUDED.reply_to
  `;
  refresh();
}

export async function sendMessage(formData: FormData) {
  const contactId = field(formData, 'contact_id');
  const body = field(formData, 'body');
  const channel = field(formData, 'channel');
  const allowed = ['whatsapp', 'email', 'sms'];
  if (!contactId || !body) return;
  const sql = await crm();
  await sql`
    INSERT INTO messages (id, contact_id, channel, direction, body)
    VALUES (${crypto.randomUUID()}, ${contactId}, ${allowed.includes(channel) ? channel : 'whatsapp'}, 'out', ${body})
  `;
  refresh();
}

export async function createCircle(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const sql = await crm();
  const slug = slugify(field(formData, 'slug') || name);
  try {
    await sql`
      INSERT INTO circles (id, name, slug, description, price_cents)
      VALUES (${crypto.randomUUID()}, ${name}, ${slug}, ${field(formData, 'description') || null}, ${cents(formData, 'price')})
    `;
  } catch (error) {
    if (!unique(error)) throw error;
    await sql`
      INSERT INTO circles (id, name, slug, description, price_cents)
      VALUES (
        ${crypto.randomUUID()}, ${name}, ${`${slug}-${crypto.randomUUID().slice(0, 4)}`},
        ${field(formData, 'description') || null}, ${cents(formData, 'price')}
      )
    `;
  }
  refresh();
}

export async function addCircleMember(formData: FormData) {
  const circleId = field(formData, 'circle_id');
  const contactId = field(formData, 'contact_id');
  if (!circleId || !contactId) return;
  const sql = await crm();
  await sql`
    INSERT INTO circle_members (id, circle_id, contact_id, status, paid)
    VALUES (${crypto.randomUUID()}, ${circleId}, ${contactId}, 'activo', ${field(formData, 'paid') === 'on'})
    ON CONFLICT (circle_id, contact_id) DO NOTHING
  `;
  refresh();
}

export async function createPost(formData: FormData) {
  const author = field(formData, 'author');
  const body = field(formData, 'body');
  const kind = field(formData, 'kind') || 'muro';
  const allowed = ['muro', 'blog', 'resena', 'video', 'widget'];
  if (!author || !body) return;
  const sql = await crm();
  await sql`
    INSERT INTO community_posts (id, circle_id, author, kind, body, status)
    VALUES (
      ${crypto.randomUUID()}, ${field(formData, 'circle_id') || null}, ${author},
      ${allowed.includes(kind) ? kind : 'muro'}, ${body}, 'pendiente'
    )
  `;
  refresh();
}

export async function moderatePost(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['publicado', 'rechazado', 'pendiente'].includes(status)) return;
  const sql = await crm();
  await sql`UPDATE community_posts SET status = ${status} WHERE id = ${id}`;
  refresh();
}

export async function saveCommunitySettings(formData: FormData) {
  const slug = slugify(field(formData, 'url_slug') || 'community');
  const sql = await crm();
  await sql`
    INSERT INTO community_settings (id, url_slug) VALUES (1, ${slug})
    ON CONFLICT (id) DO UPDATE SET url_slug = EXCLUDED.url_slug
  `;
  refresh();
}

export async function createSite(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const kind = field(formData, 'kind') === 'embudo' ? 'embudo' : 'sitio';
  const id = crypto.randomUUID();
  const sql = await crm();
  await sql`
    INSERT INTO sites (id, name, kind, status, url, blocks)
    VALUES (${id}, ${name}, ${kind}, 'borrador', ${field(formData, 'url') || null}, '[]')
  `;
  refresh();
  redirect(`/dashboard/editor?id=${id}`);
}

export async function deleteSite(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`DELETE FROM sites WHERE id = ${id}`;
  refresh();
}

export async function addBlock(formData: FormData) {
  const siteId = field(formData, 'site_id');
  const type = field(formData, 'type');
  const text = field(formData, 'text');
  const allowed = ['nav', 'heading', 'text', 'button'] as const;
  if (!siteId || !text || !allowed.includes(type as (typeof allowed)[number])) return;
  const site = await getSite(siteId);
  if (!site) return;
  const blocks: SiteBlock[] = [
    ...site.blocks,
    {
      id: crypto.randomUUID(),
      type: type as SiteBlock['type'],
      text,
      href: field(formData, 'href') || undefined,
    },
  ];
  const sql = await crm();
  await sql`UPDATE sites SET blocks = ${JSON.stringify(blocks)}, updated_at = now() WHERE id = ${siteId}`;
  refresh();
}

export async function moveBlock(formData: FormData) {
  const siteId = field(formData, 'site_id');
  const blockId = field(formData, 'block_id');
  const site = await getSite(siteId);
  if (!site) return;
  const index = site.blocks.findIndex((block) => block.id === blockId);
  const next = index + (field(formData, 'direction') === 'up' ? -1 : 1);
  if (index < 0 || next < 0 || next >= site.blocks.length) return;
  const blocks = [...site.blocks];
  const [item] = blocks.splice(index, 1);
  if (!item) return;
  blocks.splice(next, 0, item);
  const sql = await crm();
  await sql`UPDATE sites SET blocks = ${JSON.stringify(blocks)}, updated_at = now() WHERE id = ${siteId}`;
  refresh();
}

export async function deleteBlock(formData: FormData) {
  const siteId = field(formData, 'site_id');
  const blockId = field(formData, 'block_id');
  const site = await getSite(siteId);
  if (!site) return;
  const blocks = site.blocks.filter((block) => block.id !== blockId);
  const sql = await crm();
  await sql`UPDATE sites SET blocks = ${JSON.stringify(blocks)}, updated_at = now() WHERE id = ${siteId}`;
  refresh();
}

export async function publishSite(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status') === 'publicado' ? 'publicado' : 'borrador';
  if (!id) return;
  const sql = await crm();
  await sql`UPDATE sites SET status = ${status}, updated_at = now() WHERE id = ${id}`;
  refresh();
}

export async function createProduct(formData: FormData) {
  const name = field(formData, 'name');
  if (!name) return;
  const sql = await crm();
  await sql`INSERT INTO products (id, name, price_cents) VALUES (${crypto.randomUUID()}, ${name}, ${cents(formData, 'price')})`;
  refresh();
}

export async function createOrder(formData: FormData) {
  const productId = field(formData, 'product_id');
  if (!productId) return;
  const sql = await crm();
  const amount = field(formData, 'amount') ? cents(formData, 'amount') : null;
  const priceRows = await sql`SELECT price_cents FROM products WHERE id = ${productId}`;
  const price = Number((priceRows[0] as { price_cents?: unknown } | undefined)?.price_cents ?? 0);
  await sql`
    INSERT INTO orders (id, product_id, contact_id, amount_cents, status)
    VALUES (${crypto.randomUUID()}, ${productId}, ${field(formData, 'contact_id') || null}, ${amount ?? price}, 'pagado')
  `;
  refresh();
}

export async function createOpportunity(formData: FormData) {
  const contactId = field(formData, 'contact_id');
  const title = field(formData, 'title');
  const stage = field(formData, 'stage');
  if (!contactId || !title) return;
  const safeStage = STAGES.some((item) => item.id === stage) ? stage : 'nuevo';
  const sql = await crm();
  await sql`
    INSERT INTO opportunities (id, contact_id, title, stage, value_cents, source)
    VALUES (${crypto.randomUUID()}, ${contactId}, ${title}, ${safeStage}, ${cents(formData, 'value')}, ${field(formData, 'source') || 'Manual'})
  `;
  refresh();
}

export async function moveOpportunity(formData: FormData) {
  const id = field(formData, 'id');
  const stage = field(formData, 'stage');
  if (!id || !STAGES.some((item) => item.id === stage)) return;
  const sql = await crm();
  await sql`UPDATE opportunities SET stage = ${stage} WHERE id = ${id}`;
  refresh();
}
