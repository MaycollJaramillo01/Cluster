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
  `CREATE TABLE IF NOT EXISTS lms_courses (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lms_lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    video_url TEXT,
    points INTEGER NOT NULL DEFAULT 10,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (course_id, slug)
  )`,
  `CREATE TABLE IF NOT EXISTS lms_enrollments (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    final_grade INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, contact_id)
  )`,
  `CREATE TABLE IF NOT EXISTS lms_progress (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
    score INTEGER,
    completed_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    UNIQUE (contact_id, lesson_id)
  )`,
  `CREATE TABLE IF NOT EXISTS valux_people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'usuario',
    paypal_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    bio TEXT NOT NULL DEFAULT '',
    niche TEXT NOT NULL DEFAULT '',
    instagram_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lms_sections (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS lms_resources (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    content TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS valux_products (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL DEFAULT 0,
    cover_url TEXT,
    download_url TEXT NOT NULL DEFAULT '',
    review_status TEXT NOT NULL DEFAULT 'pendiente',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    author_id TEXT,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    status TEXT NOT NULL DEFAULT 'borrador',
    rejection_reason TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_sales (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    buyer_id TEXT,
    seller_id TEXT,
    course_id TEXT,
    product_id TEXT,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    fee_cents INTEGER NOT NULL DEFAULT 0,
    seller_cents INTEGER NOT NULL DEFAULT 0,
    paypal_order_id TEXT UNIQUE,
    period_ym TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_applications (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    photo_url TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    birth_place TEXT NOT NULL DEFAULT '',
    nationality TEXT NOT NULL DEFAULT '',
    identity_number TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    marital_status TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    blood_type TEXT NOT NULL DEFAULT '',
    height_weight TEXT NOT NULL DEFAULT '',
    alt_contact TEXT NOT NULL DEFAULT '',
    favorite_colors TEXT NOT NULL DEFAULT '',
    favorite_food TEXT NOT NULL DEFAULT '',
    favorite_dessert TEXT NOT NULL DEFAULT '',
    hobby TEXT NOT NULL DEFAULT '',
    occupation TEXT NOT NULL DEFAULT '',
    workplace TEXT NOT NULL DEFAULT '',
    education_level TEXT NOT NULL DEFAULT '',
    profession TEXT NOT NULL DEFAULT '',
    org_value TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '',
    social_media TEXT NOT NULL DEFAULT '',
    medical_condition TEXT NOT NULL DEFAULT '',
    allergies TEXT NOT NULL DEFAULT '',
    signature TEXT NOT NULL DEFAULT '',
    declaration_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'nueva',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_subscriptions (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activa',
    current_period_end TIMESTAMPTZ NOT NULL,
    paypal_order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_donations (
    id TEXT PRIMARY KEY,
    monthly_cents INTEGER NOT NULL,
    months INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    paypal_order_id TEXT UNIQUE,
    payer_email TEXT,
    payer_name TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_payouts (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    period_ym TEXT NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pendiente',
    due_at TIMESTAMPTZ NOT NULL,
    transferred_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (seller_id, period_ym)
  )`,
  `CREATE TABLE IF NOT EXISTS valux_settings (
    id TEXT PRIMARY KEY,
    commission_percent INTEGER NOT NULL DEFAULT 30,
    subscription_cents INTEGER NOT NULL DEFAULT 2000
  )`,
  `CREATE TABLE IF NOT EXISTS valux_newsletter (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS valux_intents (
    id TEXT PRIMARY KEY,
    paypal_order_id TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    item_id TEXT,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    months INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `INSERT INTO valux_settings (id, commission_percent, subscription_cents) VALUES ('valux', 30, 2000) ON CONFLICT (id) DO NOTHING`,
  `ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS cover_url TEXT`,
  `ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS teacher_id TEXT`,
  `ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS section_id TEXT`,
  `ALTER TABLE lms_lessons ADD COLUMN IF NOT EXISTS duration_min INTEGER`,
  `ALTER TABLE lms_enrollments ADD COLUMN IF NOT EXISTS person_id TEXT`,
  `ALTER TABLE lms_enrollments ALTER COLUMN contact_id DROP NOT NULL`,
  `ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS person_id TEXT`,
  `ALTER TABLE lms_progress ALTER COLUMN contact_id DROP NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS lms_enroll_person_idx ON lms_enrollments (course_id, person_id) WHERE person_id IS NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS lms_progress_person_idx ON lms_progress (person_id, lesson_id) WHERE person_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS contacts_created_idx ON contacts (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS bookings_starts_idx ON bookings (starts_at)`,
  `CREATE INDEX IF NOT EXISTS messages_contact_idx ON messages (contact_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS crm_admins (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE form_submits ADD COLUMN IF NOT EXISTS details TEXT`,
  `ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered BOOLEAN`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS gateway_id TEXT`,
  `CREATE TABLE IF NOT EXISTS automation_runs (
    automation_id TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    PRIMARY KEY (automation_id, contact_id)
  )`,
  `CREATE TABLE IF NOT EXISTS automation_jobs (
    id TEXT PRIMARY KEY,
    automation_id TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    step_index INTEGER NOT NULL,
    run_at TIMESTAMPTZ NOT NULL,
    done_at TIMESTAMPTZ
  )`,
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
  'lms_resources',
  'lms_progress',
  'lms_enrollments',
  'lms_lessons',
  'lms_sections',
  'valux_sales',
  'valux_intents',
  'lms_courses',
  'valux_payouts',
  'valux_subscriptions',
  'valux_posts',
  'valux_products',
  'valux_donations',
  'valux_applications',
  'valux_newsletter',
  'valux_people',
  'valux_settings',
  'automation_jobs',
  'automation_runs',
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
  'crm_admins',
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

