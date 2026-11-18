'use server';

import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crm } from '@/lib/crm/db';
import { requireDashboard } from '@/lib/crm/session';
import { site } from '@/lib/site';
import { getPersonByEmail, getPerson, getPlan, lessonAccess, ownsCourse, personSubscription, publishedCourse, getProduct, canReadCourse } from './data';
import { gradeMission, parseMission } from './mission';
import { challengeProgress, getChallenge } from './challenges';
import { computePayouts, ensurePerson, grantAccess, revokeSales, subscriptionCanceled, type GrantKind } from './fulfill';
import { periodYm, slugify } from './money';
import { cancelPaypalSubscription, paypalConfigured, sendPaypalPayout } from './paypal';
import { bankDetails, createTransfer } from './transfers';
import { academiaPersonId, setAcademiaPerson } from './session';
import { cleanPhone, startLogin, verifyLoginCode, verifyLoginLink } from './login';
import { cancelStripeSubscription, createStripeCheckout, stripeConfigured } from './stripe';
import { sendAcademiaMail } from './mail';
import { advanceStage, trackEvent, type Lead } from './events';
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
  method?: string;
  // Order bump: otro curso en el mismo pago, con precio calculado aquí, nunca desde el navegador.
  bump?: { itemId: string; cents: number; title: string } | null;
}) {
  if (!input.email.includes('@') || !input.name) redirect(`${input.failPath}?error=datos`);
  const bump = input.bump && input.bump.cents > 0 ? input.bump : null;
  const total = input.amountCents + (bump?.cents || 0);
  await trackEvent('checkout_started', { email: input.email, data: { kind: input.kind, item: input.itemId || null, cents: total, method: input.method || 'tarjeta' } });
  if (bump) await trackEvent('bump_accepted', { email: input.email, data: { item: bump.itemId, cents: bump.cents } });
  await advanceStage({ email: input.email }, 'checkout');
  if (total <= 0) {
    const result = await grantAccess(input);
    if (result.personId) await setAcademiaPerson(result.personId);
    refresh();
    redirect(result.path);
  }
  if (input.method === 'transferencia') {
    if (!(await bankDetails())) redirect(`${input.failPath}?error=pasarela`);
    let reference = '';
    try {
      reference = await createTransfer({ ...input, amountCents: total, bump });
    } catch (error) {
      console.error('[academia] transferencia:', error);
      redirect(`${input.failPath}?error=pago`);
    }
    redirect(`/academia/transferencia/${reference}`);
  }
  if (!stripeConfigured()) redirect(`${input.failPath}?error=pasarela`);
  try {
    const base = await origin();
    const sql = await crm();
    const recurring = input.kind === 'suscripcion';
    const session = await createStripeCheckout({
      amountCents: input.amountCents,
      extra: bump ? { description: bump.title, amountCents: bump.cents } : undefined,
      description: input.description,
      email: input.email,
      successUrl: `${base}/academia/stripe/retorno?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/academia/paypal/cancelado`,
      recurring,
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
      INSERT INTO valux_intents (
        id, paypal_order_id, kind, item_id, buyer_name, buyer_email, amount_cents, months, bump_item_id, bump_cents
      ) VALUES (
        ${crypto.randomUUID()}, ${session.id}, ${input.kind}, ${input.itemId || null},
        ${input.name}, ${input.email.toLowerCase()}, ${total}, ${input.months || 1},
        ${bump?.itemId || null}, ${bump?.cents || 0}
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
    method: field(formData, 'metodo'),
    failPath: `/academia/${course.slug}`,
    // La casilla llega sin marcar; solo cuenta si la persona la marcó.
    bump: field(formData, 'bump') === '1' && course.bump ? { itemId: course.bump.id, cents: course.bump.cents, title: course.bump.title } : null,
  });
}

// Oferta después de pagar: pago nuevo, con casilla de autorización explícita. No reutiliza la tarjeta.
export async function buyUpsell(formData: FormData) {
  const course = await publishedCourse(field(formData, 'slug'));
  const personId = await academiaPersonId();
  if (!course?.upsell || !personId) redirect('/academia');
  const back = `/academia/${course.slug}`;
  if (!(await ownsCourse(personId, course.id))) redirect(back);
  if (field(formData, 'acepto') !== '1') redirect(`${back}?ok=1&error=acepto`);
  const person = await getPerson(personId);
  if (!person) redirect('/academia/entrar');
  await checkout({
    kind: 'curso',
    itemId: course.upsell.id,
    name: person.name,
    email: person.email,
    amountCents: course.upsell.cents,
    description: `${course.upsell.title} (oferta)`,
    method: field(formData, 'metodo'),
    failPath: back,
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
    method: field(formData, 'metodo'),
    failPath: `/academia/marketplace/${product.id}`,
  });
}

export async function buySubscription(formData: FormData) {
  const plan = await getPlan(field(formData, 'plan'));
  if (!plan?.active) redirect('/academia/suscripcion?error=plan');
  // Cobro mensual recurrente; sin precio, un mes sin cobro.
  await checkout({
    kind: 'suscripcion',
    itemId: plan.id,
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    amountCents: plan.price_cents,
    months: 1,
    description: `Membresía ${plan.name} (mensual)`,
    method: field(formData, 'metodo'),
    failPath: '/academia/suscripcion',
  });
}

async function stopRenewal(gatewayId: string, immediately: boolean) {
  if (!gatewayId) return;
  if (gatewayId.startsWith('I-')) {
    if (paypalConfigured()) await cancelPaypalSubscription(gatewayId);
  } else if (gatewayId.startsWith('sub_')) {
    if (stripeConfigured()) await cancelStripeSubscription(gatewayId, !immediately);
  }
}

export async function cancelMySubscription() {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const current = await personSubscription(personId);
  if (!current || current.status !== 'activa') redirect('/academia/suscripcion');
  try {
    await stopRenewal(current.gateway_id, false);
  } catch {
    redirect('/academia/suscripcion?error=cancelar');
  }
  const sql = await crm();
  await sql`UPDATE valux_subscriptions SET status = 'no_renueva' WHERE id = ${current.id}`;
  await subscriptionCanceled(current.id, personId, 'alumno');
  refresh();
  redirect('/academia/suscripcion?cancelada=1');
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
    method: field(formData, 'metodo'),
    failPath: '/academia/apoyar',
  });
}

// Registro y entrada usan lo mismo: un código o enlace por correo, de un solo uso.
export async function enterAcademia(formData: FormData) {
  const register = field(formData, 'modo') === 'registro';
  const email = field(formData, 'email');
  const name = field(formData, 'name');
  const phone = cleanPhone(field(formData, 'phone'));
  if (!email.includes('@')) redirect(`/academia/entrar?error=datos${register ? '&modo=registro' : ''}`);
  if (register && (!name || !phone)) redirect('/academia/entrar?modo=registro&error=datos');
  // El enlace del correo sale del dominio fijo: un Host falso no puede desviarlo.
  const base = process.env.NODE_ENV === 'production' ? site.url : await origin();
  // Consentimientos: casillas sin marcar por defecto; solo cuentan si la persona las marcó.
  let lead: Lead | undefined;
  if (register) {
    let first: { source?: string; utm?: string } = {};
    try {
      first = JSON.parse((await cookies()).get('cluster_lead')?.value || '{}');
    } catch {
      first = {};
    }
    lead = {
      source: String(first.source || 'directo').slice(0, 80),
      utm: String(first.utm || '').slice(0, 400),
      consentEmail: field(formData, 'consent_email') === '1',
      consentWhatsapp: field(formData, 'consent_whatsapp') === '1',
    };
  }
  const id = await startLogin({ email, name, phone, register, base, lead });
  redirect(`/academia/entrar/codigo?l=${id}`);
}

export async function confirmLoginCode(formData: FormData) {
  const id = field(formData, 'l');
  const personId = await verifyLoginCode(id, field(formData, 'code').replace(/\s/g, ''));
  if (!personId) redirect(`/academia/entrar/codigo?l=${encodeURIComponent(id)}&error=1`);
  await setAcademiaPerson(personId);
  redirect('/academia/mis-cursos');
}

// El enlace se gasta con un clic en un botón: los escáneres de correo solo hacen GET.
export async function confirmLoginLink(formData: FormData) {
  const personId = await verifyLoginLink(field(formData, 't'));
  if (!personId) redirect('/academia/entrar?error=enlace');
  await setAcademiaPerson(personId);
  redirect('/academia/mis-cursos');
}

export async function updateProfile(formData: FormData) {
  // El id sale de la sesión, nunca del formulario.
  const id = await academiaPersonId();
  if (!id) redirect('/academia/entrar');
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
  await requireDashboard('finanzas');
  const percent = Math.max(0, Math.min(100, Math.round(Number(field(formData, 'commission')) || 0)));
  const sql = await crm();
  await sql`UPDATE valux_settings SET commission_percent = ${percent} WHERE id = 'valux'`;
  // El formulario de suscripción no trae los datos bancarios: solo se tocan si vienen.
  if (formData.has('bank')) {
    await sql`UPDATE valux_settings SET bank_details = ${field(formData, 'bank') || null} WHERE id = 'valux'`;
  }
  refresh();
}

export async function createPerson(formData: FormData) {
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('contenido');
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
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  const status = field(formData, 'status');
  if (!id || !['activa', 'cancelada', 'vencida'].includes(status)) return;
  const sql = await crm();
  if (status === 'cancelada') {
    // Cancelar en el panel corta el acceso y el cobro en la pasarela.
    const rows = await sql`SELECT gateway_id FROM valux_subscriptions WHERE id = ${id}`;
    const gatewayId = (rows[0] as { gateway_id?: string } | undefined)?.gateway_id || '';
    await stopRenewal(gatewayId, true).catch((error) => console.error('[academia] cancelar suscripción:', error));
  }
  const changed = await sql`UPDATE valux_subscriptions SET status = ${status} WHERE id = ${id} RETURNING person_id`;
  if (status !== 'activa' && changed.length) {
    await subscriptionCanceled(id, String((changed[0] as { person_id?: string }).person_id || ''), 'panel');
  }
  refresh();
}

export async function buildPayouts(formData: FormData) {
  await requireDashboard('finanzas');
  const period = field(formData, 'period') || periodYm();
  if (!/^\d{4}-\d{2}$/.test(period)) return;
  await computePayouts(period);
  refresh();
}

export async function saveContract(formData: FormData) {
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  const raw = field(formData, 'kind');
  const kind = raw === 'porcentaje' || raw === 'honorario' ? raw : 'general';
  if (!id) return;
  const percentRaw = Number(field(formData, 'percent'));
  const percent = kind === 'porcentaje' && Number.isFinite(percentRaw) ? Math.max(0, Math.min(100, Math.round(percentRaw))) : null;
  const fee = kind === 'honorario' ? cents(field(formData, 'fee')) : 0;
  const refund = field(formData, 'refund') === 'academia' ? 'academia' : 'descontar';
  const sql = await crm();
  await sql`
    UPDATE valux_people
    SET contract_kind = ${kind}, contract_percent = ${percent}, contract_fee_cents = ${fee},
      contract_refund = ${refund}, contract_terms = ${field(formData, 'terms')}
    WHERE id = ${id}
  `;
  refresh();
}

export async function markPayout(formData: FormData) {
  await requireDashboard('finanzas');
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

// Contexto de una clase para quien la quiere completar: permiso, desbloqueo y misión.
async function lessonContext(lessonId: string, personId: string) {
  const sql = await crm();
  const rows = await sql`
    SELECT l.slug AS lesson_slug, l.points, l.mission, c.slug AS course_slug
    FROM lms_lessons l JOIN lms_courses c ON c.id = l.course_id
    WHERE l.id = ${lessonId}
  `;
  const row = rows[0] as { lesson_slug: string; points: unknown; mission: string | null; course_slug: string } | undefined;
  if (!row) return null;
  const course = await publishedCourse(row.course_slug);
  if (!course) return null;
  const url = `/academia/${course.slug}/${row.lesson_slug}`;
  const open = await canReadCourse(personId, course);
  const access = await lessonAccess(personId, course);
  const index = access.order.findIndex((lesson) => lesson.id === lessonId);
  const next = access.order[index + 1];
  return {
    url,
    nextUrl: next ? `/academia/${course.slug}/${next.slug}` : `/academia/${course.slug}`,
    allowed: open && access.unlocked.has(lessonId),
    done: access.done.has(lessonId),
    points: Math.max(0, Number(row.points) || 0),
    mission: parseMission(row.mission || '').mission,
  };
}

async function markComplete(personId: string, lessonId: string) {
  const sql = await crm();
  await sql`
    INSERT INTO lms_progress (id, person_id, lesson_id, completed_at)
    VALUES (${crypto.randomUUID()}, ${personId}, ${lessonId}, now())
    ON CONFLICT (person_id, lesson_id) WHERE person_id IS NOT NULL DO UPDATE SET
      completed_at = COALESCE(lms_progress.completed_at, EXCLUDED.completed_at)
  `;
  await trackEvent('lesson_completed', { id: `lesson_completed:${personId}:${lessonId}`, personId, data: { lesson: lessonId } });
}

export async function completeLesson(formData: FormData) {
  const personId = await academiaPersonId();
  const lessonId = field(formData, 'lesson_id');
  if (!personId || !lessonId) redirect('/academia/entrar');
  const lesson = await lessonContext(lessonId, personId);
  if (!lesson) redirect('/academia');
  if (!lesson.allowed) redirect(lesson.url);
  // Con misión, solo aprobarla completa la clase.
  if (lesson.mission && !lesson.done) redirect(`${lesson.url}?mision=pendiente`);
  await markComplete(personId, lessonId);
  refresh();
  redirect(lesson.nextUrl);
}

export async function submitMission(formData: FormData) {
  const personId = await academiaPersonId();
  const lessonId = field(formData, 'lesson_id');
  if (!personId || !lessonId) redirect('/academia/entrar');
  const lesson = await lessonContext(lessonId, personId);
  if (!lesson?.mission) redirect(lesson?.url || '/academia');
  if (!lesson.allowed) redirect(lesson.url);
  const result = gradeMission(lesson.mission, (key) => field(formData, key));
  await trackEvent('mission_submitted', { personId, data: { lesson: lessonId, correct: result.correct, total: result.total } });
  if (!result.passed) redirect(`${lesson.url}?mision=${result.correct}-${result.total}`);
  await markComplete(personId, lessonId);
  // Evento único: la llave (persona, clase) impide sumar XP dos veces.
  const sql = await crm();
  await sql`
    INSERT INTO lms_xp (person_id, lesson_id, xp) VALUES (${personId}, ${lessonId}, ${lesson.points})
    ON CONFLICT (person_id, lesson_id) DO NOTHING
  `;
  await trackEvent('mission_validated', { id: `mission_validated:${personId}:${lessonId}`, personId, data: { lesson: lessonId, xp: lesson.points } });
  refresh();
  redirect(`${lesson.url}?mision=ok`);
}

// El reto se verifica en el servidor y el bono entra una sola vez (llave reto + persona).
export async function claimChallenge(formData: FormData) {
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const challenge = await getChallenge(field(formData, 'id'));
  const open = challenge && challenge.active && (!challenge.ends_at || new Date(challenge.ends_at).getTime() > Date.now());
  if (!challenge || !open) redirect('/academia/retos?error=cerrado');
  const progress = await challengeProgress(personId, challenge);
  if (!progress.met) redirect('/academia/retos?error=falta');
  const sql = await crm();
  const claimed = await sql`
    INSERT INTO lms_challenge_claims (challenge_id, person_id, xp)
    VALUES (${challenge.id}, ${personId}, ${challenge.bonus_xp})
    ON CONFLICT (challenge_id, person_id) DO NOTHING
    RETURNING xp
  `;
  if (claimed.length) {
    await trackEvent('reward_unlocked', { id: `reward_unlocked:${challenge.id}:${personId}`, personId, data: { challenge: challenge.id, xp: challenge.bonus_xp } });
  }
  refresh();
  redirect('/academia/retos?ok=1');
}

export async function recordSale(formData: FormData) {
  await requireDashboard('finanzas');
  const person = await getPersonByEmail(field(formData, 'email'));
  const name = person?.name || field(formData, 'name');
  const email = person?.email || field(formData, 'email');
  const kind = field(formData, 'kind') as GrantKind;
  if (!['curso', 'producto', 'suscripcion'].includes(kind)) return;
  // Una membresía manual siempre lleva plan: sin plan el nivel de acceso no estaría definido.
  const plan = kind === 'suscripcion' ? await getPlan(field(formData, 'plan_id')) : null;
  if (kind === 'suscripcion' && !plan) redirect('/dashboard/cursos/ventas?error=plan');
  const itemId = kind === 'producto' ? field(formData, 'product_id') : kind === 'curso' ? field(formData, 'course_id') : plan?.id;
  await grantAccess({
    kind,
    itemId: itemId || null,
    name,
    email,
    months: Number(field(formData, 'months')) || 1,
  });
  refresh();
  if (kind === 'suscripcion') redirect('/dashboard/cursos/suscripcion');
  redirect('/dashboard/cursos/ventas');
}

export async function savePlan(formData: FormData) {
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  const name = field(formData, 'name');
  if (!id || !name) return;
  const sql = await crm();
  await sql`
    UPDATE valux_plans SET
      name = ${name},
      price_cents = ${cents(field(formData, 'price'))},
      benefits = ${field(formData, 'benefits')},
      active = ${field(formData, 'active') === '1'}
    WHERE id = ${id}
  `;
  refresh();
}

// Reembolso hecho fuera de Stripe (transferencia) o decidido a mano: quita el acceso de esa venta.
export async function refundSale(formData: FormData) {
  await requireDashboard('finanzas');
  const id = field(formData, 'id');
  if (!id) return;
  const sql = await crm();
  const rows = await sql`SELECT paypal_order_id FROM valux_sales WHERE id = ${id}`;
  const ref = (rows[0] as { paypal_order_id?: string | null } | undefined)?.paypal_order_id || '';
  await revokeSales([id, ref], 'manual');
  refresh();
  redirect('/dashboard/cursos/ventas');
}
