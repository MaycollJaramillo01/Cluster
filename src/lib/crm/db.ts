import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type Sql = NeonQueryFunction<false, false>;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS crm_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS memberships (
    name TEXT PRIMARY KEY
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    country TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    membership TEXT,
    sales_experience TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS property_defs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    format TEXT NOT NULL,
    built_in BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS form_submits (
    id TEXT PRIMARY KEY,
    contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    form_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    sales_experience TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS booking_events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration_min INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS operators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 30,
    price_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES booking_events(id) ON DELETE SET NULL,
    operator_id TEXT REFERENCES operators(id) ON DELETE SET NULL,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmada'
  )`,
  `CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'regular',
    status TEXT NOT NULL DEFAULT 'draft',
    audience INTEGER NOT NULL DEFAULT 0,
    opened_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    clicked_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    bounced_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS automations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    audience INTEGER NOT NULL DEFAULT 0,
    opened_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    clicked_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    goal TEXT,
    steps TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'subscribed',
    open_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    click_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    preview TEXT,
    kind TEXT NOT NULL DEFAULT 'mine'
  )`,
  `CREATE TABLE IF NOT EXISTS system_emails (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    audience TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS sending_domains (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    auth_verified BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS brand (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    reply_to TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS circles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS circle_members (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'activo',
    paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (circle_id, contact_id)
  )`,
  `CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    circle_id TEXT REFERENCES circles(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    kind TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS community_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    url_slug TEXT NOT NULL DEFAULT 'community'
  )`,
  `CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'borrador',
    url TEXT,
    blocks TEXT NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pagado',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT NOT NULL,
    value_cents INTEGER NOT NULL DEFAULT 0,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    direction TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS contacts_created_idx ON contacts (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS bookings_starts_idx ON bookings (starts_at)`,
  `CREATE INDEX IF NOT EXISTS messages_contact_idx ON messages (contact_id, created_at DESC)`,
];

let client: Sql | null = null;
let clientUrl = '';
let ready: Promise<void> | null = null;

export function databaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

async function clientFor() {
  const { connectionString } = await import('./connect');
  const url = await connectionString();
  if (!url) throw new Error('Falta la conexión de Neon');
  if (client && clientUrl === url) return client;
  const next = neon(url);
  const changed = clientUrl !== '' && clientUrl !== url;
  client = next;
  clientUrl = url;
  if (changed) ready = null;
  return client;
}

export function ensureSchema() {
  if (!ready) {
    ready = migrateResolved().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function migrateResolved() {
  const sql = await clientFor();
  await migrate(sql);
}

export async function crm() {
  await ensureSchema();
  return clientFor();
}

async function migrate(sql: Sql) {
  for (const statement of STATEMENTS) {
    await sql.query(statement);
  }
  const existing = await sql`SELECT key FROM crm_meta WHERE key = 'seeded'`;
  if (existing.length > 0) {
    await clearStoredRows(sql);
    await sql`DELETE FROM crm_meta WHERE key = 'seeded'`;
  }
}

const STORED_TABLES = [
  'messages',
  'opportunities',
  'orders',
  'products',
  'sites',
  'community_posts',
  'circle_members',
  'circles',
  'bookings',
  'services',
  'operators',
  'booking_events',
  'form_submits',
  'notes',
  'contact_tags',
  'contacts',
  'campaigns',
  'automations',
  'subscribers',
  'email_templates',
  'system_emails',
  'sending_domains',
  'property_defs',
  'tags',
  'memberships',
  'brand',
  'community_settings',
];

async function clearStoredRows(sql: Sql) {
  for (const table of STORED_TABLES) {
    await sql.query(`DELETE FROM ${table}`);
  }
}

