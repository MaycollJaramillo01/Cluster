import Link from 'next/link';
import { Page } from '@/components/academia/ui';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listReceipts } from '@/lib/valux/receipts';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';

export default async function ReceiptsPage() {
  const personId = await academiaPersonId();
  const receipts = await listReceipts(personId);

  return (
    <Page>
      <h1 className="font-display text-5xl tracking-wide">Recibos</h1>
      {!personId ? (
        <p className="mt-4 text-sm text-black/60">
          Entra con el correo de tu compra para ver tus recibos. <Link className="underline" href="/academia/entrar">Entrar</Link>
        </p>
      ) : receipts.length === 0 ? (
        <p className="mt-4 text-sm text-black/60">Todavía no tienes pagos registrados.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {receipts.map((item) => (
            <li key={item.id}>
              <Link href={`/academia/recibos/${item.id}`} className="flex flex-wrap items-center justify-between gap-2 border border-black/10 bg-white px-4 py-3 hover:border-black/30">
                <span className="min-w-0">
                  <span className="block font-medium">{item.concept}</span>
                  <span className="block text-xs text-black/50">
                    {formatDate(item.created_at)} · N.º {item.number}{item.refunded_at ? ' · reembolsado' : ''}
                  </span>
                </span>
                <span className="font-mono text-sm">{money(item.amount_cents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
