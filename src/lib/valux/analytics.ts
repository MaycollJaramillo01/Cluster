import { crm } from '@/lib/crm/db';

export type AnalyticsFilter = { from: string; to: string; courseId: string };

const n = (value: unknown) => Number(value) || 0;

// KPIs del documento maestro, en el rango [from, to] (fechas de Honduras) y opcionalmente para un curso.
export async function academyAnalytics(filter: AnalyticsFilter) {
  const sql = await crm();
  const from = `${filter.from}T00:00:00-06:00`;
  const to = `${filter.to}T23:59:59.999-06:00`;
  const course = filter.courseId;

  const [sales] = (await sql`
    SELECT count(*) AS sales,
      count(DISTINCT COALESCE(split_part(paypal_order_id, ':', 1), id)) AS orders,
      COALESCE(sum(amount_cents), 0) AS revenue,
      COALESCE(sum(fee_cents), 0) AS fees
    FROM valux_sales
    WHERE created_at BETWEEN ${from} AND ${to} AND refunded_at IS NULL
      AND (${course} = '' OR course_id = ${course})
  `) as Record<string, unknown>[];

  const [refunds] = (await sql`
    SELECT count(*) AS count, COALESCE(sum(amount_cents), 0) AS cents
    FROM valux_sales
    WHERE refunded_at BETWEEN ${from} AND ${to} AND (${course} = '' OR course_id = ${course})
  `) as Record<string, unknown>[];

  const [funnel] = (await sql`
    SELECT count(*) FILTER (WHERE name = 'checkout_started') AS checkouts,
      count(*) FILTER (WHERE name = 'purchase_completed') AS purchases,
      count(*) FILTER (WHERE name = 'bump_accepted') AS bumps,
      count(*) FILTER (WHERE name = 'lead_created') AS leads
    FROM academia_events
    WHERE created_at BETWEEN ${from} AND ${to}
      AND (${course} = '' OR name = 'lead_created' OR (data::jsonb ->> 'item') = ${course})
  `) as Record<string, unknown>[];

  // Alumnos activos: completaron al menos una clase en el rango.
  const [learning] = (await sql`
    SELECT count(DISTINCT p.person_id) AS active
    FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
    WHERE p.person_id IS NOT NULL AND p.completed_at BETWEEN ${from} AND ${to}
      AND (${course} = '' OR l.course_id = ${course})
  `) as Record<string, unknown>[];

  // Finalización: de quienes empezaron un curso (1+ clase), cuántos lo terminaron entero.
  const [completion] = (await sql`
    WITH totals AS (
      SELECT course_id, count(*) AS lessons FROM lms_lessons GROUP BY course_id
    ), per AS (
      SELECT p.person_id, l.course_id, count(*) AS done
      FROM lms_progress p JOIN lms_lessons l ON l.id = p.lesson_id
      WHERE p.person_id IS NOT NULL AND p.completed_at IS NOT NULL
        AND (${course} = '' OR l.course_id = ${course})
      GROUP BY p.person_id, l.course_id
    )
    SELECT count(*) AS started, count(*) FILTER (WHERE per.done >= totals.lessons) AS finished
    FROM per JOIN totals ON totals.course_id = per.course_id
  `) as Record<string, unknown>[];

  const plans = (await sql`
    SELECT COALESCE(pl.name, 'Sin plan') AS plan, count(*) AS active, COALESCE(sum(pl.price_cents), 0) AS mrr
    FROM valux_subscriptions s LEFT JOIN valux_plans pl ON pl.id = s.plan_id
    WHERE s.status IN ('activa', 'no_renueva') AND s.current_period_end > now()
    GROUP BY pl.name, pl.level ORDER BY pl.level NULLS LAST
  `) as Record<string, unknown>[];

  const [subs] = (await sql`
    SELECT count(*) AS started FROM valux_subscriptions WHERE created_at BETWEEN ${from} AND ${to}
  `) as Record<string, unknown>[];

  const stages = (await sql`
    SELECT stage, count(*) AS count FROM valux_people WHERE created_at BETWEEN ${from} AND ${to} GROUP BY stage
  `) as Record<string, unknown>[];

  const sources = (await sql`
    SELECT COALESCE(source, 'sin fuente') AS source, count(*) AS count
    FROM valux_people WHERE created_at BETWEEN ${from} AND ${to}
    GROUP BY 1 ORDER BY 2 DESC LIMIT 8
  `) as Record<string, unknown>[];

  const orders = n(sales?.orders);
  const revenue = n(sales?.revenue);
  const checkouts = n(funnel?.checkouts);
  const started = n(completion?.started);
  return {
    revenue,
    fees: n(sales?.fees),
    sales: n(sales?.sales),
    orders,
    aov: orders ? Math.round(revenue / orders) : 0,
    refunds: { count: n(refunds?.count), cents: n(refunds?.cents) },
    checkouts,
    purchases: n(funnel?.purchases),
    bumps: n(funnel?.bumps),
    leads: n(funnel?.leads),
    conversion: checkouts ? n(funnel?.purchases) / checkouts : null,
    activeStudents: n(learning?.active),
    started,
    finished: n(completion?.finished),
    completion: started ? n(completion?.finished) / started : null,
    plans: plans.map((row) => ({ plan: String(row.plan), active: n(row.active), mrr: n(row.mrr) })),
    mrr: plans.reduce((sum, row) => sum + n(row.mrr), 0),
    newSubscriptions: n(subs?.started),
    stages: stages.map((row) => ({ stage: String(row.stage), count: n(row.count) })),
    sources: sources.map((row) => ({ source: String(row.source), count: n(row.count) })),
  };
}
