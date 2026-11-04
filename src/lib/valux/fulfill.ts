import { headers } from 'next/headers';
import { crm } from '@/lib/crm/db';
import { sendAcademiaMail } from './mail';
import { periodYm, splitCents } from './money';

export type GrantKind = 'curso' | 'producto' | 'suscripcion' | 'donacion';

async function settings() {
  const sql = await crm();
  await sql`
    INSERT INTO valux_settings (id, commission_percent, subscription_cents)
    VALUES ('valux', 30, 2000)
    ON CONFLICT (id) DO NOTHING
  `;
  const rows = await sql`SELECT commission_percent, subscription_cents FROM valux_settings WHERE id = 'valux'`;
  const row = rows[0] as { commission_percent?: unknown; subscription_cents?: unknown } | undefined;
  return {
    commission: Number(row?.commission_percent ?? 30) || 30,
    subscriptionCents: Number(row?.subscription_cents ?? 2000) || 2000,
  };
}

export async function alreadyPaid(orderId: string) {
  const sql = await crm();
  const sales = await sql`SELECT id FROM valux_sales WHERE paypal_order_id = ${orderId}`;
  if (sales.length) return true;
  const gifts = await sql`SELECT id FROM valux_donations WHERE paypal_order_id = ${orderId}`;
  return gifts.length > 0;
}

export async function ensurePerson(email: string, name: string, role = 'usuario') {
  const sql = await crm();
  const normalized = email.trim().toLowerCase();
  const existing = await sql`SELECT id, role FROM valux_people WHERE email = ${normalized}`;
  const current = existing[0] as { id?: string; role?: string } | undefined;
  if (!current?.id) {
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO valux_people (id, name, email, role)
      VALUES (${id}, ${name.trim()}, ${normalized}, ${role})
    `;
    return id;
  }
  if (role === 'asociado' && current.role !== 'junta') {
    await sql`UPDATE valux_people SET role = 'asociado', name = ${name.trim()} WHERE id = ${current.id}`;
  } else if (role === 'suscriptor' && current.role === 'usuario') {
    await sql`UPDATE valux_people SET role = 'suscriptor' WHERE id = ${current.id}`;
  }
  return current.id;
}

export async function grantAccess(input: {
  kind: GrantKind;
  itemId?: string | null;
  name: string;
  email: string;
  months?: number;
  monthlyCents?: number;
  paypalOrderId?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email.includes('@') || !name) throw new Error('Faltan nombre y correo');
  const sql = await crm();
  if (input.paypalOrderId) {
    if (input.kind === 'donacion') {
      const paid = await sql`SELECT id FROM valux_donations WHERE paypal_order_id = ${input.paypalOrderId}`;
      if (paid.length) return { personId: '', path: '/academia/apoyar?ok=1' };
    } else {
      const paid = await sql`SELECT buyer_id FROM valux_sales WHERE paypal_order_id = ${input.paypalOrderId}`;
      const buyer = paid[0] as { buyer_id?: string } | undefined;
      if (buyer?.buyer_id) return { personId: buyer.buyer_id, path: await destination(input.kind, input.itemId) };
    }
  }

  const config = await settings();
  const months = Math.max(1, Math.min(24, Math.round(input.months || 1)));

  if (input.kind === 'donacion') {
    const monthly = Math.max(0, Math.round(input.monthlyCents || 0));
    const total = monthly * months;
    if (total <= 0) throw new Error('La donación no tiene monto');
    await sql`
      INSERT INTO valux_donations (id, monthly_cents, months, total_cents, status, paypal_order_id, payer_email, payer_name, paid_at)
      VALUES (
        ${crypto.randomUUID()}, ${monthly}, ${months}, ${total}, 'pagada',
        ${input.paypalOrderId || null}, ${email}, ${name}, now()
      )
    `;
    await notifyAccess(email, name, '/academia/apoyar?ok=1');
    return { personId: '', path: '/academia/apoyar?ok=1' };
  }

  let amount = 0;
  let sellerId: string | null = null;
  let courseId: string | null = null;
  let productId: string | null = null;
  if (input.kind === 'curso') {
    const rows = await sql`SELECT id, price_cents, teacher_id FROM lms_courses WHERE id = ${input.itemId || ''}`;
    const course = rows[0] as { id?: string; price_cents?: unknown; teacher_id?: string | null } | undefined;
    if (!course?.id) throw new Error('El curso no existe');
    amount = Number(course.price_cents) || 0;
    sellerId = course.teacher_id || null;
    courseId = course.id;
  } else if (input.kind === 'producto') {
    const rows = await sql`SELECT id, price_cents, creator_id FROM valux_products WHERE id = ${input.itemId || ''}`;
    const product = rows[0] as { id?: string; price_cents?: unknown; creator_id?: string | null } | undefined;
    if (!product?.id) throw new Error('El producto no existe');
    amount = Number(product.price_cents) || 0;
    sellerId = product.creator_id || null;
    productId = product.id;
  } else {
    amount = config.subscriptionCents * months;
  }

  const personId = await ensurePerson(email, name, input.kind === 'suscripcion' ? 'suscriptor' : 'usuario');
  const split = sellerId ? splitCents(amount, config.commission) : { amount, fee: amount, seller: 0 };
  let fresh = false;
  if (split.amount > 0) {
    await sql`
      INSERT INTO valux_sales (
        id, kind, buyer_id, seller_id, course_id, product_id, amount_cents, fee_cents, seller_cents, paypal_order_id, period_ym
      ) VALUES (
        ${crypto.randomUUID()}, ${input.kind}, ${personId}, ${sellerId}, ${courseId}, ${productId},
        ${split.amount}, ${split.fee}, ${split.seller}, ${input.paypalOrderId || null}, ${periodYm()}
      )
    `;
    fresh = true;
  }

  if (courseId) {
    const enrolled = await sql`
      SELECT id FROM lms_enrollments WHERE course_id = ${courseId} AND person_id = ${personId}
    `;
    if (!enrolled.length) {
      await sql`
        INSERT INTO lms_enrollments (id, course_id, person_id)
        VALUES (${crypto.randomUUID()}, ${courseId}, ${personId})
      `;
      fresh = true;
    }
  }

  if (input.kind === 'suscripcion') {
    await sql`
      INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, paypal_order_id)
      VALUES (${crypto.randomUUID()}, ${personId}, 'activa', now() + ${`${months} months`}::interval, ${input.paypalOrderId || null})
    `;
    fresh = true;
  }

  const path = await destination(input.kind, input.itemId);
  if (fresh) await notifyAccess(email, name, path);
  return { personId, path };
}

async function notifyAccess(email: string, name: string, path: string) {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const proto = h.get('x-forwarded-proto') || 'https';
  const link = host ? `${proto}://${host}${path.split('?')[0]}` : path;
  await sendAcademiaMail(
    email,
    'Tu acceso en la academia',
    `Hola ${name},\n\nYa quedó tu acceso. Entrá aquí:\n${link}\n\nSi te pide correo, usá este mismo.\n`,
  );
}

async function destination(kind: GrantKind, itemId?: string | null) {
  if (kind === 'curso' && itemId) {
    const sql = await crm();
    const rows = await sql`SELECT slug FROM lms_courses WHERE id = ${itemId}`;
    const slug = (rows[0] as { slug?: string } | undefined)?.slug;
    return slug ? `/academia/${slug}?ok=1` : '/academia?ok=1';
  }
  if (kind === 'producto' && itemId) return `/academia/marketplace/${itemId}?ok=1`;
  if (kind === 'suscripcion') return '/academia/suscripcion?ok=1';
  return '/academia/apoyar?ok=1';
}
