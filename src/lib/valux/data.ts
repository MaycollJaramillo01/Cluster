import { crm } from '@/lib/crm/db';

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown) {
  return value == null ? '' : String(value);
}

function bool(value: unknown) {
  return value === true || value === 't' || value === 'true';
}

export type ValuxPerson = {
  id: string;
  name: string;
  email: string;
  role: string;
  paypal_email: string;
  is_active: boolean;
  bio: string;
  niche: string;
  instagram_url: string;
  portfolio_url: string;
};

export type ValuxSettings = { commission_percent: number; subscription_cents: number };

function mapPerson(row: Record<string, unknown>): ValuxPerson {
  return {
    id: text(row.id),
    name: text(row.name),
    email: text(row.email),
    role: text(row.role),
    paypal_email: text(row.paypal_email),
    is_active: bool(row.is_active),
    bio: text(row.bio),
    niche: text(row.niche),
    instagram_url: text(row.instagram_url),
    portfolio_url: text(row.portfolio_url),
  };
}

export async function getSettings(): Promise<ValuxSettings> {
  const sql = await crm();
  const rows = await sql`SELECT commission_percent, subscription_cents FROM valux_settings WHERE id = 'valux'`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return {
    commission_percent: num(row?.commission_percent) || 30,
    subscription_cents: num(row?.subscription_cents) || 2000,
  };
}

export async function listPeople() {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, email, role, paypal_email, is_active, bio, niche, instagram_url, portfolio_url
    FROM valux_people
    ORDER BY name
  `;
  return rows.map((row) => mapPerson(row as Record<string, unknown>));
}

export async function getPerson(id: string) {
  if (!id) return null;
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, email, role, paypal_email, is_active, bio, niche, instagram_url, portfolio_url
    FROM valux_people WHERE id = ${id}
  `;
  return rows[0] ? mapPerson(rows[0] as Record<string, unknown>) : null;
}

export async function getPersonByEmail(email: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT id, name, email, role, paypal_email, is_active, bio, niche, instagram_url, portfolio_url
    FROM valux_people WHERE email = ${email.trim().toLowerCase()}
  `;
  return rows[0] ? mapPerson(rows[0] as Record<string, unknown>) : null;
}

export async function listProducts(status?: string) {
  const sql = await crm();
  const filter = status?.trim() || '';
  const rows = await sql`
    SELECT p.id, p.title, p.description, p.price_cents, p.cover_url, p.download_url,
      p.review_status, p.rejection_reason, p.creator_id, v.name AS creator_name, p.created_at
    FROM valux_products p
    LEFT JOIN valux_people v ON v.id = p.creator_id
    WHERE ${filter} = '' OR p.review_status = ${filter}
    ORDER BY p.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      title: text(entry.title),
      description: text(entry.description),
      price_cents: num(entry.price_cents),
      cover_url: text(entry.cover_url),
      download_url: text(entry.download_url),
      review_status: text(entry.review_status),
      rejection_reason: text(entry.rejection_reason),
      creator_id: text(entry.creator_id),
      creator_name: text(entry.creator_name),
      created_at: text(entry.created_at),
    };
  });
}

export async function getProduct(id: string) {
  const products = await listProducts();
  return products.find((item) => item.id === id) || null;
}

export async function listPosts(status?: string) {
  const sql = await crm();
  const filter = status?.trim() || '';
  const rows = await sql`
    SELECT p.id, p.slug, p.title, p.excerpt, p.body, p.cover_url, p.status, p.rejection_reason,
      p.author_id, v.name AS author_name, p.published_at, p.created_at
    FROM valux_posts p
    LEFT JOIN valux_people v ON v.id = p.author_id
    WHERE ${filter} = '' OR p.status = ${filter}
    ORDER BY p.created_at DESC
  `;
  return rows.map(mapPost);
}

export async function getPost(id: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT p.id, p.slug, p.title, p.excerpt, p.body, p.cover_url, p.status, p.rejection_reason,
      p.author_id, v.name AS author_name, p.published_at, p.created_at
    FROM valux_posts p
    LEFT JOIN valux_people v ON v.id = p.author_id
    WHERE p.id = ${id}
  `;
  return rows[0] ? mapPost(rows[0] as Record<string, unknown>) : null;
}

export async function getPostBySlug(slug: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT p.id, p.slug, p.title, p.excerpt, p.body, p.cover_url, p.status, p.rejection_reason,
      p.author_id, v.name AS author_name, p.published_at, p.created_at
    FROM valux_posts p
    LEFT JOIN valux_people v ON v.id = p.author_id
    WHERE p.slug = ${slug} AND p.status = 'publicado'
  `;
  return rows[0] ? mapPost(rows[0] as Record<string, unknown>) : null;
}

function mapPost(row: Record<string, unknown>) {
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    excerpt: text(row.excerpt),
    body: text(row.body),
    cover_url: text(row.cover_url),
    status: text(row.status),
    rejection_reason: text(row.rejection_reason),
    author_id: text(row.author_id),
    author_name: text(row.author_name),
    published_at: text(row.published_at),
    created_at: text(row.created_at),
  };
}

export async function listSales() {
  const sql = await crm();
  const rows = await sql`
    SELECT s.id, s.kind, s.amount_cents, s.fee_cents, s.seller_cents, s.period_ym, s.created_at,
      b.name AS buyer_name, v.name AS seller_name, c.title AS course_title, p.title AS product_title
    FROM valux_sales s
    LEFT JOIN valux_people b ON b.id = s.buyer_id
    LEFT JOIN valux_people v ON v.id = s.seller_id
    LEFT JOIN lms_courses c ON c.id = s.course_id
    LEFT JOIN valux_products p ON p.id = s.product_id
    ORDER BY s.created_at DESC
    LIMIT 200
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      kind: text(entry.kind),
      amount_cents: num(entry.amount_cents),
      fee_cents: num(entry.fee_cents),
      seller_cents: num(entry.seller_cents),
      period_ym: text(entry.period_ym),
      created_at: text(entry.created_at),
      buyer_name: text(entry.buyer_name),
      seller_name: text(entry.seller_name),
      item_title: text(entry.course_title) || text(entry.product_title) || 'Suscripción',
    };
  });
}

export async function listClients() {
  const sql = await crm();
  const rows = await sql`
    SELECT b.id, b.name, b.email, count(s.id) AS purchases, COALESCE(sum(s.amount_cents), 0) AS spent
    FROM valux_sales s
    JOIN valux_people b ON b.id = s.buyer_id
    GROUP BY b.id, b.name, b.email
    ORDER BY spent DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      name: text(entry.name),
      email: text(entry.email),
      purchases: num(entry.purchases),
      spent: num(entry.spent),
    };
  });
}

export async function listApplications() {
  const sql = await crm();
  const rows = await sql`SELECT * FROM valux_applications ORDER BY created_at DESC`;
  return rows.map((row) => row as Record<string, unknown>);
}

export async function listSubscriptions() {
  const sql = await crm();
  const rows = await sql`
    SELECT s.id, s.status, s.current_period_end, s.created_at, p.name, p.email
    FROM valux_subscriptions s
    JOIN valux_people p ON p.id = s.person_id
    ORDER BY s.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      status: text(entry.status),
      current_period_end: text(entry.current_period_end),
      created_at: text(entry.created_at),
      name: text(entry.name),
      email: text(entry.email),
    };
  });
}

export async function listDonations() {
  const sql = await crm();
  const rows = await sql`
    SELECT id, monthly_cents, months, total_cents, status, payer_email, payer_name, paid_at, created_at
    FROM valux_donations
    ORDER BY created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      monthly_cents: num(entry.monthly_cents),
      months: num(entry.months),
      total_cents: num(entry.total_cents),
      status: text(entry.status),
      payer_email: text(entry.payer_email),
      payer_name: text(entry.payer_name),
      paid_at: text(entry.paid_at),
      created_at: text(entry.created_at),
    };
  });
}

export async function listPayouts() {
  const sql = await crm();
  const rows = await sql`
    SELECT y.id, y.period_ym, y.amount_cents, y.status, y.due_at, y.transferred_at, y.notes, p.name, p.paypal_email
    FROM valux_payouts y
    JOIN valux_people p ON p.id = y.seller_id
    ORDER BY y.period_ym DESC, p.name
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      period_ym: text(entry.period_ym),
      amount_cents: num(entry.amount_cents),
      status: text(entry.status),
      due_at: text(entry.due_at),
      transferred_at: text(entry.transferred_at),
      notes: text(entry.notes),
      name: text(entry.name),
      paypal_email: text(entry.paypal_email),
    };
  });
}

export async function publishedCourses() {
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.slug, c.title, c.description, c.price_cents, c.cover_url, c.teacher_id, v.name AS teacher_name,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
      (SELECT COALESCE(sum(duration_min), 0) FROM lms_lessons l WHERE l.course_id = c.id) AS minutes,
      (SELECT count(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS students
    FROM lms_courses c
    LEFT JOIN valux_people v ON v.id = c.teacher_id
    WHERE c.published
    ORDER BY c.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      id: text(entry.id),
      slug: text(entry.slug),
      title: text(entry.title),
      description: text(entry.description),
      price_cents: num(entry.price_cents),
      cover_url: text(entry.cover_url),
      teacher_id: text(entry.teacher_id),
      teacher_name: text(entry.teacher_name),
      lessons: num(entry.lessons),
      minutes: num(entry.minutes),
      students: num(entry.students),
    };
  });
}

export async function publishedCourse(slug: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.slug, c.title, c.description, c.price_cents, c.cover_url, c.teacher_id, c.published, v.name AS teacher_name,
      (SELECT count(*) FROM lms_enrollments e WHERE e.course_id = c.id) AS students
    FROM lms_courses c
    LEFT JOIN valux_people v ON v.id = c.teacher_id
    WHERE c.slug = ${slug}
  `;
  const entry = rows[0] as Record<string, unknown> | undefined;
  if (!entry || !bool(entry.published)) return null;
  const courseId = text(entry.id);
  const sections = await sql`
    SELECT id, title, sort_order FROM lms_sections WHERE course_id = ${courseId} ORDER BY sort_order, title
  `;
  const lessons = await sql`
    SELECT id, slug, title, section_id, duration_min, sort_order
    FROM lms_lessons WHERE course_id = ${courseId} ORDER BY sort_order, title
  `;
  return {
    id: courseId,
    slug: text(entry.slug),
    title: text(entry.title),
    description: text(entry.description),
    price_cents: num(entry.price_cents),
    cover_url: text(entry.cover_url),
    teacher_id: text(entry.teacher_id),
    teacher_name: text(entry.teacher_name),
    students: num(entry.students),
    sections: sections.map((row) => {
      const section = row as Record<string, unknown>;
      return { id: text(section.id), title: text(section.title) };
    }),
    lessons: lessons.map((row) => {
      const lesson = row as Record<string, unknown>;
      return {
        id: text(lesson.id),
        slug: text(lesson.slug),
        title: text(lesson.title),
        section_id: text(lesson.section_id),
        duration_min: lesson.duration_min == null ? null : num(lesson.duration_min),
      };
    }),
  };
}

export async function completedLessonIds(personId: string, courseId: string) {
  if (!personId) return [] as string[];
  const sql = await crm();
  const rows = await sql`
    SELECT p.lesson_id
    FROM lms_progress p
    JOIN lms_lessons l ON l.id = p.lesson_id
    WHERE p.person_id = ${personId} AND l.course_id = ${courseId} AND p.completed_at IS NOT NULL
  `;
  return rows.map((row) => text((row as { lesson_id?: unknown }).lesson_id));
}

export async function publishedLesson(courseSlug: string, lessonSlug: string) {
  const course = await publishedCourse(courseSlug);
  if (!course) return null;
  const sql = await crm();
  const rows = await sql`
    SELECT id, slug, title, content, video_url, points, duration_min
    FROM lms_lessons
    WHERE course_id = ${course.id} AND slug = ${lessonSlug}
  `;
  const entry = rows[0] as Record<string, unknown> | undefined;
  if (!entry) return null;
  const resources = await sql`
    SELECT id, kind, title, url, content FROM lms_resources WHERE lesson_id = ${text(entry.id)} ORDER BY sort_order, title
  `;
  return {
    course,
    lesson: {
      id: text(entry.id),
      slug: text(entry.slug),
      title: text(entry.title),
      content: text(entry.content),
      video_url: text(entry.video_url),
      points: num(entry.points),
      duration_min: entry.duration_min == null ? null : num(entry.duration_min),
      resources: resources.map((row) => {
        const resource = row as Record<string, unknown>;
        return {
          id: text(resource.id),
          kind: text(resource.kind),
          title: text(resource.title),
          url: text(resource.url),
          content: text(resource.content),
        };
      }),
    },
  };
}

async function seatActive(personId: string, role: string) {
  if (role === 'junta') return true;
  if (role === 'suscriptor') return true;
  const sql = await crm();
  const rows = await sql`
    SELECT status, current_period_end FROM valux_subscriptions WHERE person_id = ${personId}
  `;
  if (role === 'asociado' && rows.length === 0) return true;
  const now = Date.now();
  return rows.some((row) => {
    const entry = row as Record<string, unknown>;
    return text(entry.status) === 'activa' && new Date(text(entry.current_period_end)).getTime() > now;
  });
}

export async function canReadCourse(personId: string, course: { id: string; price_cents: number; teacher_id: string }) {
  if (course.price_cents <= 0) return true;
  const person = await getPerson(personId);
  if (!person || !person.is_active) return false;
  if (person.role === 'junta') return true;
  if (person.role === 'profesor' && person.id === course.teacher_id) return true;
  if (await seatActive(person.id, person.role)) return true;
  const sql = await crm();
  const rows = await sql`
    SELECT id FROM lms_enrollments WHERE course_id = ${course.id} AND person_id = ${person.id}
  `;
  return rows.length > 0;
}

export async function canReadProduct(personId: string, product: { id: string; price_cents: number; creator_id: string }) {
  if (product.price_cents <= 0) return true;
  const person = await getPerson(personId);
  if (!person || !person.is_active) return false;
  if (person.role === 'junta' || person.id === product.creator_id) return true;
  if (await seatActive(person.id, person.role)) return true;
  const sql = await crm();
  const rows = await sql`
    SELECT id FROM valux_sales WHERE buyer_id = ${person.id} AND product_id = ${product.id}
  `;
  return rows.length > 0;
}

export async function myCourses(personId: string) {
  if (!personId) return [];
  const sql = await crm();
  const rows = await sql`
    SELECT c.slug, c.title, c.cover_url, v.name AS teacher_name,
      (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
      (
        SELECT count(*) FROM lms_progress p
        JOIN lms_lessons l ON l.id = p.lesson_id
        WHERE l.course_id = c.id AND p.person_id = ${personId} AND p.completed_at IS NOT NULL
      ) AS done
    FROM lms_enrollments e
    JOIN lms_courses c ON c.id = e.course_id
    LEFT JOIN valux_people v ON v.id = c.teacher_id
    WHERE e.person_id = ${personId}
    ORDER BY e.created_at DESC
  `;
  return rows.map((row) => {
    const entry = row as Record<string, unknown>;
    return {
      slug: text(entry.slug),
      title: text(entry.title),
      cover_url: text(entry.cover_url),
      teacher_name: text(entry.teacher_name),
      lessons: num(entry.lessons),
      done: num(entry.done),
    };
  });
}

export async function personCanReturn(email: string) {
  const person = await getPersonByEmail(email);
  if (!person) return null;
  const sql = await crm();
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM lms_enrollments WHERE person_id = ${person.id}) AS enrolled,
      (SELECT count(*) FROM valux_sales WHERE buyer_id = ${person.id}) AS sales,
      (SELECT count(*) FROM valux_subscriptions WHERE person_id = ${person.id}) AS subs
  `;
  const entry = rows[0] as Record<string, unknown> | undefined;
  const known = num(entry?.enrolled) + num(entry?.sales) + num(entry?.subs) > 0 || person.role !== 'usuario';
  return known ? person : null;
}

export async function getIntent(orderId: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT kind, item_id, buyer_name, buyer_email, amount_cents, months
    FROM valux_intents WHERE paypal_order_id = ${orderId}
  `;
  const entry = rows[0] as Record<string, unknown> | undefined;
  if (!entry) return null;
  return {
    kind: text(entry.kind) as 'curso' | 'producto' | 'suscripcion' | 'donacion',
    itemId: text(entry.item_id),
    name: text(entry.buyer_name),
    email: text(entry.buyer_email),
    amountCents: num(entry.amount_cents),
    months: num(entry.months) || 1,
  };
}
