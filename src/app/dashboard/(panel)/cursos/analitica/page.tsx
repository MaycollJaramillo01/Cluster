import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { listCourses } from '@/lib/crm/lms';
import { academyAnalytics } from '@/lib/valux/analytics';
import { STAGES } from '@/lib/valux/events';
import { academyMoney as money } from '@/lib/valux/money';
import { Field, PageTitle, SectionTitle, Stat, btnGhost, capitalize, fieldClass, periodLabel } from '@/components/dashboard/StaffUi';

export const dynamic = 'force-dynamic';

function localDay(date: Date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
}

function validDay(value: string | undefined, fallback: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

const pct = (value: number | null) => (value == null ? '—' : `${Math.round(value * 100)}%`);
const row = 'flex items-center justify-between gap-3 py-2 text-sm';

export default async function AnaliticaPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string; curso?: string }> }) {
  const query = await searchParams;
  const today = localDay(new Date());
  const filter = {
    from: validDay(query.desde, localDay(new Date(Date.now() - 29 * 86400000))),
    to: validDay(query.hasta, today),
    courseId: String(query.curso || ''),
  };
  const [data, courses] = await Promise.all([academyAnalytics(filter), listCourses()]);

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Operación" title="Analítica" description="Ventas, aprendizaje y membresías en el rango que elijas. Por defecto, los últimos 30 días." />
      <form className="academy-panel grid items-end gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[theme(spacing.44)_theme(spacing.44)_minmax(0,1fr)_auto]">
        <Field label="Desde"><input className={fieldClass} name="desde" type="date" defaultValue={filter.from} /></Field>
        <Field label="Hasta"><input className={fieldClass} name="hasta" type="date" defaultValue={filter.to} /></Field>
        <Field label="Curso">
          <select className={fieldClass} name="curso" defaultValue={filter.courseId}>
            <option value="">Todos</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </Field>
        <button className={btnGhost} type="submit">Filtrar</button>
      </form>

      <VStack as="section" gap={4} aria-labelledby="ventas-cifras">
        <SectionTitle id="ventas-cifras" title="Ventas" />
        <Grid columns={{ minWidth: 200, max: 4 }} gap={4}>
          <Stat label="Ingresos" value={money(data.revenue)} hint={`${money(data.fees)} de comisión`} />
          <Stat label="Pedidos" value={data.orders} hint={`${data.sales} ventas con bumps`} />
          <Stat label="Ticket promedio" value={money(data.aov)} />
          <Stat label="Reembolsos" value={data.refunds.count} hint={money(data.refunds.cents)} />
          <Stat label="Conversión del checkout" value={pct(data.conversion)} hint={`${data.purchases} de ${data.checkouts} checkouts`} />
          <Stat label="Bumps aceptados" value={data.bumps} />
        </Grid>
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="aprendizaje-cifras">
        <SectionTitle id="aprendizaje-cifras" title="Aprendizaje" />
        <Grid columns={{ minWidth: 200, max: 3 }} gap={4}>
          <Stat label="Alumnos activos" value={data.activeStudents} hint="Completaron una clase en el rango" />
          <Stat label="Finalización" value={pct(data.completion)} hint={`${data.finished} de ${data.started} que empezaron`} />
          <Stat label="Activación en 24 horas" value={pct(data.activation)} hint={`${data.activationActive} de ${data.activationBuyers} compras con una clase en 24 h`} />
        </Grid>
      </VStack>

      <Grid columns={{ minWidth: 300, max: 2 }} gap={4}>
        <VStack as="section" gap={4} aria-labelledby="membresias" className="academy-panel p-5 sm:p-6">
          <VStack gap={1}>
            <Heading id="membresias" level={2} className="text-xl font-bold">Membresías vigentes</Heading>
            <p className="font-academy-heading text-3xl font-bold tabular-nums">{money(data.mrr)} <small className="text-sm font-semibold text-academy-muted">al mes</small></p>
            <p className="text-sm text-academy-muted">{data.newSubscriptions} nuevas en el rango. El ingreso mensual usa el precio actual de cada plan.</p>
          </VStack>
          {data.plans.length === 0 ? <p className="text-sm text-academy-muted">Sin membresías vigentes.</p> : (
            <ul className="divide-y divide-academy-line border-y border-academy-line" aria-label="Membresías por plan">
              {data.plans.map((item) => (
                <li key={item.plan} className={row}><p>{item.plan}</p><p className="tabular-nums">{item.active} · {money(item.mrr)}</p></li>
              ))}
            </ul>
          )}
          <VStack gap={2}>
            <Heading level={3} className="text-sm font-bold">Retención mensual</Heading>
            <p className="text-xs text-academy-muted">De quienes tenían membresía al empezar el mes, cuántos la siguen al empezar el siguiente.</p>
            <ul className="divide-y divide-academy-line border-y border-academy-line">
              {data.retention.map((item) => (
                <li key={item.month} className={row}><p>{periodLabel(item.month)}</p><p className="tabular-nums">{item.kept} de {item.members} · {pct(item.rate)}</p></li>
              ))}
            </ul>
          </VStack>
        </VStack>

        <VStack as="section" gap={4} aria-labelledby="leads" className="academy-panel p-5 sm:p-6">
          <VStack gap={1}>
            <Heading id="leads" level={2} className="text-xl font-bold">Leads nuevos</Heading>
            <p className="font-academy-heading text-3xl font-bold tabular-nums">{data.leads}</p>
            <p className="text-sm text-academy-muted">Etapa actual de las personas registradas en el rango, y de dónde llegaron.</p>
          </VStack>
          <HStack as="ul" gap={2} wrap="wrap" aria-label="Leads por etapa">
            {STAGES.map((stage) => (
              <li key={stage} className="rounded-academy-full border border-academy-line px-3 py-1 text-sm">
                {capitalize(stage)} <strong className="tabular-nums">{data.stages.find((item) => item.stage === stage)?.count || 0}</strong>
              </li>
            ))}
          </HStack>
          {data.sources.length ? (
            <ul className="divide-y divide-academy-line border-y border-academy-line" aria-label="Leads por origen">
              {data.sources.map((item) => (
                <li key={item.source} className={row}><p className="min-w-0 truncate">{item.source}</p><p className="tabular-nums">{item.count}</p></li>
              ))}
            </ul>
          ) : null}
        </VStack>
      </Grid>
    </VStack>
  );
}
