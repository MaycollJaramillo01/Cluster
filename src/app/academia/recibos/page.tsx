import Link from 'next/link';
import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AccountNav } from '@/components/academia/AccountNav';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listReceipts } from '@/lib/valux/receipts';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mis recibos · Academia Cluster', robots: { index: false, follow: false } };

export default async function ReceiptsPage() {
  const personId = await academiaPersonId();
  if (!personId) {
    return (
      <main className="academy-page max-w-xl">
        <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8">
          <Heading level={1} className="text-2xl font-bold">Entra para ver tus recibos</Heading>
          <p className="text-academy-muted">Usa el correo con el que hiciste la compra.</p>
          <Link href="/academia/entrar" className="academy-action academy-action-primary">Entrar <Icon name="arrow-right" size={16} /></Link>
        </VStack>
      </main>
    );
  }
  const receipts = await listReceipts(personId);
  const cell = 'px-5 py-4 align-middle';

  return (
    <main className="academy-page grid max-w-6xl items-start gap-6 lg:grid-cols-[theme(spacing.60)_1fr]">
      <VStack gap={4} className="min-w-0 lg:sticky lg:top-24">
        <AccountNav current="/academia/recibos" />
      </VStack>
      <VStack gap={6} className="min-w-0">
        <VStack as="header" gap={2}>
          <Heading level={1} className="academy-title">Mis recibos</Heading>
          <p className="text-academy-muted">Comprobantes de tus pagos en la Academia. Solo tú puedes verlos.</p>
        </VStack>
        {receipts.length === 0 ? (
          <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8">
            <Heading level={2} className="text-xl font-bold">Todavía no tienes pagos registrados</Heading>
            <p className="text-academy-muted">Cuando compres un curso o una membresía, el recibo aparecerá aquí.</p>
            <Link href="/academia" className="academy-action academy-action-secondary">Ver cursos</Link>
          </VStack>
        ) : (
          <section className="academy-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Pagos registrados, del más reciente al más antiguo</caption>
              <thead className="hidden border-b border-academy-line bg-academy-page text-xs font-semibold uppercase tracking-wide text-academy-muted md:table-header-group">
                <tr>
                  <th scope="col" className={cell}>Concepto</th>
                  <th scope="col" className={cell}>Fecha</th>
                  <th scope="col" className={cell}>N.º</th>
                  <th scope="col" className={`${cell} text-right`}>Monto</th>
                  <th scope="col" className={cell}><em className="sr-only not-italic">Recibo</em></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-academy-line">
                {receipts.map((item) => (
                  <tr key={item.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 p-5 md:table-row md:p-0">
                    <td className="min-w-0 md:px-5 md:py-4">
                      <strong className="block break-words font-semibold">{item.concept}</strong>
                      <small className="text-sm text-academy-muted">{item.method}<em className="not-italic md:hidden"> · {formatDate(item.created_at)} · N.º {item.number}</em></small>
                    </td>
                    <td className={`${cell} hidden whitespace-nowrap text-academy-muted md:table-cell`}>{formatDate(item.created_at)}</td>
                    <td className={`${cell} hidden font-mono md:table-cell`}>{item.number}</td>
                    <td className="row-span-2 text-right md:px-5 md:py-4">
                      <strong className={`block whitespace-nowrap tabular-nums ${item.refunded_at ? 'text-academy-muted line-through' : 'font-semibold'}`}>{money(item.amount_cents)}</strong>
                      {item.refunded_at ? <small className="text-xs font-semibold text-academy-muted">Reembolsado</small> : null}
                    </td>
                    <td className="md:px-5 md:py-4 md:text-right">
                      <Link href={`/academia/recibos/${item.id}`} className="academy-focus inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-academy font-semibold text-academy-primary underline-offset-4 hover:underline">Ver recibo <Icon name="arrow-right" size={16} /><em className="sr-only not-italic"> de {item.concept}</em></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </VStack>
    </main>
  );
}
