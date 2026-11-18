export {};

// Prueba de contratos, liquidaciones, leads, eventos, webhook de Stripe, recibos, retos y analítica.
// Uso: npx tsx --env-file=.env.local scripts/check-lms-cierre.ts
// Crea filas con un prefijo único y las borra al final. No manda correos: intercepta Resend.

function check(label: string, ok: boolean) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  const req = require('next/server');
  req.connection = async () => {};
  require('next/headers').headers = async () => new Headers({ host: 'localhost:3000' });
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('api.resend.com')) return new Response('{"id":"test"}', { status: 200 });
    return realFetch(input, init);
  }) as typeof fetch;

  const { crm } = await import('@/lib/crm/db');
  const { areaForPath, canDo } = await import('@/lib/crm/roles');
  const { computePayouts, grantAccess, revokeSales } = await import('@/lib/valux/fulfill');
  const { advanceStage, saveLead, trackEvent } = await import('@/lib/valux/events');
  const { listReceipts } = await import('@/lib/valux/receipts');
  const { challengeProgress, getChallenge } = await import('@/lib/valux/challenges');
  const { personXp } = await import('@/lib/valux/data');
  const { academyAnalytics } = await import('@/lib/valux/analytics');
  const { runReconcile } = await import('@/lib/valux/reconcile');
  const { periodYm } = await import('@/lib/valux/money');

  // Rutas (puro).
  check('profesor entra a un curso', canDo('profesor', areaForPath('/dashboard/cursos/abc/lecciones/x')!));
  check('profesor no entra a retos', !canDo('profesor', areaForPath('/dashboard/cursos/retos')!));
  check('profesor no entra a la lista de cursos', !canDo('profesor', areaForPath('/dashboard/cursos')!));
  check('contenido no ve analítica', !canDo('contenido', areaForPath('/dashboard/cursos/analitica')!));
  check('finanzas no edita un curso', !canDo('finanzas', areaForPath('/dashboard/cursos/abc')!));

  const sql = await crm();
  await sql`SELECT 1`;
  const tag = `t${Date.now()}`;
  const teacher = `${tag}-teacher`;
  const buyerEmail = `${tag}-b@example.test`;
  const courseA = `${tag}-a`;
  const courseB = `${tag}-b`;
  const lesson = `${tag}-l`;
  const challenge = `${tag}-r`;
  const eventId = `evt_${tag}`;
  let buyerId = '';
  try {
    await sql`INSERT INTO valux_people (id, name, email, role, contract_kind, contract_percent) VALUES (${teacher}, 'Profe', ${`${tag}-t@example.test`}, 'profesor', 'porcentaje', 10)`;
    await sql`INSERT INTO lms_courses (id, slug, title, description, price_cents, published, teacher_id) VALUES (${courseA}, ${courseA}, 'A', 'x', 1000, true, ${teacher})`;
    await sql`INSERT INTO lms_courses (id, slug, title, description, price_cents, published, teacher_id) VALUES (${courseB}, ${courseB}, 'B', 'x', 2000, true, ${teacher})`;
    await sql`INSERT INTO lms_lessons (id, course_id, slug, title, content, sort_order) VALUES (${lesson}, ${courseA}, 'uno', 'Uno', '', 1)`;

    // Contrato porcentaje: la academia se queda 10%.
    const first = await grantAccess({ kind: 'curso', itemId: courseA, name: 'Comprador', email: buyerEmail, paypalOrderId: `${tag}-o1` });
    buyerId = first.personId;
    const saleA = (await sql`SELECT fee_cents, seller_cents FROM valux_sales WHERE paypal_order_id = ${`${tag}-o1`}`)[0] as { fee_cents: number; seller_cents: number };
    check('contrato de porcentaje parte 10/90', Number(saleA.fee_cents) === 100 && Number(saleA.seller_cents) === 900);
    const stage = (await sql`SELECT stage FROM valux_people WHERE id = ${buyerId}`)[0] as { stage: string };
    check('la compra pasa a comprador', stage.stage === 'comprador');
    await advanceStage({ personId: buyerId }, 'checkout');
    const still = (await sql`SELECT stage FROM valux_people WHERE id = ${buyerId}`)[0] as { stage: string };
    check('la etapa no retrocede', still.stage === 'comprador');
    const purchases = await sql`SELECT count(*) AS n FROM academia_events WHERE id = ${`purchase_completed:${tag}-o1`}`;
    check('purchase_completed registrado', Number((purchases[0] as { n: unknown }).n) === 1);

    // Honorario: la venta queda entera en la academia y la liquidación suma el fijo.
    await sql`UPDATE valux_people SET contract_kind = 'honorario', contract_fee_cents = 5000 WHERE id = ${teacher}`;
    await grantAccess({ kind: 'curso', itemId: courseB, name: 'Comprador', email: buyerEmail, paypalOrderId: `${tag}-o2` });
    const saleB = (await sql`SELECT seller_cents FROM valux_sales WHERE paypal_order_id = ${`${tag}-o2`}`)[0] as { seller_cents: number };
    check('honorario: el profesor no cobra por venta', Number(saleB.seller_cents) === 0);

    // Liquidación del mes: 900 de la venta A + 5000 de honorario.
    const period = periodYm();
    await computePayouts(period);
    const payout = () => sql`SELECT amount_cents, status, detail FROM valux_payouts WHERE seller_id = ${teacher} AND period_ym = ${period}`;
    check('liquidación = ventas + honorario', Number(((await payout())[0] as { amount_cents: unknown }).amount_cents) === 5900);

    // La venta A se mueve a un mes ya pagado: su reembolso de hoy se descuenta en este mes.
    await sql`UPDATE valux_sales SET period_ym = '2000-01' WHERE paypal_order_id = ${`${tag}-o1`}`;
    await sql`INSERT INTO valux_payouts (id, seller_id, period_ym, amount_cents, status, due_at) VALUES (${`${tag}-y`}, ${teacher}, '2000-01', 900, 'transferida', now())`;

    // Reembolso: quita el acceso y registra el evento.
    await revokeSales([`${tag}-o1`], 'reembolso');
    await computePayouts(period);
    const after = (await payout())[0] as { amount_cents: unknown; detail: string };
    check('reembolso de venta ya pagada se descuenta', Number(after.amount_cents) === 4100 && after.detail.includes('reembolsos'));
    await sql`UPDATE valux_people SET contract_refund = 'academia' WHERE id = ${teacher}`;
    await computePayouts(period);
    check('si la academia absorbe, no se descuenta', Number(((await payout())[0] as { amount_cents: unknown }).amount_cents) === 5000);
    const enrolled = await sql`SELECT 1 FROM lms_enrollments WHERE person_id = ${buyerId} AND course_id = ${courseA}`;
    check('el reembolso quita el curso', enrolled.length === 0);
    const refundEvents = await sql`SELECT count(*) AS n FROM academia_events WHERE name = 'refund_issued' AND person_id = ${buyerId}`;
    check('refund_issued registrado', Number((refundEvents[0] as { n: unknown }).n) === 1);

    // Recibos: solo los de la persona.
    const receipts = await listReceipts(buyerId);
    check('recibos del comprador', receipts.length === 2 && receipts.some((item) => item.refunded_at));
    const foreign = await listReceipts(teacher, receipts[0].id);
    check('otra persona no ve el recibo', foreign.length === 0);

    // Lead y consentimiento.
    await saveLead(buyerId, { source: 'instagram', utm: 'utm_source=instagram', consentEmail: false, consentWhatsapp: true });
    await saveLead(buyerId, { source: 'google', utm: '', consentEmail: true, consentWhatsapp: true });
    const lead = (await sql`SELECT source, consent_whatsapp, consent_email FROM valux_people WHERE id = ${buyerId}`)[0] as { source: string; consent_whatsapp: boolean; consent_email: boolean };
    check('la primera fuente se conserva', lead.source === 'instagram');
    check('consentimientos guardados', lead.consent_whatsapp === true && lead.consent_email === true);

    // Eventos deduplicados por id.
    await trackEvent('checkout_started', { id: `${tag}-e`, email: buyerEmail });
    await trackEvent('checkout_started', { id: `${tag}-e`, email: buyerEmail });
    const dupe = await sql`SELECT count(*) AS n FROM academia_events WHERE id = ${`${tag}-e`}`;
    check('evento repetido se guarda una vez', Number((dupe[0] as { n: unknown }).n) === 1);

    // Retos: 1 misión aprobada cumple "aprobar 1 misión"; el bono suma una vez.
    await sql`INSERT INTO lms_challenges (id, title, kind, target, bonus_xp, created_at) VALUES (${challenge}, 'Reto', 'misiones', 1, 40, now() - interval '1 minute')`;
    const item = (await getChallenge(challenge))!;
    check('reto sin avance no se cumple', !(await challengeProgress(buyerId, item)).met);
    await sql`INSERT INTO lms_xp (person_id, lesson_id, xp) VALUES (${buyerId}, ${lesson}, 10)`;
    check('reto cumplido', (await challengeProgress(buyerId, item)).met);
    for (let i = 0; i < 2; i += 1) {
      await sql`INSERT INTO lms_challenge_claims (challenge_id, person_id, xp) VALUES (${challenge}, ${buyerId}, 40) ON CONFLICT DO NOTHING`;
    }
    check('XP total suma el bono una vez', (await personXp(buyerId)) === 50);

    // Webhook de Stripe: el mismo evento no se aplica dos veces.
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const { createHmac } = await import('crypto');
    const body = JSON.stringify({ id: eventId, type: 'customer.subscription.updated', data: { object: { id: 'sub_x', cancel_at_period_end: false } } });
    const stamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', 'whsec_test').update(`${stamp}.${body}`).digest('hex');
    const { POST } = await import('@/app/api/academia/stripe/route');
    const send = () => POST(new Request('http://localhost/api/academia/stripe', { method: 'POST', body, headers: { 'stripe-signature': `t=${stamp},v1=${signature}` } }));
    const one = await (await send()).json();
    const two = await (await send()).json();
    check('primer evento se procesa', one.received === true && !one.duplicate);
    check('reenvío del evento se ignora', two.duplicate === true);
    const logged = (await sql`SELECT processed_at FROM stripe_events WHERE id = ${eventId}`)[0] as { processed_at: unknown };
    check('evento queda registrado como procesado', Boolean(logged?.processed_at));

    // Conciliación y analítica corren sin error.
    const reconcile = await runReconcile();
    check('conciliación corre', typeof reconcile.inactive === 'number');
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
    const stats = await academyAnalytics({ from: day, to: day, courseId: courseB });
    check('analítica por curso cuenta la venta vigente', stats.revenue === 2000 && stats.orders === 1);
    check('analítica cuenta el reembolso del día', (await academyAnalytics({ from: day, to: day, courseId: courseA })).refunds.count === 1);
  } finally {
    await sql`DELETE FROM stripe_events WHERE id = ${eventId}`;
    await sql`DELETE FROM valux_payouts WHERE seller_id = ${teacher}`;
    await sql`DELETE FROM lms_challenges WHERE id = ${challenge}`;
    await sql`DELETE FROM academia_events WHERE person_id = ${buyerId} OR email = ${buyerEmail} OR id = ${`${tag}-e`}`;
    await sql`DELETE FROM lms_xp WHERE person_id = ${buyerId}`;
    await sql`DELETE FROM lms_enrollments WHERE person_id = ${buyerId}`;
    await sql`DELETE FROM valux_sales WHERE buyer_id = ${buyerId}`;
    await sql`DELETE FROM lms_courses WHERE id IN (${courseA}, ${courseB})`;
    await sql`DELETE FROM valux_people WHERE id IN (${teacher}, ${buyerId || '-'})`;
    console.log('limpieza lista');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
