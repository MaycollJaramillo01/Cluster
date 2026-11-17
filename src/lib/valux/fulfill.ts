import { headers } from 'next/headers';
import { crm } from '@/lib/crm/db';
import { getIntent } from './data';
import { paypalOrderPaid, paypalSubscriptionPayments, readPaypalSubscription } from './paypal';
import { readStripeCheckout, readStripeSubscription } from './stripe';
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
  // Precio ya cobrado (oferta de bump o upsell, plan por transferencia). Sin él, el precio de la base.
  amountCents?: number;
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
    const gift = await sql`
      INSERT INTO valux_donations (id, monthly_cents, months, total_cents, status, paypal_order_id, payer_email, payer_name, paid_at)
      VALUES (
        ${crypto.randomUUID()}, ${monthly}, ${months}, ${total}, 'pagada',
        ${input.paypalOrderId || null}, ${email}, ${name}, now()
      )
      ON CONFLICT (paypal_order_id) DO NOTHING
      RETURNING id
    `;
    if (!gift.length) return { personId: '', path: '/academia/apoyar?ok=1' };
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
    const plan = await planPrice(input.itemId);
    amount = (plan ?? config.subscriptionCents) * months;
  }
  if (input.amountCents !== undefined) amount = Math.max(0, Math.round(input.amountCents));

  const personId = await ensurePerson(email, name);
  const split = sellerId ? splitCents(amount, config.commission) : { amount, fee: amount, seller: 0 };
  let fresh = false;
  if (split.amount > 0) {
    const sale = await sql`
      INSERT INTO valux_sales (
        id, kind, buyer_id, seller_id, course_id, product_id, amount_cents, fee_cents, seller_cents, paypal_order_id, period_ym
      ) VALUES (
        ${crypto.randomUUID()}, ${input.kind}, ${personId}, ${sellerId}, ${courseId}, ${productId},
        ${split.amount}, ${split.fee}, ${split.seller}, ${input.paypalOrderId || null}, ${periodYm()}
      )
      ON CONFLICT (paypal_order_id) DO NOTHING
      RETURNING id
    `;
    // Otro pedido con la misma orden ya entregó el acceso.
    if (!sale.length) return { personId, path: await destination(input.kind, input.itemId) };
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
      INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, paypal_order_id, plan_id)
      VALUES (
        ${crypto.randomUUID()}, ${personId}, 'activa', now() + ${`${months} months`}::interval,
        ${input.paypalOrderId || null}, ${input.itemId || null}
      )
    `;
    fresh = true;
  }

  const path = await destination(input.kind, input.itemId);
  if (fresh) await notifyAccess(email, name, path);
  return { personId, path };
}

async function planPrice(planId?: string | null) {
  if (!planId) return null;
  const sql = await crm();
  const rows = await sql`SELECT price_cents FROM valux_plans WHERE id = ${planId}`;
  const row = rows[0] as { price_cents?: unknown } | undefined;
  return row ? Number(row.price_cents) || 0 : null;
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

type Intent = NonNullable<Awaited<ReturnType<typeof getIntent>>>;

async function grantFromIntent(intent: Intent, orderId: string) {
  const donation = intent.kind === 'donacion';
  const result = await grantAccess({
    kind: intent.kind,
    itemId: intent.itemId || null,
    name: intent.name,
    email: intent.email,
    months: intent.months,
    monthlyCents: donation ? Math.round(intent.amountCents / Math.max(1, intent.months)) : undefined,
    amountCents: donation ? undefined : intent.amountCents - intent.bumpCents,
    paypalOrderId: orderId,
  });
  await grantBump({ ...intent, orderId });
  return result;
}

// El bump va en el mismo pago pero es otra venta: su id es el del pago con ":bump".
export async function grantBump(input: { bumpItemId: string; bumpCents: number; name: string; email: string; orderId: string }) {
  if (!input.bumpItemId || input.bumpCents <= 0) return;
  await grantAccess({
    kind: 'curso',
    itemId: input.bumpItemId,
    name: input.name,
    email: input.email,
    amountCents: input.bumpCents,
    paypalOrderId: `${input.orderId}:bump`,
  });
}

export type Fulfilled = { personId: string; path: string } | null;

// Retorno del navegador y webhook llaman lo mismo; todo es idempotente por id de pasarela.
export async function fulfillStripeSession(sessionId: string): Promise<Fulfilled> {
  const intent = await getIntent(sessionId);
  if (!intent) return null;
  const session = await readStripeCheckout(sessionId);
  if (!session.paid || session.amountCents + 1 < intent.amountCents) return null;
  if (!session.subscriptionId) return grantFromIntent(intent, sessionId);

  const subscription = await readStripeSubscription(session.subscriptionId).catch(() => null);
  const personId = await activateSubscription({
    gatewayId: session.subscriptionId,
    email: intent.email,
    name: intent.name,
    planId: intent.itemId,
    periodEnd: subscription?.periodEnd ?? null,
  });
  if (session.invoiceId) {
    await recordSubscriptionPayment({
      gatewayId: session.subscriptionId,
      paymentId: session.invoiceId,
      amountCents: session.amountCents,
    });
  }
  return { personId, path: '/academia/suscripcion?ok=1' };
}

export async function fulfillPaypalOrder(orderId: string): Promise<Fulfilled> {
  const intent = await getIntent(orderId);
  if (!intent) return null;
  if (!(await alreadyPaid(orderId))) {
    const order = await paypalOrderPaid(orderId);
    if (!order.paid || order.amountCents + 1 < intent.amountCents) return null;
  }
  return grantFromIntent(intent, orderId);
}

export async function fulfillPaypalSubscription(subscriptionId: string): Promise<Fulfilled> {
  const intent = await getIntent(subscriptionId);
  if (!intent) return null;
  const subscription = await readPaypalSubscription(subscriptionId);
  if (!['ACTIVE', 'APPROVED'].includes(subscription.status)) return null;
  const personId = await activateSubscription({
    gatewayId: subscriptionId,
    email: intent.email,
    name: intent.name,
    planId: intent.itemId,
    periodEnd: subscription.periodEnd,
  });
  const payments = await paypalSubscriptionPayments(subscriptionId).catch(() => []);
  for (const payment of payments) {
    await recordSubscriptionPayment({ gatewayId: subscriptionId, paymentId: payment.id, amountCents: payment.amountCents });
  }
  return { personId, path: '/academia/suscripcion?ok=1' };
}

function monthFromNow() {
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  return end;
}

// Alta o renovación de una suscripción de pasarela. El vencimiento solo avanza.
export async function activateSubscription(input: {
  gatewayId: string;
  email: string;
  name: string;
  planId?: string;
  periodEnd: Date | null;
}) {
  const sql = await crm();
  const personId = await ensurePerson(input.email, input.name);
  const end = input.periodEnd && input.periodEnd.getTime() > Date.now() ? input.periodEnd : monthFromNow();
  const rows = await sql`
    INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, paypal_order_id, gateway_id, plan_id)
    VALUES (${crypto.randomUUID()}, ${personId}, 'activa', ${end.toISOString()}, ${input.gatewayId}, ${input.gatewayId}, ${input.planId || null})
    ON CONFLICT (gateway_id) DO UPDATE SET
      current_period_end = GREATEST(valux_subscriptions.current_period_end, EXCLUDED.current_period_end),
      status = CASE WHEN valux_subscriptions.status = 'vencida' THEN 'activa' ELSE valux_subscriptions.status END
    RETURNING (xmax = 0) AS inserted
  `;
  if ((rows[0] as { inserted?: boolean } | undefined)?.inserted) {
    await notifyAccess(input.email.trim().toLowerCase(), input.name.trim(), '/academia/suscripcion?ok=1');
  }
  return personId;
}

// Cada cobro mensual: una venta (sin vendedor, todo es comisión) y, si llega, el nuevo vencimiento.
export async function recordSubscriptionPayment(input: {
  gatewayId: string;
  paymentId: string;
  amountCents: number;
  periodEnd?: Date | null;
}) {
  const sql = await crm();
  const rows = await sql`SELECT person_id FROM valux_subscriptions WHERE gateway_id = ${input.gatewayId}`;
  const personId = (rows[0] as { person_id?: string } | undefined)?.person_id;
  if (!personId) return false;
  if (input.periodEnd) {
    await sql`
      UPDATE valux_subscriptions SET
        current_period_end = GREATEST(current_period_end, ${input.periodEnd.toISOString()}::timestamptz),
        status = CASE WHEN status = 'vencida' THEN 'activa' ELSE status END
      WHERE gateway_id = ${input.gatewayId}
    `;
  }
  if (input.amountCents > 0) {
    await sql`
      INSERT INTO valux_sales (id, kind, buyer_id, amount_cents, fee_cents, seller_cents, paypal_order_id, period_ym)
      VALUES (
        ${crypto.randomUUID()}, 'suscripcion', ${personId}, ${input.amountCents}, ${input.amountCents}, 0,
        ${input.paymentId}, ${periodYm()}
      )
      ON CONFLICT (paypal_order_id) DO NOTHING
    `;
  }
  return true;
}

// no_renueva: ya pagó el mes en curso y lo conserva. vencida: la pasarela cerró la suscripción.
export async function setSubscriptionEnded(gatewayId: string, status: 'no_renueva' | 'vencida') {
  const sql = await crm();
  await sql`UPDATE valux_subscriptions SET status = ${status} WHERE gateway_id = ${gatewayId} AND status <> 'cancelada'`;
}

// Reembolso o disputa: la venta deja de contar (ni acceso ni comisión) y la suscripción se corta ya.
// refs: id de la venta o id de pago tal como se guardó (sesión de Stripe, factura, tr_<ref>).
export async function revokeSales(refs: string[], reason: string) {
  const sql = await crm();
  let revoked = 0;
  for (const ref of refs.filter(Boolean)) {
    const sales = await sql`
      UPDATE valux_sales SET refunded_at = now(), refund_reason = ${reason}
      WHERE (id = ${ref} OR paypal_order_id IN (${ref}, ${`${ref}:bump`})) AND refunded_at IS NULL
      RETURNING buyer_id, course_id
    `;
    for (const sale of sales as { buyer_id: string | null; course_id: string | null }[]) {
      revoked += 1;
      if (!sale.course_id || !sale.buyer_id) continue;
      // Si pagó el mismo curso en otra venta vigente, lo conserva.
      await sql`
        DELETE FROM lms_enrollments e
        WHERE e.course_id = ${sale.course_id} AND e.person_id = ${sale.buyer_id}
          AND NOT EXISTS (
            SELECT 1 FROM valux_sales s
            WHERE s.buyer_id = e.person_id AND s.course_id = e.course_id AND s.refunded_at IS NULL
          )
      `;
    }
    await sql`
      UPDATE valux_subscriptions SET status = 'cancelada', current_period_end = LEAST(current_period_end, now())
      WHERE paypal_order_id = ${ref} OR gateway_id = ${ref}
    `;
  }
  return revoked;
}
