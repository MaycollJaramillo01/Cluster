export {};

// Prueba del acceso de un solo uso, planes y reembolsos contra la base de .env.local.
// Uso: npx tsx --env-file=.env.local scripts/check-academia.ts
// Crea filas con un prefijo único y las borra al final. El correo se intercepta: nada sale a Resend.
process.env.RESEND_API_KEY = 'test';
const sent: { subject: string; text: string }[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
  if (String(url).includes('api.resend.com')) {
    sent.push(JSON.parse(String(init?.body)));
    return new Response('{}');
  }
  return realFetch(url, init);
}) as typeof fetch;

function check(label: string, ok: boolean) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  // Fuera de Next no hay request: connection() se anula para la prueba.
  const req = require('next/server');
  req.connection = async () => {};
  const { crm } = require('@/lib/crm/db') as typeof import('@/lib/crm/db');
  const { startLogin, verifyLoginCode, verifyLoginLink } = await import('@/lib/valux/login');
  const { canReadCourse, listPlans } = await import('@/lib/valux/data');
  const { revokeSales } = await import('@/lib/valux/fulfill');
  const sql = await crm();
  const tag = `t${Date.now()}`;
  const email = `${tag}@example.test`;
  const base = 'http://localhost:3000';
  const last = () => {
    const mail = sent[sent.length - 1];
    return { code: mail.text.match(/\b(\d{6})\b/)?.[1] || '', token: mail.text.match(/t=([\w-]+)/)?.[1] || '' };
  };
  const peopleIds: string[] = [];
  const courseIds = [`${tag}-a`, `${tag}-b`];

  try {
    // 1. Correo desconocido sin registro: no sale nada.
    await startLogin({ email: `otro-${email}`, register: false, base });
    check('correo desconocido no recibe código', sent.length === 0);

    // 2. Registro: código, intentos y un solo uso.
    const id = await startLogin({ email, name: 'Prueba', phone: '+50499999999', register: true, base });
    check('registro envía código', sent.length === 1);
    const { code } = last();
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i += 1) check(`intento malo ${i + 1} rechazado`, (await verifyLoginCode(id, wrong)) === '');
    const personId = await verifyLoginCode(id, code);
    peopleIds.push(personId);
    check('código correcto en el 5º intento entra', Boolean(personId));
    check('código no se reutiliza', (await verifyLoginCode(id, code)) === '');
    const phone = await sql`SELECT phone FROM valux_people WHERE id = ${personId}`;
    check('guarda WhatsApp', (phone[0] as { phone?: string }).phone === '+50499999999');

    // 3. Enlace: un solo uso.
    await startLogin({ email, register: false, base });
    const { token } = last();
    check('enlace entra', (await verifyLoginLink(token)) === personId);
    check('enlace no se reutiliza', (await verifyLoginLink(token)) === '');

    // 4. Quinto intento malo agota el código.
    const id2 = await startLogin({ email, register: false, base });
    const code2 = last().code;
    const wrong2 = code2 === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i += 1) await verifyLoginCode(id2, wrong2);
    check('tras 5 intentos malos el correcto ya no sirve', (await verifyLoginCode(id2, code2)) === '');

    // 5. Límite por hora: ya van 3 logins de este correo; el 6º no envía.
    await startLogin({ email, register: false, base });
    await startLogin({ email, register: false, base });
    const before = sent.length;
    await startLogin({ email, register: false, base });
    check('más de 5 por hora no envía', sent.length === before);

    // 6. Planes por nivel.
    const plans = await listPlans();
    check('hay 3 planes', plans.length === 3);
    await sql`INSERT INTO lms_courses (id, slug, title, price_cents, published, plan_level) VALUES (${courseIds[0]}, ${courseIds[0]}, 'A', 1000, true, 2)`;
    await sql`INSERT INTO lms_courses (id, slug, title, price_cents, published, plan_level) VALUES (${courseIds[1]}, ${courseIds[1]}, 'B', 500, true, 0)`;
    const courseA = { id: courseIds[0], price_cents: 1000, teacher_id: '' };
    const courseB = { id: courseIds[1], price_cents: 500, teacher_id: '' };
    check('sin plan no lee', !(await canReadCourse(personId, courseA)));
    await sql`
      INSERT INTO valux_subscriptions (id, person_id, status, current_period_end, plan_id, gateway_id)
      VALUES (${`${tag}-s`}, ${personId}, 'activa', now() + interval '1 month', 'esencial', ${`sub_${tag}`})
    `;
    check('plan nivel 1 no abre curso nivel 2', !(await canReadCourse(personId, courseA)));
    await sql`UPDATE valux_subscriptions SET plan_id = 'pro' WHERE id = ${`${tag}-s`}`;
    check('plan nivel 2 abre curso nivel 2', await canReadCourse(personId, courseA));
    check('curso fuera de membresía no se abre con plan', !(await canReadCourse(personId, courseB)));

    // 7. Reembolso de una compra con bump: las dos ventas y los dos accesos caen.
    await sql`UPDATE valux_subscriptions SET status = 'vencida' WHERE id = ${`${tag}-s`}`;
    for (const [suffix, courseId, cents] of [['', courseIds[0], 1000], [':bump', courseIds[1], 300]] as const) {
      await sql`
        INSERT INTO valux_sales (id, kind, buyer_id, course_id, amount_cents, fee_cents, seller_cents, paypal_order_id, period_ym)
        VALUES (${crypto.randomUUID()}, 'curso', ${personId}, ${courseId}, ${cents}, ${cents}, 0, ${`cs_${tag}${suffix}`}, '2026-11')
      `;
      await sql`INSERT INTO lms_enrollments (id, course_id, person_id) VALUES (${crypto.randomUUID()}, ${courseId}, ${personId})`;
    }
    check('comprado se lee', (await canReadCourse(personId, courseA)) && (await canReadCourse(personId, courseB)));
    const revoked = await revokeSales([`cs_${tag}`], 'reembolso');
    check('reembolso marca 2 ventas', revoked === 2);
    check('reembolso quita acceso al curso', !(await canReadCourse(personId, courseA)));
    check('reembolso quita acceso al bump', !(await canReadCourse(personId, courseB)));
    check('reembolso repetido no hace nada', (await revokeSales([`cs_${tag}`], 'reembolso')) === 0);

    // 8. Disputa de membresía: se corta ya.
    await sql`UPDATE valux_subscriptions SET status = 'activa' WHERE id = ${`${tag}-s`}`;
    await revokeSales([`sub_${tag}`], 'disputa');
    check('disputa corta la membresía', !(await canReadCourse(personId, courseA)));
  } finally {
    await sql`DELETE FROM lms_enrollments WHERE course_id = ANY(${courseIds})`;
    await sql`DELETE FROM valux_sales WHERE paypal_order_id LIKE ${`cs_${tag}%`}`;
    await sql`DELETE FROM valux_subscriptions WHERE id = ${`${tag}-s`}`;
    await sql`DELETE FROM lms_courses WHERE id = ANY(${courseIds})`;
    await sql`DELETE FROM academia_logins WHERE email LIKE ${`%${email}`}`;
    if (peopleIds.length) await sql`DELETE FROM valux_people WHERE id = ANY(${peopleIds})`;
    console.log('limpieza lista');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
