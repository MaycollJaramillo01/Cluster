import { listCourses } from '@/lib/crm/lms';
import { academyAnalytics } from '@/lib/valux/analytics';
import { STAGES } from '@/lib/valux/events';
import { academyMoney as money } from '@/lib/valux/money';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

function localDay(date: Date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
}

function validDay(value: string | undefined, fallback: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

const pct = (value: number | null) => (value == null ? '—' : `${Math.round(value * 100)}%`);

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      {note ? <p className="text-xs text-black/45">{note}</p> : null}
    </div>
  );
}

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
    <div className="space-y-6">
      <PageTitle title="Analítica" />
      <form className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <Field label="Desde"><input className={fieldClass} name="desde" type="date" defaultValue={filter.from} /></Field>
        <Field label="Hasta"><input className={fieldClass} name="hasta" type="date" defaultValue={filter.to} /></Field>
        <Field label="Curso">
          <select className={fieldClass} name="curso" defaultValue={filter.courseId}>
            <option value="">Todos</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </Field>
        <button className={btn} type="submit">Filtrar</button>
      </form>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ingresos" value={money(data.revenue)} note={`${money(data.fees)} de comisión`} />
        <Stat label="Pedidos" value={String(data.orders)} note={`${data.sales} ventas con bumps`} />
        <Stat label="Ticket promedio" value={money(data.aov)} />
        <Stat label="Reembolsos" value={String(data.refunds.count)} note={money(data.refunds.cents)} />
        <Stat label="Conversión checkout" value={pct(data.conversion)} note={`${data.purchases} de ${data.checkouts} checkouts`} />
        <Stat label="Bumps aceptados" value={String(data.bumps)} />
        <Stat label="Alumnos activos" value={String(data.activeStudents)} note="completaron una clase en el rango" />
        <Stat label="Finalización" value={pct(data.completion)} note={`${data.finished} de ${data.started} que empezaron`} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 border border-black/10 bg-white p-4">
          <h2 className="font-medium">Membresías vigentes · MRR {money(data.mrr)}</h2>
          <p className="text-xs text-black/45">{data.newSubscriptions} nuevas en el rango. El MRR usa el precio actual de cada plan.</p>
          {data.plans.length === 0 ? <p className="text-sm text-black/50">Sin membresías vigentes.</p> : (
            <ul className="text-sm">
              {data.plans.map((row) => (
                <li key={row.plan} className="flex justify-between border-b border-black/5 py-1">
                  <span>{row.plan}</span><span className="font-mono">{row.active} · {money(row.mrr)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 border border-black/10 bg-white p-4">
          <h2 className="font-medium">Leads nuevos · {data.leads}</h2>
          <p className="text-xs text-black/45">Etapa actual de las personas registradas en el rango, y de dónde llegaron.</p>
          <ul className="flex flex-wrap gap-2 text-xs">
            {STAGES.map((stage) => (
              <li key={stage} className="border border-black/10 px-2 py-1">
                {stage} {data.stages.find((row) => row.stage === stage)?.count || 0}
              </li>
            ))}
          </ul>
          <ul className="text-sm">
            {data.sources.map((row) => (
              <li key={row.source} className="flex justify-between border-b border-black/5 py-1">
                <span className="truncate">{row.source}</span><span className="font-mono">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
