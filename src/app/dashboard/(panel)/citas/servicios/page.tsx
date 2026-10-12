import { createService, deleteService } from '@/lib/crm/actions';
import { money } from '@/lib/crm/format';
import { listServices } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <div className="space-y-6">
      <PageTitle title="Servicios" />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form action={createService} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
          <Field label="Minutos"><input className={fieldClass} name="duration" type="number" min="15" step="15" defaultValue="30" /></Field>
          <Field label="Precio USD"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
          <button className={btn} type="submit">Crear servicio</button>
        </form>
        {services.length === 0 ? (
          <Empty title="Sin servicios">
            <p className="max-w-sm text-sm text-black/50">Un servicio es lo que la persona reserva: entrevista, visita o sesión de estudio.</p>
          </Empty>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <article key={service.id} className="flex items-center justify-between border border-black/10 bg-white px-4 py-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-black/45">{service.duration_min} min · {money(service.price_cents)}</p>
                </div>
                <form action={deleteService}>
                  <input type="hidden" name="id" value={service.id} />
                  <button className={btnTiny} type="submit">Quitar</button>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
