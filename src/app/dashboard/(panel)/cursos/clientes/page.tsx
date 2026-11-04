import { money } from '@/lib/crm/format';
import { listClients } from '@/lib/valux/data';
import { PageTitle } from '@/components/dashboard/ui';

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div className="space-y-4">
      <PageTitle title="Clientes" />
      {clients.length === 0 ? <p className="text-sm text-black/50">Todavía no hay compras.</p> : (
        <div className="overflow-x-auto border border-black/10 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Compras</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-black/5">
                  <td className="px-4 py-3">{client.name}<span className="ml-2 text-xs text-black/40">{client.email}</span></td>
                  <td className="px-4 py-3">{client.purchases}</td>
                  <td className="px-4 py-3">{money(client.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
