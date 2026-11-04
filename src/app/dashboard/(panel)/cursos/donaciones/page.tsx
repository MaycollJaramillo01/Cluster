import { money, formatDate } from '@/lib/crm/format';
import { listDonations } from '@/lib/valux/data';
import { PageTitle } from '@/components/dashboard/ui';

export default async function DonacionesPage() {
  const donations = await listDonations();

  return (
    <div className="space-y-4">
      <PageTitle title="Donaciones" action={<span className="font-mono text-xs text-black/40">{money(donations.reduce((sum, item) => sum + item.total_cents, 0))}</span>} />
      {donations.length === 0 ? <p className="text-sm text-black/50">Todavía no hay donaciones. El formulario público está en /academia/apoyar.</p> : (
        <div className="overflow-x-auto border border-black/10 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                <th className="px-4 py-3 font-medium">Persona</th>
                <th className="px-4 py-3 font-medium">Mensual</th>
                <th className="px-4 py-3 font-medium">Meses</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item.id} className="border-b border-black/5">
                  <td className="px-4 py-3">{item.payer_name}<span className="ml-2 text-xs text-black/40">{item.payer_email}</span></td>
                  <td className="px-4 py-3">{money(item.monthly_cents)}</td>
                  <td className="px-4 py-3">{item.months}</td>
                  <td className="px-4 py-3">{money(item.total_cents)}</td>
                  <td className="px-4 py-3">{item.status}{item.paid_at ? ` · ${formatDate(item.paid_at)}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
