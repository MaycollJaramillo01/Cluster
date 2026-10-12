import Link from 'next/link';
import { money } from '@/lib/crm/format';
import { communityStats } from '@/lib/crm/queries';
import { PageTitle, Stat } from '@/components/dashboard/ui';

export default async function CommunityPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const params = await searchParams;
  const days = params.dias === '30' ? 30 : 7;
  const stats = await communityStats(days);

  return (
    <div className="space-y-6">
      <PageTitle title="Círculos" />
      <div className="flex gap-2">
        <Link href="/dashboard/comunidad/panel?dias=7" className={`px-3 py-2 text-sm ${days === 7 ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>7 días</Link>
        <Link href="/dashboard/comunidad/panel?dias=30" className={`px-3 py-2 text-sm ${days === 30 ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>30 días</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Miembros nuevos" value={String(stats.enrolled)} />
        <Stat label="Pedidos" value={String(stats.orders)} />
        <Stat label="Ingresos" value={money(stats.revenue)} />
        <Stat label="Completaron" value={String(stats.completed)} />
        <Stat label="ARPU" value={money(stats.arpu)} hint="Ingreso por miembro de pago" />
        <Stat label="Miembros de pago" value={String(stats.paying)} />
      </div>
    </div>
  );
}
