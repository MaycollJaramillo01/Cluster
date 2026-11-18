export {};

// Prueba de cupones, correos de seguimiento, videos firmados de Bunny y alertas.
// Uso: npx tsx --env-file=.env.local scripts/check-seguimiento.ts
// Crea filas con un prefijo único y las borra al final. No manda correos: intercepta Resend y los cuenta.

function check(label: string, ok: boolean) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  require('next/server').connection = async () => {};
  require('next/headers').headers = async () => new Headers({ host: 'localhost:3000' });
  const mails: { to: string; subject: string }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('api.resend.com')) {
      const body = JSON.parse(String(init?.body || '{}'));
      mails.push({ to: body.to, subject: body.subject });
      return new Response('{"id":"test"}', { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
  process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'test';
  const sent = (to: string) => mails.filter((mail) => mail.to === to).length;

  const { crm } = await import('@/lib/crm/db');
  const { applyCoupon } = await import('@/lib/valux/coupons');
  const { grantAccess } = await import('@/lib/valux/fulfill');
  const { trackEvent } = await import('@/lib/valux/events');
  const { sendAbandonedCheckouts, sendExpiringMemberships, sendPaymentFailed, sendStalledReminders } = await import('@/lib/valux/followups');
  const { bunnyToken, bunnyVideo, lessonEmbed } = await import('@/lib/valux/video');
  const { alertTeam } = await import('@/lib/valux/alerts');

  // Bunny (puro).
  const id = '0b6d2a3e-1111-4222-8333-444455556666';
  check('bunny:<id> se reconoce', bunnyVideo(`bunny:${id}`)?.id === id);
  check('URL de Bunny trae la biblioteca', bunnyVideo(`https://iframe.mediadelivery.net/embed/12345/${id}`)?.library === '12345');
  process.env.BUNNY_STREAM_TOKEN_KEY = 'clave';
  const url = lessonEmbed(`https://iframe.mediadelivery.net/embed/12345/${id}`, 1_000_000_000_000);
  const expires = 1_000_000_000 + 6 * 3600;
  check('el enlace va firmado y vence en 6 h', url.includes(`token=${bunnyToken('clave', id, expires)}`) && url.includes(`expires=${expires}`));
  check('la firma es sha256(clave+video+vence)', bunnyToken('a', 'b', 1) === require('crypto').createHash('sha256').update('ab1').digest('hex'));
  check('YouTube sigue funcionando', lessonEmbed('https://youtu.be/abc') === 'https://www.youtube.com/embed/abc');

  const sql = await crm();
  const tag = `t${Date.now()}`;
  const course = `${tag}-c`;
  const other = `${tag}-o`;
  const lesson = `${tag}-l`;
  const buyer = `${tag}-b@example.test`;
  const lead = `${tag}-lead@example.test`;
  const quiet = `${tag}-quiet@example.test`;
  let buyerId = '';
  try {
    await sql`INSERT INTO lms_courses (id, slug, title, description, price_cents, published) VALUES (${course}, ${course}, 'Curso', 'x', 5000, true)`;
    await sql`INSERT INTO lms_courses (id, slug, title, description, price_cents, published) VALUES (${other}, ${other}, 'Otro', 'x', 5000, true)`;
    await sql`INSERT INTO lms_lessons (id, course_id, slug, title, content, sort_order) VALUES (${lesson}, ${course}, 'uno', 'Uno', '', 1)`;

    // Cupones.
    await sql`INSERT INTO valux_coupons (code, percent, course_id, max_uses) VALUES (${`${tag}P`.toUpperCase()}, 20, ${course}, 1)`;
    await sql`INSERT INTO valux_coupons (code, amount_cents) VALUES (${`${tag}F`.toUpperCase()}, 7000)`;
    await sql`INSERT INTO valux_coupons (code, percent, expires_at) VALUES (${`${tag}V`.toUpperCase()}, 10, now() - interval '1 day')`;
    const pct = await applyCoupon(`${tag}p`, course, 5000);
    check('20% sobre $50 da $40', pct.ok && pct.cents === 4000);
    check('cupón de otro curso no aplica', !(await applyCoupon(`${tag}p`, other, 5000)).ok);
    const fixed = await applyCoupon(`${tag}f`, other, 5000);
    check('monto fijo mayor que el precio deja $0', fixed.ok && fixed.cents === 0);
    const expired = await applyCoupon(`${tag}v`, course, 5000);
    check('cupón vencido no aplica', !expired.ok && expired.reason === 'vencido');
    const result = await grantAccess({ kind: 'curso', itemId: course, name: 'Compra', email: buyer, amountCents: 4000, couponCode: `${tag}P`.toUpperCase(), paypalOrderId: `${tag}-o1` });
    buyerId = result.personId;
    const sale = (await sql`SELECT amount_cents, coupon_code FROM valux_sales WHERE paypal_order_id = ${`${tag}-o1`}`)[0] as { amount_cents: number; coupon_code: string };
    check('la venta guarda el precio con cupón', Number(sale.amount_cents) === 4000 && sale.coupon_code === `${tag}P`.toUpperCase());
    const used = await applyCoupon(`${tag}p`, course, 5000);
    check('con el único uso gastado queda agotado', !used.ok && used.reason === 'agotado');

    // Abandono: con consentimiento sí, sin consentimiento no, y una sola vez.
    await sql`INSERT INTO valux_people (id, name, email, consent_email) VALUES (${`${tag}-lp`}, 'Lead', ${lead}, true)`;
    await sql`INSERT INTO valux_people (id, name, email, consent_email) VALUES (${`${tag}-qp`}, 'Quiet', ${quiet}, false)`;
    for (const email of [lead, quiet]) {
      await trackEvent('checkout_started', { id: `${tag}-co-${email}`, email, data: { kind: 'curso', item: course } });
      await sql`UPDATE academia_events SET created_at = now() - interval '2 hours' WHERE id = ${`${tag}-co-${email}`}`;
    }
    await sendAbandonedCheckouts();
    await sendAbandonedCheckouts();
    check('abandono: un correo a quien aceptó', sent(lead) === 1);
    check('abandono: nada a quien no aceptó', sent(quiet) === 0);

    // Recordatorio: compró hace 10 días y no avanza.
    await sql`UPDATE lms_enrollments SET created_at = now() - interval '10 days' WHERE person_id = ${buyerId}`;
    await sendStalledReminders();
    await sendStalledReminders();
    const reminders = mails.filter((m) => m.to === buyer && m.subject.startsWith('Sigue')).length;
    check('recordatorio enviado una vez', reminders === 1);
    await sql`UPDATE valux_people SET reminders_off = true WHERE id = ${buyerId}`;
    await sql`UPDATE academia_followups SET sent_at = now() - interval '20 days' WHERE email = ${buyer} AND kind = 'recordatorio'`;
    await sendStalledReminders();
    check('quien apagó los recordatorios no recibe más', mails.filter((m) => m.to === buyer && m.subject.startsWith('Sigue')).length === 1);

    // Vencimiento: membresía que no se renueva y vence en 2 días.
    await sql`INSERT INTO valux_subscriptions (id, person_id, status, current_period_end) VALUES (${`${tag}-s`}, ${buyerId}, 'no_renueva', now() + interval '2 days')`;
    await sendExpiringMemberships();
    await sendExpiringMemberships();
    check('aviso de vencimiento una vez', mails.filter((m) => m.to === buyer && m.subject.startsWith('Tu membresía vence')).length === 1);

    // Cobro fallido: una vez por factura.
    await sendPaymentFailed({ invoiceId: `in_${tag}`, email: buyer, amountCents: 800, payUrl: 'https://invoice.stripe.com/x' });
    await sendPaymentFailed({ invoiceId: `in_${tag}`, email: buyer, amountCents: 800, payUrl: 'https://invoice.stripe.com/x' });
    check('aviso de cobro fallido una vez', mails.filter((m) => m.to === buyer && m.subject.startsWith('No pudimos cobrar')).length === 1);

    // Alertas: una por tema cada hora.
    process.env.ALERT_EMAIL = `${tag}-alert@example.test`;
    const first = await alertTeam(`prueba ${tag}`, new Error('falló'));
    const second = await alertTeam(`prueba ${tag}`, new Error('falló otra vez'));
    check('la alerta se manda', first && sent(`${tag}-alert@example.test`) === 1);
    check('la segunda alerta del mismo tema se calla', !second && sent(`${tag}-alert@example.test`) === 1);
  } finally {
    await sql`DELETE FROM crm_meta WHERE key = ${`alert:prueba ${tag}`}`;
    await sql`DELETE FROM academia_followups WHERE email IN (${buyer}, ${lead}, ${quiet})`;
    await sql`DELETE FROM academia_events WHERE email IN (${buyer}, ${lead}, ${quiet}) OR person_id = ${buyerId || '-'}`;
    await sql`DELETE FROM valux_subscriptions WHERE person_id = ${buyerId || '-'}`;
    await sql`DELETE FROM valux_sales WHERE buyer_id = ${buyerId || '-'}`;
    await sql`DELETE FROM lms_enrollments WHERE person_id = ${buyerId || '-'}`;
    await sql`DELETE FROM valux_coupons WHERE code LIKE ${`${tag.toUpperCase()}%`}`;
    await sql`DELETE FROM lms_courses WHERE id IN (${course}, ${other})`;
    await sql`DELETE FROM valux_people WHERE id IN (${buyerId || '-'}, ${`${tag}-lp`}, ${`${tag}-qp`})`;
    console.log('limpieza lista');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
