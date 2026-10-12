import Link from 'next/link';
import { cancelBooking, createBooking } from '@/lib/crm/actions';
import { dayKey, formatTime, monthLabel } from '@/lib/crm/format';
import { listBookingEvents, listBookings, listContacts, listOperators } from '@/lib/crm/queries';
import { Field, PageTitle, btn, btnGhost, btnTiny, fieldClass } from '@/components/dashboard/ui';

function monthOf(value?: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || '');
  if (match) return { year: Number(match[1]), month: Number(match[2]) };
  const [year, month] = dayKey(new Date()).split('-');
  return { year: Number(year), month: Number(month) };
}

function shift(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function cells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const pad = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const items: Array<number | null> = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= days; day += 1) items.push(day);
  while (items.length % 7) items.push(null);
  return items;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const current = monthOf(params.month);
  const key = `${current.year}-${String(current.month).padStart(2, '0')}`;
  const today = dayKey(new Date());
  const selected = params.day && params.day.startsWith(key) ? params.day : today.startsWith(key) ? today : `${key}-01`;
  const [bookings, events, operators, contacts] = await Promise.all([
    listBookings(current),
    listBookingEvents(),
    listOperators(),
    listContacts({}),
  ]);
  const byDay = new Map<string, typeof bookings>();
  for (const booking of bookings) {
    const day = dayKey(booking.starts_at);
    byDay.set(day, [...(byDay.get(day) || []), booking]);
  }
  const visible = byDay.get(selected) || [];

  return (
    <div className="space-y-6">
      <PageTitle title="Agenda" />
      <div className="flex flex-wrap items-center gap-2">
        <Link className={btnGhost} href={`/dashboard/citas/agenda?month=${shift(current.year, current.month, -1)}`}>Anterior</Link>
        <Link className={btnGhost} href={`/dashboard/citas/agenda?month=${shift(current.year, current.month, 1)}`}>Siguiente</Link>
        <p className="px-2 font-display text-3xl capitalize tracking-wide">{monthLabel(current.year, current.month)}</p>
      </div>
      <div className="border border-black/10 bg-white">
        <div className="grid grid-cols-7 border-b border-black/10 font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="px-2 py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells(current.year, current.month).map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="min-h-20 border-b border-r border-black/5 bg-black/[0.015]" />;
            const date = `${key}-${String(day).padStart(2, '0')}`;
            const marked = byDay.has(date);
            const active = date === selected;
            return (
              <Link
                key={date}
                href={`/dashboard/citas/agenda?month=${key}&day=${date}`}
                className={`min-h-20 border-b border-r border-black/5 p-2 ${active ? 'bg-brand/15' : 'hover:bg-black/[0.02]'}`}
              >
                <span className={`inline-flex h-7 w-7 items-center justify-center text-sm ${date === today ? 'bg-brand text-ink' : ''}`}>{day}</span>
                {marked ? <span className="mt-2 block h-1 w-6 bg-brand" /> : null}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-2">
          {visible.length === 0 ? <p className="text-sm text-black/50">No hay citas este día.</p> : null}
          {visible.map((booking) => (
            <article key={booking.id} className="flex items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
              <div>
                <p className="font-medium">{booking.title}</p>
                <p className="text-xs text-black/45">
                  {formatTime(booking.starts_at)} · {booking.event_name || 'Sin evento'} · {booking.operator_name || 'Sin operador'} · {booking.status}
                </p>
              </div>
              {booking.status !== 'cancelada' ? (
                <form action={cancelBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button className={btnTiny} type="submit">Cancelar</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
        <form action={createBooking} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Título"><input className={fieldClass} name="title" required /></Field>
          <Field label="Día"><input className={fieldClass} name="date" type="date" defaultValue={selected} required /></Field>
          <Field label="Hora"><input className={fieldClass} name="time" type="time" defaultValue="10:00" required /></Field>
          <Field label="Evento">
            <select className={fieldClass} name="event_id">
              <option value="">Sin evento</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
          </Field>
          <Field label="Operador">
            <select className={fieldClass} name="operator_id">
              <option value="">Sin operador</option>
              {operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
            </select>
          </Field>
          <Field label="Contacto">
            <select className={fieldClass} name="contact_id">
              <option value="">Sin contacto</option>
              {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
            </select>
          </Field>
          <button className={btn} type="submit">Agendar</button>
        </form>
      </div>
    </div>
  );
}
