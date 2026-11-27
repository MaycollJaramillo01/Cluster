import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listDonations } from '@/lib/valux/data';
import { Empty, PageTitle, Pill, Stat, Table, capitalize, cell } from '@/components/dashboard/StaffUi';

export default async function DonacionesPage() {
  const donations = await listDonations();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Operación" title="Donaciones" description="Aportes de quienes apoyan la academia desde el formulario público." />
      {donations.length === 0 ? (
        <Empty title="Todavía no hay donaciones.">El formulario público está en <Link href="/academia/apoyar" className="font-semibold text-academy-primary underline underline-offset-4">/academia/apoyar</Link>.</Empty>
      ) : (
        <>
          <VStack className="sm:max-w-xs"><Stat label="Total registrado" value={money(donations.reduce((sum, item) => sum + item.total_cents, 0))} hint={`${donations.length} ${donations.length === 1 ? 'donación' : 'donaciones'}`} /></VStack>
          <Table label="Donaciones" head={['Persona', 'Mensual', 'Meses', 'Total', 'Estado']}>
            {donations.map((item) => (
              <tr key={item.id}>
                <td className={cell}><p className="font-semibold">{item.payer_name}</p><small className="break-all text-xs text-academy-muted">{item.payer_email}</small></td>
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{money(item.monthly_cents)}</td>
                <td className={`${cell} tabular-nums`}>{item.months}</td>
                <td className={`${cell} whitespace-nowrap font-semibold tabular-nums`}>{money(item.total_cents)}</td>
                <td className={cell}>
                  <Pill tone={item.paid_at ? 'ok' : 'wait'}>{capitalize(item.status)}</Pill>
                  {item.paid_at ? <small className="mt-1 block text-xs text-academy-muted">{formatDate(item.paid_at)}</small> : null}
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </VStack>
  );
}
