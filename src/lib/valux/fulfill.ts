import { crm } from '@/lib/crm/db';
import { getIntent } from './data';
import { paypalOrderPaid, paypalSubscriptionPayments, readPaypalSubscription } from './paypal';
import { readStripeCheckout, readStripeSubscription } from './stripe';
import { sendQueuedAcademiaMail } from './mail-queue';
import { site } from '@/lib/site';
import { academyMoney, CURRENCY, usdToHnlCents, payoutDueAt, periodYm, previousYm, splitCents } from './money';
import { advanceStage, trackEvent } from './events';
import { cleanCode } from './coupons';
import type { NeonQueryFunctionInTransaction } from '@neondatabase/serverless';

export type GrantKind = 'curso' | 'producto' | 'suscripcion' | 'donacion';

function deliveryLocks(sql: NeonQueryFunctionInTransaction<false, false>, keys: string[]) {
  return sql`
    SELECT pg_advisory_xact_lock(hashtextextended('academia:' || item.key, 0))
    FROM (SELECT DISTINCT key FROM unnest(${keys}::text[]) AS keys(key) ORDER BY key DESC) AS item
  `;
}

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
      ON CONFLICT (email) DO NOTHING
    `;
    const [person] = await sql`SELECT id FROM valux_people WHERE email = ${normalized}`;
    if (!person) throw new Error('No se pudo recuperar la cuenta de Academia');
    return String(person.id);
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
  // Precio ya cobrado (oferta de bump o upsell, plan por transferencia, cupón). Sin él, el precio de la base.
  amountCents?: number;
  couponCode?: string | null;
  paidAt?: Date;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email.includes('@') || !name) throw new Error('Faltan nombre y correo');
  const sql = await crm();
  const orderId = input.paypalOrderId || '';
  const orderRefs = orderId.endsWith(':bump') ? [orderId, orderId.slice(0, -5)] : orderId ? [orderId] : [];
  const config = await settings();
  const months = Math.max(1, Math.min(24, Math.round(input.months || 1)));

  if (input.kind === 'donacion') {
    const monthly = Math.max(0, Math.round(input.monthlyCents || 0));
    const total = monthly * months;
    if (total <= 0) throw new Error('La donación no tiene monto');
    const mailId = crypto.randomUUID();
    const [, [gift]] = await sql.transaction((tx) => [deliveryLocks(tx, orderRefs.map((id) => `pago:${id}`)), tx`
      WITH revoked AS (SELECT FROM valux_revoked_orders WHERE order_id = ANY(${orderRefs}::text[])), donation AS (
        INSERT INTO valux_donations (id, monthly_cents, months, total_cents, status, paypal_order_id, payer_email, payer_name, paid_at)
        SELECT ${crypto.randomUUID()}, ${monthly}, ${months}, ${total}, 'pagada',
          ${orderId || null}, ${email}, ${name}, COALESCE(${input.paidAt?.toISOString() ?? null}::timestamptz, now())
        WHERE NOT EXISTS (SELECT FROM revoked)
        ON CONFLICT (paypal_order_id) DO NOTHING
        RETURNING id
      ), mail AS (
        INSERT INTO academia_mail_queue (id, email, subject, body)
        SELECT ${mailId}, ${email}, 'Gracias por apoyar a la Academia', ${`Hola ${name},\n\nRecibimos tu aporte. Gracias por apoyar a la Academia.\n`}
        FROM donation RETURNING id
      )
      SELECT EXISTS (SELECT FROM mail) AS notified, EXISTS (SELECT FROM revoked) AS revoked
    `]);
    if (gift.notified) await sendQueuedAcademiaMail(mailId).catch((error) => console.error('[academia] aviso pendiente:', error));
    return { personId: '', path: gift.revoked ? '/academia/apoyar?error=reembolso' : '/academia/apoyar?ok=1' };
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
  const split = sellerId ? splitCents(amount, await sellerCommission(sellerId, config.commission)) : { amount, fee: amount, seller: 0 };
  const path = await destination(input.kind, input.itemId);
  const saleId = crypto.randomUUID();
  const mailId = crypto.randomUUID();
  const recordSale = split.amount > 0 || Boolean(input.paypalOrderId);
  const paidAt = input.paidAt ?? new Date();
  // La venta, la entrega y el aviso se confirman en una sola sentencia. Una venta anterior
  // sin marca puede completar su entrega una vez; las ventas devueltas quedan excluidas.
  const lockKeys = [
    ...orderRefs.map((id) => `pago:${id}`),
    ...(courseId ? [`curso:${courseId}:${personId}`] : []),
  ];
  const [, [result]] = await sql.transaction((tx) => [deliveryLocks(tx, lockKeys), tx`
    WITH existing AS (
      SELECT * FROM valux_sales WHERE paypal_order_id = ${orderId || null}
    ), revoked AS (
      SELECT FROM valux_revoked_orders WHERE order_id = ANY(${orderRefs}::text[])
      UNION ALL SELECT FROM valux_sales WHERE paypal_order_id = ANY(${orderRefs}::text[]) AND refunded_at IS NOT NULL
    ), sale AS (
      INSERT INTO valux_sales (
        id, kind, buyer_id, seller_id, course_id, product_id, amount_cents, fee_cents, seller_cents,
        paypal_order_id, period_ym, coupon_code, created_at, entitlement_applied_at
      )
      SELECT ${saleId}, ${input.kind}, ${personId}, ${sellerId}, ${courseId}, ${productId},
        ${split.amount}, ${split.fee}, ${split.seller}, ${orderId || null}, ${periodYm(paidAt)}, ${input.couponCode || null}, ${paidAt.toISOString()}, now()
      WHERE ${recordSale}::boolean AND NOT EXISTS (SELECT FROM revoked)
      ON CONFLICT (paypal_order_id) DO UPDATE SET entitlement_applied_at = now()
      WHERE valux_sales.entitlement_applied_at IS NULL AND valux_sales.refunded_at IS NULL
        AND valux_sales.kind = EXCLUDED.kind AND valux_sales.buyer_id = EXCLUDED.buyer_id
        AND valux_sales.course_id IS NOT DISTINCT FROM EXCLUDED.course_id
        AND valux_sales.product_id IS NOT DISTINCT FROM EXCLUDED.product_id
      RETURNING id
    ), enrollment AS (
      INSERT INTO lms_enrollments (id, course_id, person_id)
      SELECT ${crypto.randomUUID()}, ${courseId}, ${personId}
      WHERE ${courseId}::text IS NOT NULL AND (NOT ${recordSale}::boolean OR EXISTS (SELECT FROM sale))
      ON CONFLICT (course_id, person_id) WHERE person_id IS NOT NULL DO NOTHING
      RETURNING id
    ), expiry AS (
      SELECT ${paidAt.toISOString()}::timestamptz + ${`${months} months`}::interval AS period_end
    ), membership AS (
      INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, paypal_order_id, plan_id)
      SELECT ${crypto.randomUUID()}, ${personId}, CASE WHEN period_end > now() THEN 'activa' ELSE 'vencida' END, period_end,
        ${orderId || null}, ${input.itemId || null} FROM expiry
      WHERE ${input.kind}::text = 'suscripcion' AND (NOT ${recordSale}::boolean OR EXISTS (SELECT FROM sale))
        AND NOT EXISTS (SELECT FROM valux_subscriptions WHERE paypal_order_id = ${input.paypalOrderId || null})
      RETURNING status
    ), counted_coupon AS (
      UPDATE valux_coupons SET uses = uses + 1 WHERE code = ${cleanCode(input.couponCode || '')}
        AND (EXISTS (SELECT FROM sale WHERE id = ${saleId})
          OR (NOT ${recordSale}::boolean AND EXISTS (SELECT FROM enrollment)))
    ), mail AS (
      INSERT INTO academia_mail_queue (id, email, subject, body)
      SELECT ${mailId}, ${email}, 'Tu acceso en la academia',
        ${`Hola ${name},\n\nYa quedó tu acceso. Entrá aquí:\n${site.url}${path.split('?')[0]}\n\nSi te pide correo, usá este mismo.\n`}
      WHERE (EXISTS (SELECT FROM sale WHERE id = ${saleId}) AND ${input.kind}::text <> 'suscripcion')
        OR EXISTS (SELECT FROM enrollment) OR EXISTS (SELECT FROM membership WHERE status = 'activa')
      RETURNING id
    )
    SELECT EXISTS (SELECT FROM sale WHERE id = ${saleId}) AS new_sale,
      EXISTS (SELECT FROM mail) AS notified,
      EXISTS (SELECT FROM revoked) AS revoked,
      EXISTS (SELECT FROM sale) OR EXISTS (SELECT FROM existing WHERE kind = ${input.kind} AND buyer_id = ${personId}
        AND course_id IS NOT DISTINCT FROM ${courseId}::text AND product_id IS NOT DISTINCT FROM ${productId}::text) AS matched_sale
  `]);
  if (result.revoked) return { personId: '', path: path.replace('?ok=1', '?error=reembolso') };
  if (recordSale && !result.matched_sale) throw new Error('La orden ya está vinculada a otra compra');
  if (result.new_sale && split.amount > 0) {
    await trackEvent('payment_succeeded', {
      id: input.paypalOrderId ? `payment_succeeded:${input.paypalOrderId}` : undefined,
      personId,
      email,
      data: { kind: input.kind, item: input.itemId || null, cents: split.amount },
    });
  }
  if (result.notified) {
    await sendQueuedAcademiaMail(mailId).catch((error) => console.error('[academia] aviso pendiente:', error));
    await trackEvent('purchase_completed', {
      id: input.paypalOrderId ? `purchase_completed:${input.paypalOrderId}` : undefined,
      personId,
      email,
      data: { kind: input.kind, item: input.itemId || null, cents: split.amount },
    });
    await advanceStage({ personId }, input.kind === 'suscripcion' ? 'miembro' : 'comprador');
  }
  return { personId, path };
}

async function planPrice(planId?: string | null) {
  if (!planId) return null;
  const sql = await crm();
  const rows = await sql`SELECT price_cents FROM valux_plans WHERE id = ${planId}`;
  const row = rows[0] as { price_cents?: unknown } | undefined;
  return row ? Number(row.price_cents) || 0 : null;
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
    couponCode: intent.couponCode || null,
  });
  if (!result.path.includes('error=reembolso')) await grantBump({ ...intent, orderId });
  return result;
}

// El bump va en el mismo pago pero es otra venta: su id es el del pago con ":bump".
export async function grantBump(input: { bumpItemId: string; bumpCents: number; name: string; email: string; orderId: string; paidAt?: Date }) {
  if (!input.bumpItemId || input.bumpCents <= 0) return;
  await grantAccess({
    kind: 'curso',
    itemId: input.bumpItemId,
    name: input.name,
    email: input.email,
    amountCents: input.bumpCents,
    paypalOrderId: `${input.orderId}:bump`,
    paidAt: input.paidAt,
  });
}

export type Fulfilled = { personId: string; path: string } | null;

// Retorno del navegador y webhook llaman lo mismo; todo es idempotente por id de pasarela.
export async function fulfillStripeSession(sessionId: string, webhookEvent?: 'checkout.session.completed' | 'checkout.session.async_payment_succeeded'): Promise<Fulfilled> {
  const intent = await getIntent(sessionId);
  if (!intent) return null;
  const session = await readStripeCheckout(sessionId);
  if (!session.paid) {
    if (webhookEvent === 'checkout.session.async_payment_succeeded') throw new Error('Stripe aún no confirma el pago asíncrono');
    return null;
  }
  if (session.currency !== CURRENCY || session.amountCents + 1 < intent.amountCents) {
    if (webhookEvent) throw new Error('La moneda o el monto de Stripe no coinciden con el pedido');
    return null;
  }
  const sql = await crm();
  await sql`
    UPDATE valux_intents SET payment_validated_at = COALESCE(payment_validated_at, now())
    WHERE paypal_order_id = ${sessionId}
  `;
  let result: NonNullable<Fulfilled>;
  if (!session.subscriptionId) {
    if (intent.kind === 'suscripcion') throw new Error('La sesión pagada aún no tiene suscripción');
    result = await grantFromIntent(intent, sessionId);
  } else {
    const subscription = await readStripeSubscription(session.subscriptionId);
    if (!subscription.periodEnd) throw new Error('Stripe aún no indicó el fin del periodo de la suscripción');
    const personId = await activateSubscription({
      gatewayId: session.subscriptionId,
      email: intent.email,
      name: intent.name,
      planId: intent.itemId,
      periodEnd: subscription.periodEnd,
      active: ['active', 'trialing'].includes(subscription.status) && subscription.periodEnd.getTime() > Date.now(),
      orderRefs: [sessionId, session.invoiceId],
    });
    if (personId && session.invoiceId) {
      await recordSubscriptionPayment({
        gatewayId: session.subscriptionId,
        paymentId: session.invoiceId,
        amountCents: session.amountCents,
      });
    }
    result = { personId, path: personId ? '/academia/suscripcion' : '/academia/suscripcion?error=reembolso' };
  }
  await sql`UPDATE valux_intents SET fulfilled_at = COALESCE(fulfilled_at, now()) WHERE paypal_order_id = ${sessionId}`;
  return result;
}

export async function fulfillPaypalOrder(orderId: string): Promise<Fulfilled> {
  const intent = await getIntent(orderId);
  if (!intent) return null;
  if (!(await alreadyPaid(orderId))) {
    const order = await paypalOrderPaid(orderId);
    if (!order.paid || usdToHnlCents(order.amountCents) + 1 < intent.amountCents) return null;
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
  if (!personId) return { personId, path: '/academia/suscripcion?error=reembolso' };
  const payments = await paypalSubscriptionPayments(subscriptionId).catch(() => []);
  for (const payment of payments) {
    await recordSubscriptionPayment({ gatewayId: subscriptionId, paymentId: payment.id, amountCents: usdToHnlCents(payment.amountCents) });
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
  active?: boolean;
  orderRefs?: string[];
}) {
  const sql = await crm();
  const personId = await ensurePerson(input.email, input.name);
  const end = input.periodEnd ?? monthFromNow();
  const active = input.active !== false && end.getTime() > Date.now();
  const refs = [input.gatewayId, ...(input.orderRefs ?? []).filter(Boolean)];
  const mailId = crypto.randomUUID();
  const [, [result]] = await sql.transaction((tx) => [deliveryLocks(tx, refs.map((id) => `pago:${id}`)), tx`
    WITH membership AS (
    INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, paypal_order_id, gateway_id, plan_id)
    SELECT ${crypto.randomUUID()}, ${personId}, ${active ? 'activa' : 'vencida'}, ${end.toISOString()}, ${input.gatewayId}, ${input.gatewayId}, ${input.planId || null}
    WHERE NOT EXISTS (SELECT FROM valux_revoked_orders WHERE order_id = ANY(${refs}::text[]))
    ON CONFLICT (gateway_id) DO UPDATE SET
      current_period_end = CASE WHEN EXCLUDED.status = 'activa' THEN GREATEST(valux_subscriptions.current_period_end, EXCLUDED.current_period_end)
        ELSE valux_subscriptions.current_period_end END,
      status = CASE WHEN valux_subscriptions.status = 'vencida' AND EXCLUDED.status = 'activa'
        AND EXCLUDED.current_period_end > valux_subscriptions.current_period_end THEN 'activa' ELSE valux_subscriptions.status END
    RETURNING (xmax = 0) AS inserted, status
    ), mail AS (
      INSERT INTO academia_mail_queue (id, email, subject, body)
      SELECT ${mailId}, ${input.email.trim().toLowerCase()}, 'Tu acceso en la academia',
        ${`Hola ${input.name.trim()},\n\nTu membresía está activa. Entrá aquí:\n${site.url}/academia/suscripcion\n`}
      FROM membership WHERE inserted AND status = 'activa'
      RETURNING id
    )
    SELECT EXISTS (SELECT FROM membership) AS applied, EXISTS (SELECT FROM mail) AS notified
  `]);
  if (!result.applied) return '';
  if (result.notified) {
    await sendQueuedAcademiaMail(mailId).catch((error) => console.error('[academia] aviso pendiente:', error));
    await trackEvent('subscription_started', { id: `subscription_started:${input.gatewayId}`, personId, email: input.email, data: { plan: input.planId || null } });
    await advanceStage({ personId }, 'miembro');
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
  const end = input.periodEnd?.toISOString() ?? null;
  const [, [result]] = await sql.transaction((tx) => [deliveryLocks(tx, [`pago:${input.gatewayId}`, `pago:${input.paymentId}`]), tx`
    WITH revoked AS (
      SELECT FROM valux_revoked_orders WHERE order_id IN (${input.gatewayId}, ${input.paymentId}) LIMIT 1
    ), membership AS (
      SELECT person_id FROM valux_subscriptions WHERE gateway_id = ${input.gatewayId}
    ), sale AS (
      INSERT INTO valux_sales (id, kind, buyer_id, amount_cents, fee_cents, seller_cents, paypal_order_id, period_ym)
      SELECT ${crypto.randomUUID()}, 'suscripcion', person_id, ${input.amountCents}, ${input.amountCents}, 0,
        ${input.paymentId}, ${periodYm()}
      FROM membership WHERE ${input.amountCents}::integer > 0 AND NOT EXISTS (SELECT FROM revoked)
      ON CONFLICT (paypal_order_id) DO NOTHING
      RETURNING id
    ), renewed AS (
      UPDATE valux_subscriptions SET current_period_end = ${end}::timestamptz,
        status = CASE WHEN status = 'vencida' AND ${end}::timestamptz > now() THEN 'activa' ELSE status END
      WHERE gateway_id = ${input.gatewayId} AND status <> 'cancelada'
        AND ${end}::timestamptz > current_period_end AND NOT EXISTS (SELECT FROM revoked)
        AND NOT EXISTS (SELECT FROM valux_sales WHERE paypal_order_id = ${input.paymentId} AND refunded_at IS NOT NULL)
    )
    SELECT (SELECT person_id FROM membership) AS person_id,
      EXISTS (SELECT FROM sale) AS new_sale, EXISTS (SELECT FROM revoked) AS revoked
  `]);
  if (result.revoked) return true;
  if (!result.person_id) return false;
  if (result.new_sale) {
    const personId = String(result.person_id);
    const before = await sql`
      SELECT 1 FROM academia_events WHERE name = 'payment_succeeded' AND data::jsonb ->> 'gateway' = ${input.gatewayId} LIMIT 1
    `;
    await trackEvent('payment_succeeded', { id: `payment_succeeded:${input.paymentId}`, personId, data: { kind: 'suscripcion', gateway: input.gatewayId, cents: input.amountCents } });
    if (before.length) {
      await trackEvent('subscription_renewed', { id: `subscription_renewed:${input.paymentId}`, personId, data: { gateway: input.gatewayId, cents: input.amountCents } });
    }
  }
  return true;
}

// no_renueva: ya pagó el mes en curso y lo conserva. vencida: la pasarela cerró la suscripción.
export async function setSubscriptionEnded(gatewayId: string, status: 'no_renueva' | 'vencida') {
  const sql = await crm();
  const ended = await sql`
    UPDATE valux_subscriptions SET status = ${status} WHERE gateway_id = ${gatewayId} AND status <> 'cancelada' RETURNING id, person_id
  `;
  for (const row of ended as { id: string; person_id: string }[]) await subscriptionCanceled(row.id, row.person_id, status);
}

// Un aviso por membresía: no_renueva y vencida de la misma suscripción cuentan como una cancelación.
export async function subscriptionCanceled(subscriptionId: string, personId: string | null, reason: string) {
  await trackEvent('subscription_canceled', { id: `subscription_canceled:${subscriptionId}`, personId, data: { reason } });
}

// Comisión que se queda la academia según el contrato del vendedor.
// honorario: cobra un fijo mensual en la liquidación, así que la venta entera queda en la academia.
export async function sellerCommission(sellerId: string, fallback: number) {
  const sql = await crm();
  const rows = await sql`SELECT contract_kind, contract_percent FROM valux_people WHERE id = ${sellerId}`;
  const row = rows[0] as { contract_kind?: string; contract_percent?: unknown } | undefined;
  if (row?.contract_kind === 'honorario') return 100;
  if (row?.contract_kind === 'porcentaje' && row.contract_percent != null) return Number(row.contract_percent);
  return fallback;
}

// Liquidación de un mes (AAAA-MM). Las pendientes se recalculan; las transferidas no se tocan.
export async function computePayouts(period: string) {
  const sql = await crm();
  // Por vendedor: ventas vigentes del mes, honorario fijo del contrato y, si el contrato lo dice,
  // el descuento de reembolsos de este mes sobre ventas de meses que ya se le pagaron,
  // más el saldo negativo que dejó el mes anterior.
  const previous = previousYm(period);
  const rows = await sql`
    SELECT p.id AS seller_id, p.contract_kind, p.contract_fee_cents, p.contract_refund,
      COALESCE((SELECT sum(s.seller_cents) FROM valux_sales s
        WHERE s.seller_id = p.id AND s.period_ym = ${period} AND s.refunded_at IS NULL), 0) AS sales,
      COALESCE((SELECT sum(s.seller_cents) FROM valux_sales s
        JOIN valux_payouts y ON y.seller_id = s.seller_id AND y.period_ym = s.period_ym AND y.status = 'transferida'
        WHERE s.seller_id = p.id AND s.period_ym < ${period}
          AND to_char(s.refunded_at AT TIME ZONE 'America/Tegucigalpa', 'YYYY-MM') = ${period}), 0) AS clawback,
      COALESCE((SELECT y.carry_cents FROM valux_payouts y WHERE y.seller_id = p.id AND y.period_ym = ${previous}), 0) AS carry
    FROM valux_people p
    WHERE p.contract_kind = 'honorario'
      OR EXISTS (SELECT 1 FROM valux_sales s WHERE s.seller_id = p.id AND s.period_ym = ${period})
      OR EXISTS (SELECT 1 FROM valux_sales s WHERE s.seller_id = p.id
        AND to_char(s.refunded_at AT TIME ZONE 'America/Tegucigalpa', 'YYYY-MM') = ${period})
      OR EXISTS (SELECT 1 FROM valux_payouts y WHERE y.seller_id = p.id AND y.period_ym = ${previous} AND y.carry_cents < 0)
  `;
  const dueAt = payoutDueAt(period).toISOString();
  for (const row of rows) {
    const entry = row as { seller_id: string; contract_kind: string; contract_fee_cents: unknown; contract_refund: string; sales: unknown; clawback: unknown; carry: unknown };
    const sales = Number(entry.sales) || 0;
    const fee = entry.contract_kind === 'honorario' ? Number(entry.contract_fee_cents) || 0 : 0;
    const clawback = entry.contract_refund === 'academia' ? 0 : Number(entry.clawback) || 0;
    const carryIn = Math.min(0, Number(entry.carry) || 0);
    const total = sales + fee - clawback + carryIn;
    // Lo que no alcanza a cubrirse este mes pasa como saldo negativo al siguiente.
    // ponytail: recalcular un mes viejo no corrige los meses ya calculados después; se recalculan en orden.
    const amount = Math.max(0, total);
    const carry = Math.min(0, total);
    const detail = [
      `ventas ${academyMoney(sales)}`,
      fee ? `honorario ${academyMoney(fee)}` : '',
      clawback ? `reembolsos -${academyMoney(clawback)}` : '',
      carryIn ? `saldo del mes anterior ${academyMoney(carryIn)}` : '',
      carry ? `pasa al mes siguiente ${academyMoney(carry)}` : '',
    ].filter(Boolean).join(' · ');
    if (!amount && !carry) {
      // Sin saldo: solo corrige una liquidación abierta que ya existía.
      await sql`UPDATE valux_payouts SET amount_cents = 0, carry_cents = 0, detail = ${detail}, status = 'sin saldo' WHERE seller_id = ${entry.seller_id} AND period_ym = ${period} AND status IN ('pendiente', 'sin saldo')`;
      continue;
    }
    const status = amount ? 'pendiente' : 'sin saldo';
    await sql`
      INSERT INTO valux_payouts (id, seller_id, period_ym, amount_cents, status, due_at, detail, carry_cents)
      VALUES (${crypto.randomUUID()}, ${entry.seller_id}, ${period}, ${amount}, ${status}, ${dueAt}, ${detail}, ${carry})
      ON CONFLICT (seller_id, period_ym) DO UPDATE SET
        amount_cents = CASE WHEN valux_payouts.status IN ('pendiente', 'sin saldo') THEN EXCLUDED.amount_cents ELSE valux_payouts.amount_cents END,
        detail = CASE WHEN valux_payouts.status IN ('pendiente', 'sin saldo') THEN EXCLUDED.detail ELSE valux_payouts.detail END,
        carry_cents = CASE WHEN valux_payouts.status IN ('pendiente', 'sin saldo') THEN EXCLUDED.carry_cents ELSE valux_payouts.carry_cents END,
        status = CASE WHEN valux_payouts.status IN ('pendiente', 'sin saldo') THEN EXCLUDED.status ELSE valux_payouts.status END
    `;
  }
}

// Reembolso o disputa: la venta deja de contar (ni acceso ni comisión) y la suscripción se corta ya.
// refs: id de la venta o id de pago tal como se guardó (sesión de Stripe, factura, tr_<ref>).
export async function revokeSales(refs: string[], reason: string) {
  const sql = await crm();
  let revoked = 0;
  for (const ref of refs.filter(Boolean)) {
    const matches = await sql`SELECT paypal_order_id FROM valux_sales WHERE id = ${ref}`;
    const orderIds = [...new Set([ref, `${ref}:bump`, ...matches.flatMap((row) => row.paypal_order_id ? [String(row.paypal_order_id)] : [])])];
    // Primero se bloquean las órdenes y después se descubre el acceso que pudieron crear.
    const [, , [result]] = await sql.transaction((tx) => [deliveryLocks(tx, orderIds.map((id) => `pago:${id}`)), tx`
      SELECT pg_advisory_xact_lock(hashtextextended('academia:' || item.key, 0))
      FROM (
        SELECT DISTINCT 'curso:' || course_id || ':' || buyer_id AS key FROM valux_sales
        WHERE (id = ${ref} OR paypal_order_id = ANY(${orderIds}::text[])) AND course_id IS NOT NULL AND buyer_id IS NOT NULL
        ORDER BY key DESC
      ) AS item
    `, tx`
      WITH revoked_order AS (
        INSERT INTO valux_revoked_orders (order_id, reason)
        SELECT order_id, ${reason} FROM unnest(${orderIds}::text[]) AS orders(order_id)
        ON CONFLICT (order_id) DO NOTHING
      ), sales AS (
        UPDATE valux_sales SET refunded_at = now(), refund_reason = ${reason}
        WHERE (id = ${ref} OR paypal_order_id = ANY(${orderIds}::text[])) AND refunded_at IS NULL
        RETURNING id, buyer_id, course_id, amount_cents
      ), removed AS (
        DELETE FROM lms_enrollments e
        WHERE NOT e.manual_access
          AND EXISTS (SELECT FROM sales a WHERE a.course_id = e.course_id AND a.buyer_id = e.person_id)
          AND NOT EXISTS (
            SELECT FROM valux_sales s
            WHERE s.buyer_id = e.person_id AND s.course_id = e.course_id AND s.refunded_at IS NULL
              AND NOT EXISTS (SELECT FROM sales a WHERE a.id = s.id)
          )
      ), cut AS (
        UPDATE valux_subscriptions SET status = 'cancelada', current_period_end = LEAST(current_period_end, now())
        WHERE (paypal_order_id = ANY(${orderIds}::text[]) OR gateway_id = ${ref}) AND status <> 'cancelada'
        RETURNING id, person_id
      ), gifts AS (
        UPDATE valux_donations SET status = 'reembolsada'
        WHERE paypal_order_id = ${ref} AND status = 'pagada'
      ), transfers AS (
        UPDATE valux_transfers SET status = 'reembolsada'
        WHERE reference IN (
          SELECT substr(order_id, 4) FROM unnest(${orderIds}::text[]) AS orders(order_id)
          WHERE left(order_id, 3) = 'tr_' AND right(order_id, 5) <> ':bump'
        ) AND status IN ('aprobando', 'aprobada')
      )
      SELECT COALESCE((SELECT jsonb_agg(sales) FROM sales), '[]'::jsonb) AS sales,
        COALESCE((SELECT jsonb_agg(cut) FROM cut), '[]'::jsonb) AS cut
    `]);
    for (const sale of result.sales as { id: string; buyer_id: string | null; amount_cents: number }[]) {
      revoked += 1;
      await trackEvent('refund_issued', { id: `refund_issued:${sale.id}`, personId: sale.buyer_id, data: { reason, cents: Number(sale.amount_cents) || 0 } });
    }
    for (const row of result.cut as { id: string; person_id: string }[]) await subscriptionCanceled(row.id, row.person_id, reason);
  }
  return revoked;
}
