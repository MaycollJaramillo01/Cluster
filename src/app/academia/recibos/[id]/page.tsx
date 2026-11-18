import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Page } from '@/components/academia/ui';
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
      <article className="space-y-6 border border-black/10 bg-white p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-brand text-sm font-extrabold uppercase tracking-[0.18em]">{site.name} · Academia</p>
            <p className="mt-1 text-xs text-black/50">Recibo de pago</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono">N.º {receipt.number}</p>
            <p className="text-black/60">{formatDate(receipt.created_at)}</p>
          </div>
        </header>
        <dl className="grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
          <dt className="text-black/50">Cliente</dt>
          <dd>{receipt.buyer_name}<span className="block text-black/50">{receipt.buyer_email}</span></dd>
          <dt className="text-black/50">Concepto</dt>
          <dd>{receipt.concept}</dd>
          <dt className="text-black/50">Método</dt>
          <dd>{receipt.method}</dd>
          <dt className="text-black/50">Moneda</dt>
          <dd>{CURRENCY}</dd>
        </dl>
        <div className="flex items-baseline justify-between border-t border-black/10 pt-4">
          <span className="text-sm text-black/60">Total pagado</span>
          <span className="font-display text-4xl">{money(receipt.amount_cents)}</span>
        </div>
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
