import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { PrintCertificate } from '@/components/academia/CertificateTools';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { site } from '@/lib/site';
import { academyMoney as money, CURRENCY } from '@/lib/valux/money';
import { listReceipts } from '@/lib/valux/receipts';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Recibo de pago · Academia Cluster', robots: { index: false, follow: false }, referrer: 'no-referrer' };

// Comprobante imprimible. Solo lo ve quien compró: la consulta filtra por la persona de la sesión.
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const [receipt] = await listReceipts(personId, id);
  if (!receipt) notFound();
  const rows = [
    ['Cliente', receipt.buyer_name],
    ['Correo', receipt.buyer_email],
    ['Concepto', receipt.concept],
    ['Método de pago', receipt.method],
    ['Moneda', CURRENCY],
  ];

  return (
    <main className="academy-page max-w-3xl space-y-5 print:max-w-none print:space-y-0 print:p-0">
      <HStack as="header" justify="between" align="center" gap={3} wrap="wrap" className="print:hidden">
        <Link href="/academia/recibos" className="academy-nav academy-focus"><Icon name="arrow-right" size={16} className="rotate-180" />Mis recibos</Link>
        <PrintCertificate />
      </HStack>
      <article aria-labelledby="recibo-titulo" className="academy-panel overflow-hidden print:rounded-none print:border-0 print:shadow-none">
        <HStack as="header" justify="between" align="start" gap={4} wrap="wrap" className="border-b border-academy-line p-6 sm:p-8">
          <VStack gap={2}>
            <p className="font-academy-heading text-sm font-bold uppercase tracking-widest">{site.name} · Academia</p>
            <Heading level={1} id="recibo-titulo" className="text-3xl font-bold">Recibo de pago</Heading>
          </VStack>
          <VStack gap={1} className="text-sm sm:text-right">
            <p className="font-mono font-semibold">N.º {receipt.number}</p>
            <p className="text-academy-muted">{formatDate(receipt.created_at)}</p>
            <strong className={`mt-1 w-fit rounded-academy-full px-3 py-1 text-xs font-semibold sm:self-end print:border print:border-academy-line ${receipt.refunded_at ? 'bg-academy-page text-academy-muted' : 'bg-academy-tint text-academy-primary'}`}>{receipt.refunded_at ? 'Reembolsado' : 'Pagado'}</strong>
          </VStack>
        </HStack>
        <dl className="divide-y divide-academy-line px-6 text-sm sm:px-8">
          {rows.map(([label, value]) => (
            <HStack key={label} justify="between" align="start" gap={4} className="py-3">
              <dt className="shrink-0 text-academy-muted">{label}</dt>
              <dd className="min-w-0 break-words text-right font-semibold">{value}</dd>
            </HStack>
          ))}
        </dl>
        <HStack justify="between" align="center" gap={3} wrap="wrap" className="m-6 rounded-academy bg-academy-page p-5 sm:mx-8 print:border print:border-academy-line">
          <p className="font-semibold">Total pagado</p>
          <strong className={`text-3xl font-bold tabular-nums ${receipt.refunded_at ? 'line-through' : ''}`}>{money(receipt.amount_cents)}</strong>
        </HStack>
        {receipt.refunded_at ? (
          <p role="status" className="academy-notice mx-6 sm:mx-8">
            Reembolsado el {formatDate(receipt.refunded_at)}{receipt.refund_reason ? ` (${receipt.refund_reason})` : ''}.
          </p>
        ) : null}
        <footer className="border-t border-academy-line px-6 py-5 text-xs text-academy-muted sm:px-8">
          Comprobante de pago, no es una factura fiscal. Referencia interna <code className="break-all font-mono">{receipt.id}</code>.
        </footer>
      </article>
    </main>
  );
}
