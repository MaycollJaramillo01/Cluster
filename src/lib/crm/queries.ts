import { crm } from './db';
import type {
  Automation,
  AutomationStep,
  Booking,
  BookingEvent,
  Brand,
  Campaign,
  Circle,
  CircleMember,
  CommunityPost,
  Contact,
  EmailTemplate,
  FormSubmit,
  Message,
  Note,
  Opportunity,
  Operator,
  Order,
  Product,
  PropertyDef,
  SendingDomain,
  Service,
  SidebarCounts,
  Site,
  SiteBlock,
  Subscriber,
  SystemEmail,
  Tag,
  Thread,
} from './types';

function num(value: unknown) {
  return Number(value ?? 0);
}

function text(value: unknown) {
  return value == null ? null : String(value);
}

function stamp(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value == null ? '' : String(value);
}

function bool(value: unknown) {
  return value === true || value === 't' || value === 'true';
}

function tagsOf(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function jsonOf<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return Array.isArray(value) ? (value as T) : fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: text(row.phone),
    country: text(row.country),
    address: text(row.address),
    city: text(row.city),
    state: text(row.state),
    postal_code: text(row.postal_code),
    membership: text(row.membership),
    sales_experience: text(row.sales_experience),
    source: text(row.source),
    created_at: stamp(row.created_at),
    tags: tagsOf(row.tags),
  };
}

export async function sidebarCounts(): Promise<SidebarCounts> {
  const sql = await crm();
  const [counts, memberships] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*) FROM contacts) AS contacts,
        (SELECT count(*) FROM contacts WHERE created_at > now() - interval '7 days') AS last7,
        (SELECT count(*) FROM contacts WHERE created_at > now() - interval '30 days') AS last30,
        (SELECT count(*) FROM contacts WHERE membership IS NOT NULL) AS members,
        (SELECT count(*) FROM subscribers WHERE status = 'subscribed') AS subscribers,
        (SELECT count(*) FROM circles) AS circles,
        (SELECT count(*) FROM circle_members) AS circle_members,
        (SELECT count(*) FROM community_posts WHERE status = 'pendiente') AS posts
    `,
    sql`
      SELECT m.name, count(c.id) AS count
      FROM memberships m
      LEFT JOIN contacts c ON c.membership = m.name
      GROUP BY m.name
      ORDER BY m.name
    `,
  ]);
  const row = counts[0] as Record<string, unknown>;
  return {
    contacts: num(row?.contacts),
    last7: num(row?.last7),
    last30: num(row?.last30),
    members: num(row?.members),
    memberships: memberships.map((item) => {
      const entry = item as Record<string, unknown>;
      return { name: String(entry.name), count: num(entry.count) };
    }),
    subscribers: num(row?.subscribers),
    circles: num(row?.circles),
    circleMembers: num(row?.circle_members),
    posts: num(row?.posts),
  };
}

export async function listContacts(filter: { q?: string; segment?: string; membership?: string }) {
  const sql = await crm();
  const like = filter.q?.trim() ? `%${filter.q.trim()}%` : '';
  const segment = filter.segment === '7' || filter.segment === '30' ? filter.segment : '';
  const membership = filter.membership?.trim() || '';
  const rows = await sql`
    SELECT c.*,
      COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
    FROM contacts c
    LEFT JOIN contact_tags ct ON ct.contact_id = c.id
    LEFT JOIN tags t ON t.id = ct.tag_id
    WHERE (${like} = '' OR c.name ILIKE ${like} OR c.email ILIKE ${like} OR COALESCE(c.phone, '') ILIKE ${like})
      AND (${segment} = '' OR (${segment} = '7' AND c.created_at > now() - interval '7 days') OR (${segment} = '30' AND c.created_at > now() - interval '30 days'))
      AND (
        ${membership} = ''
        OR (${membership} = 'all' AND c.membership IS NOT NULL)
        OR c.membership = ${membership}
      )
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 200
  `;
  return rows.map((row) => mapContact(row as Record<string, unknown>));
}

export async function getContact(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT c.*,
      COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
    FROM contacts c
    LEFT JOIN contact_tags ct ON ct.contact_id = c.id
    LEFT JOIN tags t ON t.id = ct.tag_id
    WHERE c.id = ${id}
    GROUP BY c.id
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapContact(row) : null;
}

export async function listNotes(contactId: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, contact_id, body, created_at
    FROM notes
    WHERE contact_id = ${contactId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      contact_id: String(entry.contact_id),
      body: String(entry.body),
      created_at: stamp(entry.created_at),
    } satisfies Note;
  });
}

export async function listTags() {
  const sql = await crm();
  const rows = await sql`SELECT id, name FROM tags ORDER BY name`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return { id: String(entry.id), name: String(entry.name) } satisfies Tag;
  });
}

export async function listMembershipNames() {
  const sql = await crm();
  const rows = await sql`SELECT name FROM memberships ORDER BY name`;
  return rows.map((row) => String((row as Record<string, unknown>).name));
}

export async function listPropertyDefs() {
  const sql = await crm();
  const rows = await sql`SELECT id, name, format, built_in, created_at FROM property_defs ORDER BY built_in DESC, name`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      format: String(entry.format),
      built_in: bool(entry.built_in),
      created_at: stamp(entry.created_at),
    } satisfies PropertyDef;
  });
}

export async function listFormSubmits(formName?: string) {
  const sql = await crm();
  const name = formName?.trim() || '';
  const rows = await sql`
    SELECT id, contact_id, form_name, name, email, phone, country, sales_experience, created_at
    FROM form_submits
    WHERE ${name} = '' OR form_name = ${name}
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      contact_id: text(entry.contact_id),
      form_name: String(entry.form_name),
      name: String(entry.name),
      email: String(entry.email),
      phone: text(entry.phone),
      country: text(entry.country),
      sales_experience: text(entry.sales_experience),
      created_at: stamp(entry.created_at),
    } satisfies FormSubmit;
  });
}

export async function listBookingEvents() {
  const sql = await crm();
  const rows = await sql`SELECT id, name, duration_min, description, created_at FROM booking_events ORDER BY created_at`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      duration_min: entry.duration_min == null ? null : num(entry.duration_min),
      description: text(entry.description),
      created_at: stamp(entry.created_at),
    } satisfies BookingEvent;
  });
}

export async function listOperators() {
  const sql = await crm();
  const rows = await sql`
    SELECT o.id, o.name, o.email,
      (SELECT count(*) FROM bookings b WHERE b.operator_id = o.id AND b.starts_at >= now() AND b.status = 'confirmada') AS upcoming
    FROM operators o
    ORDER BY o.name
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      email: text(entry.email),
      upcoming: num(entry.upcoming),
    } satisfies Operator;
  });
}

export async function listServices() {
  const sql = await crm();
  const rows = await sql`SELECT id, name, duration_min, price_cents FROM services ORDER BY name`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      duration_min: num(entry.duration_min),
      price_cents: num(entry.price_cents),
    } satisfies Service;
  });
}

export async function listBookings(month?: { year: number; month: number }) {
  const sql = await crm();
  const rows = month
    ? await sql`
        SELECT b.id, b.title, b.starts_at, b.ends_at, b.status, b.event_id, e.name AS event_name,
          b.operator_id, o.name AS operator_name, b.contact_id, c.name AS contact_name
        FROM bookings b
        LEFT JOIN booking_events e ON e.id = b.event_id
        LEFT JOIN operators o ON o.id = b.operator_id
        LEFT JOIN contacts c ON c.id = b.contact_id
        WHERE b.starts_at >= make_timestamptz(${month.year}, ${month.month}, 1, 0, 0, 0, 'America/Tegucigalpa')
          AND b.starts_at < make_timestamptz(${month.year}, ${month.month}, 1, 0, 0, 0, 'America/Tegucigalpa') + interval '1 month'
        ORDER BY b.starts_at
      `
    : await sql`
        SELECT b.id, b.title, b.starts_at, b.ends_at, b.status, b.event_id, e.name AS event_name,
          b.operator_id, o.name AS operator_name, b.contact_id, c.name AS contact_name
        FROM bookings b
        LEFT JOIN booking_events e ON e.id = b.event_id
        LEFT JOIN operators o ON o.id = b.operator_id
        LEFT JOIN contacts c ON c.id = b.contact_id
        ORDER BY b.starts_at DESC
        LIMIT 8
      `;
  return rows.map(mapBooking);
}

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    title: String(row.title),
    starts_at: stamp(row.starts_at),
    ends_at: stamp(row.ends_at),
    status: String(row.status),
    event_id: text(row.event_id),
    event_name: text(row.event_name),
    operator_id: text(row.operator_id),
    operator_name: text(row.operator_name),
    contact_id: text(row.contact_id),
    contact_name: text(row.contact_name),
  };
}

export async function listCampaigns() {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, channel, kind, status, audience, opened_rate, clicked_rate, bounced_rate, subject, body, sent_at, created_at
    FROM campaigns
    ORDER BY COALESCE(sent_at, created_at) DESC
  `;
  return rows.map(mapCampaign);
}

export async function getCampaign(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, channel, kind, status, audience, opened_rate, clicked_rate, bounced_rate, subject, body, sent_at, created_at
    FROM campaigns WHERE id = ${id}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapCampaign(row) : null;
}

function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: String(row.id),
    name: String(row.name),
    channel: String(row.channel),
    kind: String(row.kind),
    status: String(row.status),
    audience: num(row.audience),
    opened_rate: num(row.opened_rate),
    clicked_rate: num(row.clicked_rate),
    bounced_rate: num(row.bounced_rate),
    subject: text(row.subject),
    body: text(row.body),
    sent_at: row.sent_at == null ? null : stamp(row.sent_at),
    created_at: stamp(row.created_at),
  };
}

export async function listAutomations() {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, status, audience, opened_rate, clicked_rate, goal, steps, created_at
    FROM automations ORDER BY created_at DESC
  `;
  return rows.map(mapAutomation);
}

export async function getAutomation(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, status, audience, opened_rate, clicked_rate, goal, steps, created_at
    FROM automations WHERE id = ${id}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapAutomation(row) : null;
}

function mapAutomation(row: Record<string, unknown>): Automation {
  return {
    id: String(row.id),
    name: String(row.name),
    status: String(row.status),
    audience: num(row.audience),
    opened_rate: num(row.opened_rate),
    clicked_rate: num(row.clicked_rate),
    goal: text(row.goal),
    steps: jsonOf<AutomationStep[]>(row.steps, []),
    created_at: stamp(row.created_at),
  };
}

export async function listSubscribers(q?: string) {
  const sql = await crm();
  const like = q?.trim() ? `%${q.trim()}%` : '';
  const rows = await sql`
    SELECT id, name, email, status, open_rate, click_rate, created_at
    FROM subscribers
    WHERE ${like} = '' OR name ILIKE ${like} OR email ILIKE ${like}
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      email: String(entry.email),
      status: String(entry.status),
      open_rate: num(entry.open_rate),
      click_rate: num(entry.click_rate),
      created_at: stamp(entry.created_at),
    } satisfies Subscriber;
  });
}

export async function subscriberCount() {
  const sql = await crm();
  const rows = await sql`SELECT count(*) AS n FROM subscribers WHERE status = 'subscribed'`;
  return num((rows[0] as Record<string, unknown> | undefined)?.n);
}

export async function listTemplates(kind?: string) {
  const sql = await crm();
  const filter = kind === 'mine' || kind === 'library' ? kind : '';
  const rows = await sql`
    SELECT id, name, subject, preview, kind
    FROM email_templates
    WHERE ${filter} = '' OR kind = ${filter}
    ORDER BY name
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      subject: text(entry.subject),
      preview: text(entry.preview),
      kind: String(entry.kind),
    } satisfies EmailTemplate;
  });
}

export async function listSystemEmails(audience?: string) {
  const sql = await crm();
  const filter = audience === 'cliente' || audience === 'admin' ? audience : '';
  const rows = await sql`
    SELECT id, name, audience, subject, body, enabled
    FROM system_emails
    WHERE ${filter} = '' OR audience = ${filter}
    ORDER BY name
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      audience: String(entry.audience),
      subject: String(entry.subject),
      body: String(entry.body),
      enabled: bool(entry.enabled),
    } satisfies SystemEmail;
  });
}

export async function listDomains() {
  const sql = await crm();
  const rows = await sql`SELECT id, domain, email_verified, auth_verified FROM sending_domains ORDER BY domain`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      domain: String(entry.domain),
      email_verified: bool(entry.email_verified),
      auth_verified: bool(entry.auth_verified),
    } satisfies SendingDomain;
  });
}

export async function getBrand(): Promise<Brand> {
  const sql = await crm();
  const rows = await sql`SELECT company_name, address, sender_name, reply_to FROM brand WHERE id = 1`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return {
    company_name: String(row?.company_name ?? 'Cluster Marketing'),
    address: String(row?.address ?? ''),
    sender_name: String(row?.sender_name ?? 'Cluster'),
    reply_to: text(row?.reply_to),
  };
}

export async function listCircles() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.name, c.slug, c.description, c.price_cents, c.created_at,
      (SELECT count(*) FROM circle_members m WHERE m.circle_id = c.id) AS members
    FROM circles c
    ORDER BY c.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      slug: String(entry.slug),
      description: text(entry.description),
      price_cents: num(entry.price_cents),
      members: num(entry.members),
      created_at: stamp(entry.created_at),
    } satisfies Circle;
  });
}

export async function listCircleMembers(circleId?: string) {
  const sql = await crm();
  const id = circleId?.trim() || '';
  const rows = await sql`
    SELECT m.id, m.circle_id, c.name AS circle_name, m.contact_id, p.name AS contact_name,
      p.email, m.status, m.paid, m.created_at
    FROM circle_members m
    JOIN circles c ON c.id = m.circle_id
    JOIN contacts p ON p.id = m.contact_id
    WHERE ${id} = '' OR m.circle_id = ${id}
    ORDER BY m.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      circle_id: String(entry.circle_id),
      circle_name: String(entry.circle_name),
      contact_id: String(entry.contact_id),
      contact_name: String(entry.contact_name),
      email: String(entry.email),
      status: String(entry.status),
      paid: bool(entry.paid),
      created_at: stamp(entry.created_at),
    } satisfies CircleMember;
  });
}

export async function communityStats(days: number) {
  const sql = await crm();
  const windowDays = days === 30 ? 30 : 7;
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM circle_members WHERE created_at > now() - (${windowDays} * interval '1 day')) AS enrolled,
      (SELECT count(*) FROM circle_members WHERE status = 'completado' AND created_at > now() - (${windowDays} * interval '1 day')) AS completed,
      (SELECT count(*) FROM orders WHERE status = 'pagado' AND created_at > now() - (${windowDays} * interval '1 day')) AS orders,
      (SELECT COALESCE(sum(amount_cents), 0) FROM orders WHERE status = 'pagado' AND created_at > now() - (${windowDays} * interval '1 day')) AS revenue,
      (SELECT count(*) FROM circle_members WHERE paid) AS paying
  `;
  const row = rows[0] as Record<string, unknown>;
  const paying = num(row?.paying);
  const revenue = num(row?.revenue);
  return {
    enrolled: num(row?.enrolled),
    completed: num(row?.completed),
    orders: num(row?.orders),
    revenue,
    paying,
    arpu: paying ? Math.round(revenue / paying) : 0,
  };
}

export async function listPosts(filter: { kind?: string; status?: string }) {
  const sql = await crm();
  const kind = filter.kind?.trim() || '';
  const status = filter.status?.trim() || '';
  const rows = await sql`
    SELECT p.id, p.circle_id, c.name AS circle_name, p.author, p.kind, p.body, p.status, p.created_at
    FROM community_posts p
    LEFT JOIN circles c ON c.id = p.circle_id
    WHERE (${kind} = '' OR p.kind = ${kind})
      AND (${status} = '' OR p.status = ${status})
    ORDER BY p.created_at DESC
    LIMIT 100
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      circle_id: text(entry.circle_id),
      circle_name: text(entry.circle_name),
      author: String(entry.author),
      kind: String(entry.kind),
      body: String(entry.body),
      status: String(entry.status),
      created_at: stamp(entry.created_at),
    } satisfies CommunityPost;
  });
}

export async function getCommunitySettings() {
  const sql = await crm();
  const rows = await sql`SELECT url_slug FROM community_settings WHERE id = 1`;
  return { url_slug: String((rows[0] as Record<string, unknown> | undefined)?.url_slug ?? 'community') };
}

export async function listSites(kind?: string) {
  const sql = await crm();
  const filter = kind === 'embudo' || kind === 'sitio' ? kind : '';
  const rows = await sql`
    SELECT id, name, kind, status, url, blocks, updated_at
    FROM sites
    WHERE ${filter} = '' OR kind = ${filter}
    ORDER BY updated_at DESC
  `;
  return rows.map(mapSite);
}

export async function getSite(id: string) {
  const sql = await crm();
  const rows = await sql`SELECT id, name, kind, status, url, blocks, updated_at FROM sites WHERE id = ${id}`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapSite(row) : null;
}

function mapSite(row: Record<string, unknown>): Site {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: String(row.kind),
    status: String(row.status),
    url: text(row.url),
    blocks: jsonOf<SiteBlock[]>(row.blocks, []),
    updated_at: stamp(row.updated_at),
  };
}

export async function listProducts() {
  const sql = await crm();
  const rows = await sql`SELECT id, name, price_cents, status FROM products ORDER BY name`;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      price_cents: num(entry.price_cents),
      status: String(entry.status),
    } satisfies Product;
  });
}

export async function listOrders() {
  const sql = await crm();
  const rows = await sql`
    SELECT o.id, p.name AS product_name, c.name AS contact_name, o.amount_cents, o.status, o.created_at
    FROM orders o
    LEFT JOIN products p ON p.id = o.product_id
    LEFT JOIN contacts c ON c.id = o.contact_id
    ORDER BY o.created_at DESC
    LIMIT 100
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      product_name: text(entry.product_name),
      contact_name: text(entry.contact_name),
      amount_cents: num(entry.amount_cents),
      status: String(entry.status),
      created_at: stamp(entry.created_at),
    } satisfies Order;
  });
}

export async function listOpportunities(stage?: string) {
  const sql = await crm();
  const filter = stage?.trim() || '';
  const rows = await sql`
    SELECT o.id, o.contact_id, c.name AS contact_name, o.title, o.stage, o.value_cents, o.source, o.created_at
    FROM opportunities o
    JOIN contacts c ON c.id = o.contact_id
    WHERE ${filter} = '' OR o.stage = ${filter}
    ORDER BY o.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      contact_id: String(entry.contact_id),
      contact_name: String(entry.contact_name),
      title: String(entry.title),
      stage: String(entry.stage),
      value_cents: num(entry.value_cents),
      source: text(entry.source),
      created_at: stamp(entry.created_at),
    } satisfies Opportunity;
  });
}

export async function listThreads() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.name, c.email, c.phone,
      m.body AS last_body, m.created_at AS last_at, m.channel
    FROM contacts c
    JOIN LATERAL (
      SELECT body, created_at, channel
      FROM messages
      WHERE contact_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON TRUE
    ORDER BY m.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      name: String(entry.name),
      email: String(entry.email),
      phone: text(entry.phone),
      last_body: text(entry.last_body),
      last_at: entry.last_at == null ? null : stamp(entry.last_at),
      channel: text(entry.channel),
    } satisfies Thread;
  });
}

export async function listMessages(contactId: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, contact_id, channel, direction, body, created_at
    FROM messages
    WHERE contact_id = ${contactId}
    ORDER BY created_at
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: String(entry.id),
      contact_id: String(entry.contact_id),
      channel: String(entry.channel),
      direction: String(entry.direction),
      body: String(entry.body),
      created_at: stamp(entry.created_at),
    } satisfies Message;
  });
}

export async function overview() {
  const sql = await crm();
  const [stats] = await sql`
    SELECT
      (SELECT count(*) FROM contacts) AS contacts,
      (SELECT count(*) FROM contacts WHERE created_at > now() - interval '7 days') AS last7,
      (SELECT count(*) FROM bookings WHERE starts_at >= date_trunc('month', now()) AND starts_at < date_trunc('month', now()) + interval '1 month') AS bookings,
      (SELECT count(*) FROM campaigns WHERE status = 'enviada') AS campaigns,
      (SELECT COALESCE(sum(value_cents), 0) FROM opportunities WHERE stage <> 'perdido') AS pipeline,
      (SELECT COALESCE(sum(amount_cents), 0) FROM orders WHERE status = 'pagado') AS revenue,
      (SELECT count(*) FROM subscribers WHERE status = 'subscribed') AS subscribers
  `;
  const row = stats as Record<string, unknown>;
  const [campaigns, bookings, submits, stages] = await Promise.all([
    listCampaigns(),
    listBookings(),
    listFormSubmits(),
    sql`SELECT stage, count(*) AS n, COALESCE(sum(value_cents), 0) AS value FROM opportunities GROUP BY stage`,
  ]);
  return {
    contacts: num(row?.contacts),
    last7: num(row?.last7),
    bookings: num(row?.bookings),
    campaigns: num(row?.campaigns),
    pipeline: num(row?.pipeline),
    revenue: num(row?.revenue),
    subscribers: num(row?.subscribers),
    campaignsList: campaigns.slice(0, 4),
    bookingsList: bookings.slice(0, 5),
    submits: submits.slice(0, 4),
    stages: stages.map((item) => {
      const entry = item as Record<string, unknown>;
      return { stage: String(entry.stage), count: num(entry.n), value: num(entry.value) };
    }),
  };
}

export async function setupProgress() {
  const sql = await crm();
  const [row] = await sql`
    SELECT
      (SELECT count(*) FROM circles) AS circles,
      (SELECT count(*) FROM contacts) AS contacts,
      (SELECT count(*) FROM booking_events) AS events,
      (SELECT count(*) FROM sending_domains WHERE email_verified) AS domains,
      (SELECT count(*) FROM campaigns) AS campaigns
  `;
  const entry = row as Record<string, unknown>;
  return {
    circles: num(entry?.circles) > 0,
    contacts: num(entry?.contacts) > 0,
    events: num(entry?.events) > 0,
    domains: num(entry?.domains) > 0,
    campaigns: num(entry?.campaigns) > 0,
  };
}
