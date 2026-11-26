import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

async function main() {
  if (!process.env.LMS_TEST_SCHEMA) throw new Error('Usa npm run test:lms para aislar los datos');
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const sql = await crm();
  const cookies = new Map<string, string>();
  const headers = require('next/headers');
  headers.cookies = async () => ({ get: (key: string) => cookies.has(key) ? { value: cookies.get(key) } : undefined });
  headers.headers = async () => new Headers({ host: 'localhost:3000' });
  require('next/cache').revalidatePath = () => {};
  const network = globalThis.fetch;
  let stripeList = ['cs_fase1'];
  const endsInThePast = Math.floor(Date.now() / 1000) - 86400;
  globalThis.fetch = (async (url, init) => {
    if (String(url).includes('api.resend.com')) return new Response('{}');
    if (String(url) === 'https://api.stripe.com/v1/checkout/sessions/cs_fase1') {
      return Response.json({ payment_status: 'paid', currency: 'hnl', amount_total: 10000 });
    }
    if (String(url) === 'https://api.stripe.com/v1/checkout/sessions/cs_fase1_expired') {
      return Response.json({ payment_status: 'paid', currency: 'hnl', amount_total: 35000, subscription: 'sub_fase1_expired', invoice: 'in_fase1_expired' });
    }
    if (String(url) === 'https://api.stripe.com/v1/subscriptions/sub_fase1_expired') {
      return Response.json({ status: 'canceled', current_period_end: endsInThePast });
    }
    if (String(url).includes('api.stripe.com/v1/checkout/sessions?')) {
      return Response.json({ data: stripeList.map((id) => ({ id, payment_status: 'paid' })), has_more: false });
    }
    return network(url, init);
  }) as typeof fetch;

  const { grantAccess, fulfillStripeSession, revokeSales, activateSubscription } = await import('@/lib/valux/fulfill');
  const { runReconcile, retryPendingStripePayments } = await import('@/lib/valux/reconcile');
  const { approveTransfer } = await import('@/lib/valux/transfer-actions');
  const { retryApprovedTransfers } = await import('@/lib/valux/transfer-fulfillment');
  const { migrateCrmEnrollments } = await import('@/lib/crm/lms-enrollment');
  const { enrollContact, removeEnrollment } = await import('@/lib/crm/lms-actions');
  const { canReadCourse, myCourses, getPersonByEmail } = await import('@/lib/valux/data');
  const { issueSession, SESSION_COOKIE } = await import('@/lib/crm/session');
  const { ACADEMIA_COOKIE, academiaCookieValue } = await import('@/lib/valux/session');
  const { GET } = await import('@/app/api/academia/descargas/[kind]/[id]/route');
  const form = (values: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value);
    return data;
  };
  const redirectTo = (path: string) => (error: unknown) =>
    Boolean((error as { digest?: string }).digest?.split(';')[2] === path);

  await sql`INSERT INTO lms_courses(id,slug,title,price_cents,published,plan_level) VALUES
    ('phase1-paid','phase1-paid','Curso de pago',10000,true,2),
    ('phase1-transfer','phase1-transfer','Curso por transferencia',5000,true,0),
    ('phase1-other','phase1-other','Otro curso',8000,true,0),
    ('phase1-hidden','phase1-hidden','Curso retirado',10000,false,0)`;
  await sql`INSERT INTO lms_lessons(id,course_id,slug,title,sort_order) VALUES
    ('phase1-first','phase1-paid','primera','Primera',1),('phase1-second','phase1-paid','segunda','Segunda',2)`;
  await sql`INSERT INTO valux_people(id,name,email) VALUES
    ('phase1-crm','Persona CRM','crm-fase1@example.test'),('phase1-member','Miembro','member-fase1@example.test')`;
  await sql`INSERT INTO contacts(id,name,email) VALUES
    ('phase1-contact','Contacto histórico','CRM-FASE1@example.test'),
    ('phase1-contact-new','Contacto nuevo','nuevo-fase1@example.test')`;
  await sql`INSERT INTO lms_enrollments(id,course_id,person_id) VALUES
    ('phase1-canonical','phase1-paid','phase1-crm'),('phase1-retired','phase1-hidden','phase1-crm')`;
  await sql`INSERT INTO lms_enrollments(id,course_id,contact_id,final_grade,notes)
    VALUES ('phase1-legacy','phase1-paid','phase1-contact',92,'Nota anterior')`;
  await sql`INSERT INTO lms_progress(id,contact_id,lesson_id,score,completed_at,graded_at)
    VALUES ('phase1-progress','phase1-contact','phase1-first',88,now(),now())`;
  await migrateCrmEnrollments(sql);
  await migrateCrmEnrollments(sql);
  assert.deepEqual(await sql`SELECT id, manual_access, final_grade, notes FROM lms_enrollments
    WHERE course_id='phase1-paid' AND person_id='phase1-crm'`,
    [{ id: 'phase1-canonical', manual_access: true, final_grade: 92, notes: 'Nota anterior' }]);
  assert.equal((await sql`SELECT score FROM lms_progress WHERE person_id='phase1-crm' AND lesson_id='phase1-first'`)[0]?.score, 88);
  const library = await myCourses('phase1-crm');
  assert.equal(library.find((course) => course.slug === 'phase1-paid')?.done, 1);
  assert.equal(library.find((course) => course.slug === 'phase1-hidden')?.available, false);

  await sql`INSERT INTO crm_staff(email,name,role) VALUES
    ('content-fase1@example.test','Contenido','contenido'),('finance-fase1@example.test','Finanzas','finanzas')`;
  cookies.set(SESSION_COOKIE, issueSession('content-fase1@example.test', 'Contenido', 'contenido'));
  const newEnrollment = form({ course_id: 'phase1-other', contact_id: 'phase1-contact-new' });
  await Promise.all([enrollContact(newEnrollment), enrollContact(newEnrollment)]);
  const newLearner = await getPersonByEmail('nuevo-fase1@example.test');
  assert.ok(newLearner);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${newLearner.id}`).length, 1);
  await sql`DELETE FROM contacts WHERE id='phase1-contact-new'`;
  assert.equal(await canReadCourse(newLearner.id, { id: 'phase1-other', price_cents: 8000, teacher_id: '' }), true);
  await sql`UPDATE valux_people SET is_active=false WHERE id=${newLearner.id}`;
  assert.equal((await myCourses(newLearner.id))[0]?.availability, 'Acceso suspendido');
  console.log('OK Matrículas CRM nuevas e históricas, avance, duplicados y cursos no disponibles');

  await sql`INSERT INTO valux_subscriptions(id,person_id,status,current_period_end,plan_id) VALUES
    ('phase1-plan','phase1-member','no_renueva',now()+interval '1 day','pro')`;
  assert.equal((await myCourses('phase1-member')).find((course) => course.slug === 'phase1-paid')?.available, true);
  assert.equal((await myCourses('phase1-member')).some((course) => course.slug === 'phase1-other'), false);
  await sql`UPDATE valux_subscriptions SET current_period_end=now()-interval '1 day' WHERE id='phase1-plan'`;
  assert.equal((await myCourses('phase1-member')).some((course) => course.slug === 'phase1-paid'), false);
  console.log('OK La biblioteca respeta los niveles y el vencimiento de la membresía');

  process.env.STRIPE_SECRET_KEY = 'sk_test_local_simulado';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fase1_simulado';
  await sql`INSERT INTO valux_intents(id,paypal_order_id,kind,item_id,buyer_name,buyer_email,amount_cents,created_at)
    VALUES ('phase1-intent','cs_fase1','curso','phase1-paid','Comprador','buyer-fase1@example.test',10000,now()-interval '4 days')`;
  await sql`ALTER TABLE lms_enrollments ADD CONSTRAINT phase1_block_delivery CHECK (course_id <> 'phase1-paid') NOT VALID`;
  await assert.rejects(fulfillStripeSession('cs_fase1'));
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='cs_fase1'`).length, 0);
  assert.equal((await sql`SELECT id FROM academia_mail_queue WHERE email='buyer-fase1@example.test'`).length, 0);
  assert.ok((await sql`SELECT payment_validated_at FROM valux_intents WHERE id='phase1-intent'`)[0].payment_validated_at);
  await sql`ALTER TABLE lms_enrollments DROP CONSTRAINT phase1_block_delivery`;
  stripeList = [];
  const retry = await retryPendingStripePayments();
  assert.equal(retry.delivered, 1);
  await Promise.all([fulfillStripeSession('cs_fase1'), fulfillStripeSession('cs_fase1')]);
  const buyer = await getPersonByEmail('buyer-fase1@example.test');
  assert.ok(buyer);
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='cs_fase1'`).length, 1);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id}`).length, 1);
  assert.equal((await sql`SELECT id FROM academia_mail_queue WHERE email='buyer-fase1@example.test'`).length, 1);
  await sql`DELETE FROM lms_enrollments WHERE person_id=${buyer.id}`;
  await sql`UPDATE valux_sales SET entitlement_applied_at=NULL WHERE paypal_order_id='cs_fase1'`;
  await sql`UPDATE valux_intents SET fulfilled_at=NULL, payment_validated_at=NULL WHERE id='phase1-intent'`;
  assert.equal((await runReconcile()).granted, 1);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id}`).length, 1);
  await revokeSales(['cs_fase1'], 'reembolso');
  await fulfillStripeSession('cs_fase1');
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id}`).length, 0);
  await revokeSales(['phase1-refund-before'], 'reembolso');
  await grantAccess({ kind: 'curso', itemId: 'phase1-paid', email: buyer.email, name: 'Comprador', paypalOrderId: 'phase1-refund-before' });
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='phase1-refund-before'`).length, 0);
  console.log('OK Stripe atómico, reintento de pago antiguo, reparación histórica y reembolso sin resurrección');

  const concurrentOrder = (orderId: string) => grantAccess({ kind: 'curso', itemId: 'phase1-paid', email: buyer.email, name: 'Comprador', paypalOrderId: orderId });
  await Promise.all([concurrentOrder('phase1-race'), revokeSales(['phase1-race'], 'reembolso')]);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id}`).length, 0);
  await Promise.all([concurrentOrder('phase1-two-a'), concurrentOrder('phase1-two-b')]);
  await Promise.all([revokeSales(['phase1-two-a'], 'reembolso'), revokeSales(['phase1-two-b'], 'reembolso')]);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id}`).length, 0);
  console.log('OK Compra y reembolsos simultáneos conservan un resultado coherente');

  const { POST } = await import('@/app/api/academia/stripe/route');
  const sendInvoice = (paymentId = 'in_fase1', subscription = 'sub_fase1', owned = true, type = 'invoice.paid', currency = owned ? 'hnl' : 'usd') => {
    const payload = JSON.stringify({ id: `evt_${paymentId}`, type, data: { object: {
      id: paymentId, subscription, currency, amount_paid: 10000, amount_due: 10000,
      customer_email: 'renew-fase1@example.test',
      subscription_details: { metadata: owned ? { kind: 'suscripcion', buyer_email: 'renew-fase1@example.test' } : {} },
    } } });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET!).update(`${timestamp}.${payload}`).digest('hex');
    return POST(new Request('http://localhost/api/academia/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` } }));
  };
  assert.equal((await sendInvoice()).status, 500);
  await activateSubscription({ gatewayId: 'sub_fase1', email: 'renew-fase1@example.test', name: 'Renovación', planId: 'pro', periodEnd: null });
  assert.equal((await sendInvoice()).status, 200);
  assert.equal((await sendInvoice()).status, 200);
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='in_fase1'`).length, 1);
  await revokeSales(['in_fase1_revoked', 'sub_fase1'], 'reembolso');
  assert.equal((await sendInvoice('in_fase1_revoked')).status, 200);
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='in_fase1_revoked'`).length, 0);
  assert.equal((await sendInvoice('in_fase1_external', 'sub_fase1_external', false)).status, 200);
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='in_fase1_external'`).length, 0);
  console.log('OK Una factura adelantada de Stripe se reintenta cuando existe la membresía');

  const sendFailedInvoice = () => sendInvoice('in_failed_academy', 'sub_fase1', true, 'invoice.payment_failed', 'usd');
  assert.equal((await sendFailedInvoice()).status, 200);
  assert.deepEqual(await (await sendFailedInvoice()).json(), { received: true, duplicate: true });
  assert.equal((await sendInvoice('in_failed_external', 'sub_fase1_external', false, 'invoice.payment_failed')).status, 200);
  const failedNotices = await sql`SELECT key, delivered FROM academia_followups WHERE key IN ('cobro:in_failed_academy', 'cobro:in_failed_external')`;
  assert.deepEqual(failedNotices.map(({ key, delivered }) => ({ key, delivered })), [{ key: 'cobro:in_failed_academy', delivered: true }]);
  console.log('OK Un cobro fallido en USD avisa una sola vez y una factura ajena no avisa');

  await sql`INSERT INTO valux_intents(id,paypal_order_id,kind,item_id,buyer_name,buyer_email,amount_cents)
    VALUES ('phase1-expired','cs_fase1_expired','suscripcion','pro','Anterior','expired-fase1@example.test',35000)`;
  await fulfillStripeSession('cs_fase1_expired');
  await fulfillStripeSession('cs_fase1_expired');
  const [expired] = await sql`SELECT status, extract(epoch FROM current_period_end)::integer AS ends FROM valux_subscriptions WHERE gateway_id='sub_fase1_expired'`;
  assert.deepEqual(expired, { status: 'vencida', ends: endsInThePast });
  assert.equal((await sql`SELECT id FROM academia_mail_queue WHERE email='expired-fase1@example.test'`).length, 0);
  console.log('OK Un checkout antiguo conserva el vencimiento real de Stripe');

  await sql`INSERT INTO valux_transfers(id,reference,kind,item_id,description,buyer_name,buyer_email,amount_cents,months,expires_at)
    VALUES ('phase1-trans','CL-FASE1','curso','phase1-transfer','Curso','Banco','bank-fase1@example.test',5000,1,now()+interval '1 day')`;
  cookies.set(SESSION_COOKIE, issueSession('finance-fase1@example.test', 'Finanzas', 'finanzas'));
  await sql`ALTER TABLE lms_enrollments ADD CONSTRAINT phase1_block_bank CHECK (course_id <> 'phase1-transfer') NOT VALID`;
  await assert.rejects(approveTransfer(form({ id: 'phase1-trans', bank_ref: 'operacion-fase1' })), redirectTo('/dashboard/cursos/transferencias?estado=aprobando&error=acceso'));
  assert.equal((await sql`SELECT status FROM valux_transfers WHERE id='phase1-trans'`)[0].status, 'aprobando');
  await sql`ALTER TABLE lms_enrollments DROP CONSTRAINT phase1_block_bank`;
  assert.equal((await retryApprovedTransfers()).delivered, 1);
  assert.equal((await retryApprovedTransfers()).delivered, 0);
  assert.equal((await sql`SELECT status FROM valux_transfers WHERE id='phase1-trans'`)[0].status, 'aprobada');
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='tr_CL-FASE1'`).length, 1);
  await sql`INSERT INTO valux_transfers(id,reference,kind,item_id,description,buyer_name,buyer_email,amount_cents,months,expires_at,status,bank_ref,reviewed_at,bump_item_id,bump_cents)
    VALUES
      ('phase1-old-transfer','CL-FASE1-OLD','curso','phase1-transfer','Curso','Banco anterior','old-bank-fase1@example.test',5000,1,now()-interval '31 days','aprobada','previa',now()-interval '32 days',NULL,0),
      ('phase1-old-plan','CL-FASE1-PLAN','suscripcion','pro','Plan','Banco anterior','old-bank-fase1@example.test',5000,1,now()-interval '59 days','aprobada','plan',now()-interval '60 days',NULL,0),
      ('phase1-revoked-transfer','CL-FASE1-REVOKED','curso','phase1-transfer','Curso','Banco devuelto','old-bank-fase1@example.test',6500,1,now()-interval '34 days','aprobada','reembolso',now()-interval '35 days','phase1-other',1500)`;
  await sql`INSERT INTO valux_sales (id,kind,paypal_order_id,course_id,amount_cents,period_ym,refunded_at)
    VALUES ('phase1-legacy-refund','curso','tr_CL-FASE1-REVOKED','phase1-transfer',5000,'2026-01',now())`;
  assert.equal((await retryApprovedTransfers()).delivered, 2);
  assert.equal((await retryApprovedTransfers()).delivered, 0);
  const oldBankBuyer = await getPersonByEmail('old-bank-fase1@example.test');
  assert.ok(oldBankBuyer);
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE person_id=${oldBankBuyer.id} AND course_id='phase1-transfer'`).length, 1);
  assert.equal((await sql`SELECT status FROM valux_subscriptions WHERE paypal_order_id='tr_CL-FASE1-PLAN'`)[0].status, 'vencida');
  assert.equal((await sql`SELECT id FROM valux_sales WHERE paypal_order_id='tr_CL-FASE1-REVOKED:bump'`).length, 0);
  await revokeSales(['tr_CL-FASE1'], 'reembolso');
  assert.equal((await sql`SELECT status FROM valux_transfers WHERE id='phase1-trans'`)[0].status, 'reembolsada');
  console.log('OK Transferencia confirmada reintentable sin duplicar la venta');

  await sql`INSERT INTO lms_resources(id,lesson_id,kind,title,url) VALUES
    ('phase1-file','phase1-first','pdf','PDF','https://example.test/material.pdf'),
    ('phase1-locked','phase1-second','pdf','PDF','https://example.test/segundo.pdf'),
    ('phase1-private','phase1-first','pdf','Archivo privado','privado:academia/materiales/11111111-2222-4333-8444-555555555555-guia.pdf')`;
  await sql`INSERT INTO valux_products (id,title,price_cents,download_url,review_status)
    VALUES ('phase1-product','Producto',5500,'https://example.test/producto.zip','publicado')`;
  const asset = (kind: string, id: string) => GET(new Request('http://localhost:3000/api/academia/descargas'), { params: Promise.resolve({ kind, id }) });
  assert.equal((await asset('recurso', 'phase1-file')).status, 404);
  assert.equal((await asset('producto', 'phase1-product')).status, 404);
  cookies.set(ACADEMIA_COOKIE, academiaCookieValue(buyer.id));
  assert.equal((await asset('recurso', 'phase1-file')).status, 404);
  await grantAccess({ kind: 'curso', itemId: 'phase1-paid', email: buyer.email, name: 'Comprador', paypalOrderId: 'phase1-new-payment' });
  assert.equal((await asset('recurso', 'phase1-locked')).status, 404);
  const external = await asset('recurso', 'phase1-file');
  assert.equal(external.status, 302);
  assert.equal(external.headers.get('cache-control'), 'private, no-store');
  assert.equal(external.headers.get('location'), 'https://example.test/material.pdf');
  const oldToken = process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN;
  delete process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN;
  assert.equal((await asset('recurso', 'phase1-private')).status, 503);
  const { MockAgent, getGlobalDispatcher, setGlobalDispatcher } = require('undici');
  const dispatcher = getGlobalDispatcher();
  const blob = new MockAgent();
  const blobToken = 'vercel_blob_rw_fase1_simulado';
  blob.enableNetConnect((host: string) => !host.endsWith('.blob.vercel-storage.com'));
  blob.get('https://fase1.private.blob.vercel-storage.com').intercept({
    method: 'GET', path: '/academia/materiales/11111111-2222-4333-8444-555555555555-guia.pdf',
    headers: { authorization: `Bearer ${blobToken}` },
  }).reply(200, 'material privado');
  try {
    process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN = blobToken;
    setGlobalDispatcher(blob);
    const download = await asset('recurso', 'phase1-private');
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('content-disposition'), 'attachment; filename="guia.pdf"');
    assert.equal(download.headers.get('cache-control'), 'private, no-store');
    assert.equal(await download.text(), 'material privado');
    blob.assertNoPendingInterceptors();
  } finally {
    setGlobalDispatcher(dispatcher);
    await blob.close();
    if (oldToken) process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN = oldToken;
    else delete process.env.ACADEMIA_PRIVATE_BLOB_READ_WRITE_TOKEN;
  }
  await grantAccess({ kind: 'producto', itemId: 'phase1-product', email: buyer.email, name: 'Comprador', paypalOrderId: 'phase1-product-payment' });
  assert.equal((await asset('producto', 'phase1-product')).status, 302);
  await revokeSales(['phase1-product-payment'], 'reembolso');
  assert.equal((await asset('producto', 'phase1-product')).status, 404);
  console.log('OK Descargas comprueban pago, reembolsos, desbloqueo y almacenamiento privado');

  cookies.set(SESSION_COOKIE, issueSession('content-fase1@example.test', 'Contenido', 'contenido'));
  const [purchased] = await sql`SELECT id FROM lms_enrollments WHERE person_id=${buyer.id} AND course_id='phase1-paid'`;
  await removeEnrollment(form({ id: String(purchased.id) }));
  assert.equal((await sql`SELECT id FROM lms_enrollments WHERE id=${purchased.id}`).length, 1);
  await grantAccess({ kind:'curso', itemId:'phase1-paid', name:'Persona CRM', email:'crm-fase1@example.test', paypalOrderId:'phase1-crm-pay' });
  await revokeSales(['phase1-crm-pay'], 'reembolso');
  assert.equal((await sql`SELECT manual_access FROM lms_enrollments WHERE id='phase1-canonical'`)[0]?.manual_access, true);
  console.log('OK Una compra vigente y una matrícula manual no se revocan entre sí');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
