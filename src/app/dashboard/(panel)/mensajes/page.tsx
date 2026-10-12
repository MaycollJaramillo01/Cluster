import Link from 'next/link';
import { formatDate, rate } from '@/lib/crm/format';
import { listCampaigns, subscriberCount } from '@/lib/crm/queries';
import { PageTitle, Panel, Rate, btn } from '@/components/dashboard/ui';

export default async function MessagingHome() {
  const [campaigns, subscribers] = await Promise.all([listCampaigns(), subscriberCount()]);
  const sent = campaigns.filter((campaign) => campaign.status === 'enviada').slice(0, 5);

  return (
    <div className="space-y-6">
      <PageTitle title="Campañas" action={<Link className={btn} href="/dashboard/mensajes/campanas">Crear campaña</Link>} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <Panel>
          <div className="border-b border-black/10 px-5 py-4">
            <h2 className="font-display text-3xl tracking-wide">Últimos envíos</h2>
          </div>
          {sent.length === 0 ? <p className="px-5 py-8 text-sm text-black/50">Todavía no hay campañas enviadas.</p> : (
            <ul>
              {sent.map((campaign) => (
                <li key={campaign.id} className="grid grid-cols-[minmax(0,1fr)_80px_90px] items-center gap-3 border-b border-black/5 px-5 py-4 last:border-0">
                  <div>
                    <Link href={`/dashboard/mensajes/campanas/${campaign.id}`} className="font-medium hover:text-brand">{campaign.name}</Link>
                    <p className="text-xs text-black/40">{campaign.sent_at ? formatDate(campaign.sent_at) : ''}</p>
                  </div>
                  <span className="text-sm text-black/60">{campaign.audience}</span>
                  <Rate value={campaign.opened_rate} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Suscriptores</p>
          <p className="mt-2 font-display text-6xl leading-none">{subscribers}</p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Apertura media</p>
          <p className="mt-2 text-2xl">{sent.length ? rate(sent.reduce((sum, item) => sum + item.opened_rate, 0) / sent.length) : '0.0%'}</p>
          <Link href="/dashboard/mensajes/suscriptores" className={`${btn} mt-6`}>Ver listas</Link>
        </Panel>
      </div>
    </div>
  );
}
