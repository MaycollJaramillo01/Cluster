import { createCircle } from '@/lib/crm/actions';
import { money } from '@/lib/crm/format';
import { listCircles } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function CirclesPage() {
  const circles = await listCircles();

  return (
    <div className="space-y-6">
      <PageTitle title="Círculos" action={<span className="font-mono text-xs text-black/40">{circles.length}</span>} />
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form action={createCircle} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
          <Field label="Ruta"><input className={fieldClass} name="slug" placeholder="diseno-web" /></Field>
          <Field label="Descripción"><textarea className={fieldClass} name="description" rows={3} /></Field>
          <Field label="Precio USD"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
          <button className={btn} type="submit">Crear círculo</button>
        </form>
        {circles.length === 0 ? (
          <Empty title="Aún no hay círculos">
            <p className="max-w-sm text-sm text-black/50">El primero puede ser un curso, el estudio o el grupo de clientes.</p>
          </Empty>
        ) : (
          <div className="space-y-3">
            {circles.map((circle) => (
              <article key={circle.id} className="border border-black/10 bg-white p-4">
                <p className="font-medium">{circle.name}</p>
                <p className="mt-1 text-sm text-black/55">{circle.description}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-black/40">
                  /{circle.slug} · {circle.members} miembros · {money(circle.price_cents)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
