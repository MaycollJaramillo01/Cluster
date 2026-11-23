import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Page } from '@/components/academia/ui';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { formatDate } from '@/lib/crm/format';
import { site } from '@/lib/site';
import { academyMoney as money, CURRENCY } from '@/lib/valux/money';
import { listReceipts } from '@/lib/valux/receipts';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';

// Comprobante imprimible. Solo lo ve quien compró: la consulta filtra por la persona de la sesión.
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = await academiaPersonId();
  if (!personId) redirect('/academia/entrar');
  const [receipt] = await listReceipts(personId, id);
  if (!receipt) notFound();

  return (
    <Page className="max-w-2xl">
      <p className="mb-4 text-sm print:hidden">
        <Link className="underline" href="/academia/recibos">Volver a recibos</Link> · Para guardarlo en PDF usa Imprimir en tu navegador.
      </p>
      <article className="academy-panel space-y-6 p-5 sm:p-8 print:border-none">
        <HStack as="header" align="start" justify="between" wrap="wrap" gap={4}>
          <VStack gap={2}>
            <Heading level={1} className="text-2xl font-bold">Recibo de pago</Heading>
            <p className="text-sm text-academy-muted">{site.name} · Academia</p>
          </VStack>
          <VStack gap={1} className="text-right text-sm">
            <p className="font-mono">N.º {receipt.number}</p>
            <p className="text-academy-muted">{formatDate(receipt.created_at)}</p>
          </VStack>
        </HStack>
        <dl className="grid gap-3 break-words text-sm sm:grid-cols-3">
          <dt className="text-black/50">Cliente</dt>
          <dd className="min-w-0 sm:col-span-2">{receipt.buyer_name}<small className="block break-words text-sm text-academy-muted">{receipt.buyer_email}</small></dd>
          <dt className="text-black/50">Concepto</dt>
          <dd className="sm:col-span-2">{receipt.concept}</dd>
          <dt className="text-black/50">Método</dt>
          <dd className="sm:col-span-2">{receipt.method}</dd>
          <dt className="text-black/50">Moneda</dt>
          <dd className="sm:col-span-2">{CURRENCY}</dd>
        </dl>
        <HStack align="center" gap={3} wrap="wrap" justify="between" className="academy-notice">
          <p className="font-semibold">Total pagado</p>
          <strong className="text-3xl font-bold tabular-nums">{money(receipt.amount_cents)}</strong>
        </HStack>
        {receipt.refunded_at ? (
          <p className="border border-black/15 bg-black/[0.03] px-3 py-2 text-sm">
            Reembolsado el {formatDate(receipt.refunded_at)}{receipt.refund_reason ? ` (${receipt.refund_reason})` : ''}.
          </p>
        ) : null}
        <p className="text-xs text-black/45">Comprobante de pago, no es una factura fiscal. Referencia interna {receipt.id}.</p>
      </article>
    </Page>
  );
}
