import { crm } from '@/lib/crm/db';
import { site } from '@/lib/site';
import { sendAcademiaMail } from './mail';
import { academyMoney } from './money';

// Correos de seguimiento de la academia. Corren en la tarea programada (cada 5 minutos) y cada uno
// se manda una sola vez por su llave en academia_followups.
// - abandono: empezó un pago hace entre 1 y 48 h y no compró. Solo con consentimiento de correo (es marketing).
// - recordatorio: compró un curso y lleva 7 días sin completar clases. Hasta 3, cada 14 días, salvo que lo apague en Perfil.
// - vence: la membresía no se renueva sola y vence en 3 días o menos.
// - cobro: Stripe no pudo cobrar la renovación (lo dispara el webhook).

const BATCH = 50;

function base() {
  return process.env.NODE_ENV === 'production' ? site.url : process.env.ACADEMIA_BASE_URL || 'http://localhost:3000';
}

// Reserva la llave antes de mandar: dos corridas simultáneas no duplican el correo.
async function claim(key: string, email: string, kind: string) {
  const sql = await crm();
  const rows = await sql`
    INSERT INTO academia_followups (key, email, kind) VALUES (${key}, ${email}, ${kind})
    ON CONFLICT (key) DO NOTHING RETURNING key
  `;
  return rows.length > 0;
}

export async function sendAbandonedCheckouts() {
  const sql = await crm();
  const rows = (await sql`
    SELECT DISTINCT ON (e.email) e.id, e.email, e.created_at, e.data, p.name
    FROM academia_events e
    JOIN valux_people p ON p.email = e.email AND p.consent_email
    WHERE e.name = 'checkout_started' AND e.email IS NOT NULL
      AND e.created_at BETWEEN now() - interval '48 hours' AND now() - interval '1 hour'
      AND NOT EXISTS (
        SELECT 1 FROM academia_events b
        WHERE b.email = e.email AND b.name = 'purchase_completed' AND b.created_at >= e.created_at
      )
      AND NOT EXISTS (
        SELECT 1 FROM academia_followups f
        WHERE f.email = e.email AND f.kind = 'abandono' AND f.sent_at > now() - interval '7 days'
      )
    ORDER BY e.email, e.created_at DESC
    LIMIT ${BATCH}
  `) as { id: string; email: string; data: string | null; name: string }[];
  let sent = 0;
  for (const row of rows) {
    let data: { kind?: string; item?: string } = {};
    try {
      data = JSON.parse(row.data || '{}');
    } catch {
      data = {};
    }
    let title = 'tu compra';
    let path = '/academia';
    if (data.kind === 'curso' && data.item) {
      const course = (await sql`SELECT slug, title FROM lms_courses WHERE id = ${data.item} AND published`)[0] as { slug?: string; title?: string } | undefined;
      if (!course?.slug) continue;
      title = course.title || title;
      path = `/academia/${course.slug}`;
    } else if (data.kind === 'suscripcion') {
      title = 'tu membresía';
      path = '/academia/suscripcion';
    } else {
      continue;
    }
    if (!(await claim(`abandono:${row.id}`, row.email, 'abandono'))) continue;
    await sendAcademiaMail(
      row.email,
      `Te quedó pendiente ${title}`,
      [
        `Hola${row.name ? ` ${row.name}` : ''},`,
        '',
        `Empezaste a pagar ${title} y el pago no se completó. Si tuviste un problema con la tarjeta o con la transferencia, puedes retomarlo aquí:`,
        `${base()}${path}`,
        '',
        'Si ya no te interesa, ignora este correo. Para no recibir más avisos como este, desmarca los correos en tu perfil de la academia.',
      ].join('\n'),
    );
    sent += 1;
  }
  return sent;
}

export async function sendStalledReminders() {
  const sql = await crm();
  const rows = (await sql`
    WITH enrolled AS (
      SELECT e.id, e.created_at, c.slug, c.title, p.email, p.name, p.id AS person_id, c.id AS course_id,
        (SELECT count(*) FROM lms_lessons l WHERE l.course_id = c.id) AS lessons,
        (SELECT count(*) FROM lms_progress g JOIN lms_lessons l ON l.id = g.lesson_id
          WHERE g.person_id = p.id AND l.course_id = c.id AND g.completed_at IS NOT NULL) AS done,
        (SELECT max(g.completed_at) FROM lms_progress g JOIN lms_lessons l ON l.id = g.lesson_id
          WHERE g.person_id = p.id AND l.course_id = c.id) AS last_done,
        (SELECT count(*) FROM academia_followups f WHERE f.key LIKE 'recordatorio:' || e.id || ':%') AS reminders,
        (SELECT max(f.sent_at) FROM academia_followups f WHERE f.key LIKE 'recordatorio:' || e.id || ':%') AS last_reminder
      FROM lms_enrollments e
      JOIN lms_courses c ON c.id = e.course_id AND c.published
      JOIN valux_people p ON p.id = e.person_id AND p.is_active AND NOT p.reminders_off
    )
    SELECT * FROM enrolled
    WHERE lessons > 0 AND done < lessons
      AND GREATEST(created_at, COALESCE(last_done, created_at)) < now() - interval '7 days'
      AND reminders < 3
      AND (last_reminder IS NULL OR last_reminder < now() - interval '14 days')
    LIMIT ${BATCH}
  `) as { id: string; slug: string; title: string; email: string; name: string; lessons: unknown; done: unknown; reminders: unknown }[];
  let sent = 0;
  for (const row of rows) {
    if (!(await claim(`recordatorio:${row.id}:${Number(row.reminders) + 1}`, row.email, 'recordatorio'))) continue;
    await sendAcademiaMail(
      row.email,
      `Sigue con ${row.title}`,
      [
        `Hola${row.name ? ` ${row.name}` : ''},`,
        '',
        `Llevas ${Number(row.done)} de ${Number(row.lessons)} clases de ${row.title}. La siguiente te espera aquí:`,
        `${base()}/academia/${row.slug}`,
        '',
        'Para no recibir estos recordatorios, apágalos en tu perfil de la academia.',
      ].join('\n'),
    );
    sent += 1;
  }
  return sent;
}

export async function sendExpiringMemberships() {
  const sql = await crm();
  const rows = (await sql`
    SELECT s.id, s.current_period_end, p.email, p.name, COALESCE(pl.name, 'tu membresía') AS plan
    FROM valux_subscriptions s
    JOIN valux_people p ON p.id = s.person_id
    LEFT JOIN valux_plans pl ON pl.id = s.plan_id
    WHERE (s.status = 'no_renueva' OR (s.status = 'activa' AND s.gateway_id IS NULL))
      AND s.current_period_end BETWEEN now() AND now() + interval '3 days'
    LIMIT ${BATCH}
  `) as { id: string; current_period_end: Date | string; email: string; name: string; plan: string }[];
  let sent = 0;
  for (const row of rows) {
    const end = new Date(row.current_period_end);
    const day = end.toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
    if (!(await claim(`vence:${row.id}:${day}`, row.email, 'vence'))) continue;
    const when = end.toLocaleDateString('es-HN', { day: 'numeric', month: 'long', timeZone: 'America/Tegucigalpa' });
    await sendAcademiaMail(
      row.email,
      `Tu membresía vence el ${when}`,
      [
        `Hola${row.name ? ` ${row.name}` : ''},`,
        '',
        `Tu acceso de ${row.plan} vence el ${when} y no se renueva solo. Para no perder los cursos incluidos, renuévala aquí:`,
        `${base()}/academia/suscripcion`,
        '',
        'Los cursos que compraste por separado siguen siendo tuyos.',
      ].join('\n'),
    );
    sent += 1;
  }
  return sent;
}

// Webhook invoice.payment_failed: un aviso por factura con el enlace de Stripe para pagar con otra tarjeta.
export async function sendPaymentFailed(input: { invoiceId: string; email: string; amountCents: number; payUrl: string }) {
  const email = input.email.trim().toLowerCase();
  if (!input.invoiceId || !email.includes('@')) return false;
  if (!(await claim(`cobro:${input.invoiceId}`, email, 'cobro'))) return false;
  await sendAcademiaMail(
    email,
    'No pudimos cobrar tu membresía',
    [
      'Hola,',
      '',
      `Stripe no pudo cobrar ${academyMoney(input.amountCents)} de tu membresía de la academia. Puede ser una tarjeta vencida o sin fondos.`,
      input.payUrl ? `Puedes pagar con otra tarjeta aquí: ${input.payUrl}` : `Revisa tu membresía aquí: ${base()}/academia/suscripcion`,
      '',
      'Stripe vuelve a intentar el cobro en los próximos días. Si no se cobra, la membresía se cierra.',
    ].join('\n'),
  );
  return true;
}

export async function runFollowups() {
  return {
    abandoned: await sendAbandonedCheckouts(),
    reminders: await sendStalledReminders(),
    expiring: await sendExpiringMemberships(),
  };
}
