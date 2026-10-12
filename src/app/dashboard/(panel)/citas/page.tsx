import { createEvent, deleteEvent } from '@/lib/crm/actions';
import { listBookingEvents } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function EventsPage() {
  const events = await listBookingEvents();

  return (
    <div className="space-y-6">
      <PageTitle title="Eventos" action={<form action={createEvent} className="flex flex-wrap items-center gap-2"><input className={`${fieldClass} w-64`} name="name" placeholder="Nombre del evento" required /><button className={btn} type="submit">Crear evento</button></form>} />
      {events.length === 0 ? <Empty title="Sin eventos" /> : (
        <div className="border border-black/10 bg-white">
          <div className="grid grid-cols-[1fr_120px_auto] border-b border-black/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">
            <span>Evento</span>
            <span>Duración</span>
            <span />
          </div>
          {events.map((event) => (
            <article key={event.id} className="grid items-center gap-3 border-b border-black/5 px-5 py-4 last:border-0 md:grid-cols-[1fr_120px_auto]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center bg-brand/15 font-mono text-xs">CIT</span>
                <div>
                  <p className="font-medium text-brand">{event.name}</p>
                  {event.description ? <p className="text-xs text-black/45">{event.description}</p> : null}
                </div>
              </div>
              <p className="text-sm text-black/50">{event.duration_min ? `${event.duration_min} min` : '—'}</p>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <button className={btnTiny} type="submit">Eliminar</button>
              </form>
            </article>
          ))}
        </div>
      )}
      <form action={createEvent} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-3">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Duración en minutos"><input className={fieldClass} name="duration" type="number" min="15" step="15" /></Field>
        <Field label="Descripción"><input className={fieldClass} name="description" /></Field>
        <button className={btn} type="submit">Guardar evento</button>
      </form>
    </div>
  );
}
