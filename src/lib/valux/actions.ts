'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crm } from '@/lib/crm/db';
import { getPersonByEmail, personCanReturn, publishedCourse, getProduct, getSettings, canReadCourse } from './data';
import { ensurePerson, grantAccess, type GrantKind } from './fulfill';
import { payoutDueAt, periodYm, slugify } from './money';
import { createPaypalOrder, paypalConfigured, sendPaypalPayout } from './paypal';
import { academiaPersonId, setAcademiaPerson } from './session';
import { createStripeCheckout, stripeConfigured } from './stripe';
import { sendAcademiaMail } from './mail';
import { storedFile } from './upload';

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function cents(raw: string) {
  const value = Number(raw.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function refresh() {
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/academia', 'layout');
}

async function origin() {
  const incoming = await headers();
  const host = incoming.get('x-forwarded-host') || incoming.get('host') || 'localhost:3000';
  const proto = incoming.get('x-forwarded-proto') || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

async function checkout(input: {
  kind: GrantKind;
  itemId?: string | null;
  name: string;
  email: string;
  amountCents: number;
  months?: number;
  monthlyCents?: number;
  description: string;
  failPath: string;
}) {
  if (!input.email.includes('@') || !input.name) redirect(`${input.failPath}?error=datos`);
  if (input.amountCents <= 0) {
    const result = await grantAccess(input);
    if (result.personId) await setAcademiaPerson(result.personId);
    refresh();
    redirect(result.path);
  }
  if (!paypalConfigured() && !stripeConfigured()) redirect(`${input.failPath}?error=pasarela`);
  try {
    const base = await origin();
    const sql = await crm();
    if (paypalConfigured()) {
      const order = await createPaypalOrder({
        amountCents: input.amountCents,
        description: input.description,
        returnUrl: `${base}/academia/paypal/retorno`,
        cancelUrl: `${base}/academia/paypal/cancelado`,
      });
      await sql`
        INSERT INTO valux_intents (id, paypal_order_id, kind, item_id, buyer_name, buyer_email, amount_cents, months)
        VALUES (
          ${crypto.randomUUID()}, ${order.id}, ${input.kind}, ${input.itemId || null},
          ${input.name}, ${input.email.toLowerCase()}, ${input.amountCents}, ${input.months || 1}
        )
      `;
      redirect(order.approveUrl);
    }
    const session = await createStripeCheckout({
      amountCents: input.amountCents,
      description: input.description,
      email: input.email,
      successUrl: `${base}/academia/stripe/retorno?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/academia/paypal/cancelado`,
      metadata: {
        kind: input.kind,
        item_id: input.itemId || '',
        buyer_name: input.name,
        buyer_email: input.email.toLowerCase(),
        months: String(input.months || 1),
        monthly_cents: String(input.monthlyCents || 0),
      },
    });
    await sql`
      INSERT INTO valux_intents (id, paypal_order_id, kind, item_id, buyer_name, buyer_email, amount_cents, months)
      VALUES (
        ${crypto.randomUUID()}, ${session.id}, ${input.kind}, ${input.itemId || null},
        ${input.name}, ${input.email.toLowerCase()}, ${input.amountCents}, ${input.months || 1}
      )
    `;
    redirect(session.url);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    redirect(`${input.failPath}?error=pago`);
  }
}

export async function buyCourse(formData: FormData) {
  const course = await publishedCourse(field(formData, 'slug'));
  if (!course) return;
  await checkout({
    kind: 'curso',
    itemId: course.id,
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    amountCents: course.price_cents,
    description: course.title,
    failPath: `/academia/${course.slug}`,
  });
}

export async function buyProduct(formData: FormData) {
  const product = await getProduct(field(formData, 'id'));
  if (!product || product.review_status !== 'publicado') return;
  await checkout({
    kind: 'producto',
    itemId: product.id,
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    amountCents: product.price_cents,
    description: product.title,
    failPath: `/academia/marketplace/${product.id}`,
  });
}

export async function buySubscription(formData: FormData) {
  const settings = await getSettings();
  const months = Math.max(1, Math.min(12, Number(field(formData, 'months')) || 1));
  await checkout({
    kind: 'suscripcion',
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    amountCents: settings.subscription_cents * months,
    months,
    description: 'Suscripción de la academia',
    failPath: '/academia/suscripcion',
  });
}

export async function donate(formData: FormData) {
  const months = Math.max(1, Math.min(24, Number(field(formData, 'months')) || 1));
  const monthly = cents(field(formData, 'monthly'));
  await checkout({
    kind: 'donacion',
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    amountCents: monthly * months,
    monthlyCents: monthly,
    months,
    description: 'Donación a la academia',
    failPath: '/academia/apoyar',
  });
}

export async function enterAcademia(formData: FormData) {
  const person = await personCanReturn(field(formData, 'email'));
  if (!person) redirect('/academia/entrar?error=1');
  await setAcademiaPerson(person.id);
  redirect('/academia');
}

export async function updateProfile(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  await sql`
    UPDATE valux_people
    SET name = ${field(formData, 'name')},
      bio = ${field(formData, 'bio')},
      niche = ${field(formData, 'niche')},
      instagram_url = ${field(formData, 'instagram_url') || null},
      portfolio_url = ${field(formData, 'portfolio_url') || null},
      paypal_email = ${field(formData, 'paypal_email') || null}
    WHERE id = ${id}
  `;
  refresh();
}

export async function subscribeNewsletter(formData: FormData) {
  const email = field(formData, 'email').toLowerCase();
  if (!email.includes('@')) return;
  const sql = await crm();
  await sql`
    INSERT INTO valux_newsletter (id, email)
    VALUES (${crypto.randomUUID()}, ${email})
    ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL
  `;
  refresh();
}

export async function saveSettings(formData: FormData) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(field(formData, 'commission')) || 0)));
  const sql = await crm();
  await sql`
    UPDATE valux_settings
    SET commission_percent = ${percent}, subscription_cents = ${cents(field(formData, 'subscription'))}
    WHERE id = 'valux'
  `;
  refresh();
}

export async function createPerson(formData: FormData) {
  const name = field(formData, 'name');
  const email = field(formData, 'email');
  const role = field(formData, 'role') || 'usuario';
  const allowed = ['usuario', 'suscriptor', 'asociado', 'profesor', 'junta'];
  if (!name || !email.includes('@')) return;
  await ensurePerson(email, name, allowed.includes(role) ? role : 'usuario');
  const sql = await crm();
  await sql`
    UPDATE valux_people
    SET role = ${allowed.includes(role) ? role : 'usuario'},
      paypal_email = ${field(formData, 'paypal_email') || null},
      bio = ${field(formData, 'bio')},
      niche = ${field(formData, 'niche')}
    WHERE email = ${email.toLowerCase()}
  `;
  refresh();
}

export async function updatePerson(formData: FormData) {
  const id = field(formData, 'id');
  const role = field(formData, 'role');
  const allowed = ['usuario', 'suscriptor', 'asociado', 'profesor', 'junta'];
  if (!id || !allowed.includes(role)) return;
  const sql = await crm();
  const active = field(formData, 'is_active') === 'no' ? 'no' : 'si';
  await sql`
    UPDATE valux_people
    SET role = ${role},
      paypal_email = ${field(formData, 'paypal_email') || null},
      is_active = CASE WHEN ${active} = 'si' THEN true ELSE false END
    WHERE id = ${id}
  `;
  refresh();
}

export async function createProduct(formData: FormData) {
  const title = field(formData, 'title');
  if (!title) return;
  const direct = field(formData, 'published') === 'on' ? 'publicado' : 'pendiente';
  const sql = await crm();
  const cover = await storedFile(formData, 'cover', 'cover_url');
  const download = await storedFile(formData, 'file', 'download_url');
  await sql`
    INSERT INTO valux_products (id, creator_id, title, description, price_cents, cover_url, download_url, review_status)
    VALUES (
      ${crypto.randomUUID()}, ${field(formData, 'creator_id') || null}, ${title}, ${field(formData, 'description')},
      ${cents(field(formData, 'price'))}, ${cover}, ${download}, ${direct}
    )
  `;
  refresh();
}

export async function reviewProduct(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['publicado', 'rechazado', 'pendiente'].includes(status)) return;
  const sql = await crm();
  await sql`
    UPDATE valux_products
    SET review_status = ${status}, rejection_reason = ${field(formData, 'reason') || null}
    WHERE id = ${id}
  `;
  refresh();
}

async function uniqueSlug(title: string) {
  const sql = await crm();
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while ((await sql`SELECT id FROM valux_posts WHERE slug = ${slug}`).length) {
    n += 1;
    slug = `${base.slice(0, 66)}-${n}`;
  }
  return slug;
}

async function notifyReaders(title: string, slug: string) {
  const sql = await crm();
  const rows = await sql`SELECT email FROM valux_newsletter WHERE unsubscribed_at IS NULL`;
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const proto = h.get('x-forwarded-proto') || 'https';
  const link = host ? `${proto}://${host}/academia/blog/${slug}` : `/academia/blog/${slug}`;
  for (const row of rows) {
    const email = String((row as { email?: string }).email || '');
    await sendAcademiaMail(email, `Nueva nota: ${title}`, `Publicamos una nota en la academia:\n\n${title}\n${link}\n`);
  }
}

export async function createPost(formData: FormData) {
  const title = field(formData, 'title');
  if (!title) return;
  const status = field(formData, 'published') === 'on' ? 'publicado' : 'pendiente';
  const sql = await crm();
  const slug = await uniqueSlug(title);
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    INSERT INTO valux_posts (id, slug, author_id, title, excerpt, body, cover_url, status, published_at)
    VALUES (
      ${crypto.randomUUID()}, ${slug}, ${field(formData, 'author_id') || null}, ${title},
      ${field(formData, 'excerpt')}, ${field(formData, 'body')}, ${cover}, ${status},
      CASE WHEN ${status} = 'publicado' THEN now() ELSE NULL END
    )
  `;
  if (status === 'publicado') await notifyReaders(title, slug);
  refresh();
}

export async function updatePost(formData: FormData) {
  const id = field(formData, 'id');
  const title = field(formData, 'title');
  if (!id || !title) return;
  const sql = await crm();
  const cover = await storedFile(formData, 'cover', 'cover_url');
  await sql`
    UPDATE valux_posts
    SET title = ${title}, excerpt = ${field(formData, 'excerpt')}, body = ${field(formData, 'body')},
      cover_url = ${cover}
    WHERE id = ${id}
  `;
  refresh();
  redirect('/dashboard/cursos/blog');
}

export async function reviewPost(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['publicado', 'rechazado', 'pendiente', 'borrador'].includes(status)) return;
  const sql = await crm();
  const previous = await sql`SELECT status, slug, title FROM valux_posts WHERE id = ${id}`;
  const before = previous[0] as { status?: string; slug?: string; title?: string } | undefined;
  await sql`
    UPDATE valux_posts
    SET status = ${status},
      rejection_reason = ${field(formData, 'reason') || null},
      published_at = CASE WHEN ${status} = 'publicado' THEN COALESCE(published_at, now()) ELSE published_at END
    WHERE id = ${id}
  `;
  if (status === 'publicado' && before?.status !== 'publicado' && before?.slug) {
    await notifyReaders(before.title || 'Nueva nota', before.slug);
  }
  refresh();
}

const APPLICATION_FIELDS = [
  'photo_url', 'birth_date', 'birth_place', 'nationality', 'identity_number', 'gender', 'marital_status',
  'address', 'phone', 'blood_type', 'height_weight', 'alt_contact', 'favorite_colors', 'favorite_food',
  'favorite_dessert', 'hobby', 'occupation', 'workplace', 'education_level', 'profession', 'org_value',
  'skills', 'social_media', 'medical_condition', 'allergies', 'signature', 'declaration_date',
] as const;

export async function submitApplication(formData: FormData) {
  const email = field(formData, 'email').toLowerCase();
  const fullName = field(formData, 'full_name');
  if (!email.includes('@') || !fullName) redirect('/academia/ficha?error=datos');
  const sql = await crm();
  const values = APPLICATION_FIELDS.map((key) => field(formData, key));
  await sql`
    INSERT INTO valux_applications (
      id, email, full_name, photo_url, birth_date, birth_place, nationality, identity_number, gender,
      marital_status, address, phone, blood_type, height_weight, alt_contact, favorite_colors, favorite_food,
      favorite_dessert, hobby, occupation, workplace, education_level, profession, org_value, skills,
      social_media, medical_condition, allergies, signature, declaration_date
    ) VALUES (
      ${crypto.randomUUID()}, ${email}, ${fullName},
      ${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]}, ${values[5]}, ${values[6]},
      ${values[7]}, ${values[8]}, ${values[9]}, ${values[10]}, ${values[11]}, ${values[12]}, ${values[13]},
      ${values[14]}, ${values[15]}, ${values[16]}, ${values[17]}, ${values[18]}, ${values[19]}, ${values[20]},
      ${values[21]}, ${values[22]}, ${values[23]}, ${values[24]}, ${values[25]}, ${values[26]}
    )
  `;
  refresh();
  redirect('/academia/ficha?ok=1');
}

export async function setApplicationStatus(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['nueva', 'revision', 'aceptada', 'rechazada'].includes(status)) return;
  const sql = await crm();
  await sql`
    UPDATE valux_applications SET status = ${status}, notes = ${field(formData, 'notes') || null} WHERE id = ${id}
  `;
  if (status === 'aceptada') {
    const rows = await sql`SELECT email, full_name FROM valux_applications WHERE id = ${id}`;
    const entry = rows[0] as { email?: string; full_name?: string } | undefined;
    if (entry?.email && entry.full_name) {
      await ensurePerson(entry.email, entry.full_name, 'asociado');
      await sendAcademiaMail(
        entry.email,
        'Tu ficha fue aceptada',
        `Hola ${entry.full_name},\n\nLa junta aceptó tu ficha. Ya estás como asociado en la academia.\n`,
      );
    }
  }
  refresh();
}

export async function setSubscriptionStatus(formData: FormData) {
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['activa', 'cancelada', 'vencida'].includes(status)) return;
  const sql = await crm();
  await sql`UPDATE valux_subscriptions SET status = ${status} WHERE id = ${id}`;
  refresh();
}

export async function buildPayouts(formData: FormData) {
  const period = field(formData, 'period') || periodYm();
  if (!/^\d{4}-\d{2}$/.test(period)) return;
  const sql = await crm();
  const rows = await sql`
    SELECT seller_id, COALESCE(sum(seller_cents), 0) AS due
    FROM valux_sales
    WHERE period_ym = ${period} AND seller_id IS NOT NULL
    GROUP BY seller_id
  `;
  const dueAt = payoutDueAt(period).toISOString();
  for (const row of rows) {
    const entry = row as { seller_id?: string; due?: unknown };
    if (!entry.seller_id) continue;
    const amount = Number(entry.due) || 0;
    await sql`
      INSERT INTO valux_payouts (id, seller_id, period_ym, amount_cents, status, due_at)
      VALUES (${crypto.randomUUID()}, ${entry.seller_id}, ${period}, ${amount}, 'pendiente', ${dueAt})
      ON CONFLICT (seller_id, period_ym) DO UPDATE SET
        amount_cents = CASE WHEN valux_payouts.status = 'pendiente' THEN EXCLUDED.amount_cents ELSE valux_payouts.amount_cents END
    `;
  }
  refresh();
}

export async function markPayout(formData: FormData) {
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const rows = await sql`
    SELECT y.amount_cents, y.status, p.paypal_email
    FROM valux_payouts y
    JOIN valux_people p ON p.id = y.seller_id
    WHERE y.id = ${id}
  `;
  const entry = rows[0] as { amount_cents?: unknown; status?: string; paypal_email?: string | null } | undefined;
  if (!entry || entry.status === 'transferida') return;
  const amount = Number(entry.amount_cents) || 0;
  const paypalEmail = String(entry.paypal_email || '').trim();
  if (paypalConfigured()) {
    if (!paypalEmail) {
      await sql`UPDATE valux_payouts SET notes = 'Falta el correo de PayPal del vendedor.' WHERE id = ${id}`;
      refresh();
      return;
    }
    const sent = await sendPaypalPayout({ payoutId: id, email: paypalEmail, amountCents: amount });
    if (!sent) {
      await sql`UPDATE valux_payouts SET notes = 'PayPal no aceptó el envío.' WHERE id = ${id}`;
      refresh();
      return;
    }
  }
  await sql`
    UPDATE valux_payouts
    SET status = 'transferida', transferred_at = now(), notes = ${field(formData, 'notes') || null}
    WHERE id = ${id}
  `;
  refresh();
}

export async function completeLesson(formData: FormData) {
  const personId = await academiaPersonId();
  const lessonId = field(formData, 'lesson_id');
  const nextUrl = field(formData, 'next') || '/academia';
  if (!personId || !lessonId) redirect('/academia/entrar');
  const sql = await crm();
  const rows = await sql`
    SELECT c.id, c.price_cents, c.teacher_id, c.published
    FROM lms_lessons l
    JOIN lms_courses c ON c.id = l.course_id
    WHERE l.id = ${lessonId}
  `;
  const course = rows[0] as { id?: string; price_cents?: unknown; teacher_id?: string | null; published?: unknown } | undefined;
  const published = course?.published === true || course?.published === 't' || course?.published === 'true';
  if (!course?.id || !published) return;
  const open = await canReadCourse(personId, {
    id: course.id,
    price_cents: Number(course.price_cents) || 0,
    teacher_id: course.teacher_id || '',
  });
  if (!open) redirect(nextUrl);
  const when = new Date().toISOString();
  await sql`
    INSERT INTO lms_progress (id, person_id, lesson_id, completed_at)
    VALUES (${crypto.randomUUID()}, ${personId}, ${lessonId}, ${when})
    ON CONFLICT (person_id, lesson_id) WHERE person_id IS NOT NULL DO UPDATE SET
      completed_at = COALESCE(lms_progress.completed_at, EXCLUDED.completed_at)
  `;
  refresh();
  redirect(nextUrl);
}

export async function recordSale(formData: FormData) {
  const person = await getPersonByEmail(field(formData, 'email'));
  const name = person?.name || field(formData, 'name');
  const email = person?.email || field(formData, 'email');
  const kind = field(formData, 'kind') as GrantKind;
  if (!['curso', 'producto', 'suscripcion'].includes(kind)) return;
  await grantAccess({
    kind,
    itemId: (kind === 'producto' ? field(formData, 'product_id') : field(formData, 'course_id')) || null,
    name,
    email,
    months: Number(field(formData, 'months')) || 1,
  });
  refresh();
  if (kind === 'suscripcion') redirect('/dashboard/cursos/suscripcion');
  redirect('/dashboard/cursos/ventas');
}
