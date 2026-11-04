import { setApplicationStatus } from '@/lib/valux/actions';
import { listApplications } from '@/lib/valux/data';
import { PageTitle, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function FichasPage() {
  const applications = await listApplications();

  return (
    <div className="space-y-4">
      <PageTitle title="Fichas" />
      {applications.length === 0 ? <p className="text-sm text-black/50">Nadie ha enviado una ficha.</p> : applications.map((item) => (
        <article key={String(item.id)} className="space-y-3 border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{String(item.full_name)}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{String(item.status)}</p>
          </div>
          <p className="text-sm text-black/60">{String(item.email)} · {String(item.phone)} · {String(item.occupation)}</p>
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(item)
              .filter(([key]) => !['id', 'created_at', 'status', 'notes'].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/35">{key.replaceAll('_', ' ')}</dt>
                  <dd>{String(value || '—')}</dd>
                </div>
              ))}
          </dl>
          <form action={setApplicationStatus} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={String(item.id)} />
            <select className={fieldClass} name="status" defaultValue={String(item.status)}>
              <option value="nueva">Nueva</option>
              <option value="revision">En revisión</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
            <input className={fieldClass} name="notes" defaultValue={String(item.notes || '')} placeholder="Nota interna" />
            <button className={btnTiny} type="submit">Guardar</button>
          </form>
        </article>
      ))}
    </div>
  );
}
