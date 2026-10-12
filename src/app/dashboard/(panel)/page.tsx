import Link from 'next/link';
import { formatDateTime, money } from '@/lib/crm/format';
import { overview } from '@/lib/crm/queries';
import { STAGES } from '@/lib/crm/types';
import { PageTitle, Panel, Rate, Stat } from '@/components/dashboard/ui';

const stageLabel = Object.fromEntries(STAGES.map((stage) => [stage.id, stage.label]));

export default async function OverviewPage() {
  const data = await overview();

  return (
    <div className="space-y-6">
      <PageTitle title="Hoy" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Contactos" value={String(data.contacts)} hint={`${data.last7} en los últimos 7 días`} />
        <Stat label="Citas del mes" value={String(data.bookings)} hint="Reservas en el mes en curso" />
        <Stat label="Campañas enviadas" value={String(data.campaigns)} hint={`${data.subscribers} suscriptores`} />
        <Stat label="Embudo abierto" value={money(data.pipeline)} hint={`Cobrado ${money(data.revenue)}`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel>
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <h2 className="font-display text-3xl tracking-wide">Campañas</h2>
            <Link href="/dashboard/mensajes/campanas" className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">
              Ver todas
            </Link>
          </div>
          <ul>
            {data.campaignsList.map((campaign) => (
              <li key={campaign.id} className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 last:border-0">
                <div>
                  <Link href={`/dashboard/mensajes/campanas/${campaign.id}`} className="font-medium hover:text-brand">
                    {campaign.name}
                  </Link>
                  <p className="mt-1 text-xs text-black/45">
                    {campaign.status === 'enviada' ? formatDateTime(campaign.sent_at || campaign.created_at) : 'Borrador'} · {campaign.audience} personas
                  </p>
                </div>
                <Rate value={campaign.opened_rate} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="border-b border-black/10 px-5 py-4">
            <h2 className="font-display text-3xl tracking-wide">Agenda</h2>
          </div>
          <ul>
            {data.bookingsList.length === 0 ? <li className="px-5 py-8 text-sm text-black/50">No hay citas.</li> : null}
            {data.bookingsList.map((booking) => (
              <li key={booking.id} className="border-b border-black/5 px-5 py-4 last:border-0">
                <p className="font-medium">{booking.title}</p>
                <p className="mt-1 text-xs text-black/45">
                  {formatDateTime(booking.starts_at)} · {booking.operator_name || 'Sin operador'} · {booking.status}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel className="p-5">
          <h2 className="font-display text-3xl tracking-wide">Embudo</h2>
          <ul className="mt-4 space-y-3">
            {STAGES.map((stage) => {
              const found = data.stages.find((item) => item.stage === stage.id);
              return (
                <li key={stage.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{stageLabel[stage.id]}</span>
                  <span className="font-mono text-xs text-black/50">
                    {found?.count || 0} · {money(found?.value || 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel>
          <div className="border-b border-black/10 px-5 py-4">
            <h2 className="font-display text-3xl tracking-wide">Formularios</h2>
          </div>
          <ul>
            {data.submits.map((submit) => (
              <li key={submit.id} className="border-b border-black/5 px-5 py-4 last:border-0">
                <p className="font-medium">{submit.name}</p>
                <p className="mt-1 text-xs text-black/45">
                  {submit.form_name} · {formatDateTime(submit.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
