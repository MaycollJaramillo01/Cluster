import { VStack } from '@astryxdesign/core/VStack';
import { academyMoney as money } from '@/lib/valux/money';
import { listClients } from '@/lib/valux/data';
import { Empty, PageTitle, Table, cell } from '@/components/dashboard/StaffUi';

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-5xl">
      <PageTitle eyebrow="Alumnos" title="Clientes" description="Personas que compraron algo en la academia, con su número de compras y el total pagado." />
      {clients.length === 0 ? <Empty title="Todavía no hay compras." /> : (
        <Table label="Clientes" head={['Cliente', 'Compras', 'Total']}>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className={cell}><p className="font-semibold">{client.name}</p><small className="break-all text-xs text-academy-muted">{client.email}</small></td>
              <td className={`${cell} tabular-nums`}>{client.purchases}</td>
              <td className={`${cell} whitespace-nowrap font-semibold tabular-nums`}>{money(client.spent)}</td>
            </tr>
          ))}
        </Table>
      )}
    </VStack>
  );
}
