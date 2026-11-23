import Link from 'next/link';
import { Page } from '@/components/academia/ui';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listReceipts } from '@/lib/valux/receipts';
import { academiaPersonId } from '@/lib/valux/session';

export const dynamic = 'force-dynamic';

export default async function ReceiptsPage() {
  const personId = await academiaPersonId();
  const receipts = await listReceipts(personId);

  return (
    <Page className="max-w-4xl gap-5">
      <Heading level={1} className="academy-title">Recibos</Heading>
      {!personId ? (
        <p className="academy-panel p-5 text-academy-muted">
          Entra con el correo de tu compra para ver tus recibos. <Link className="underline" href="/academia/entrar">Entrar</Link>
        </p>
      ) : receipts.length === 0 ? (
        <p className="academy-panel p-5 text-academy-muted">Todavía no tienes pagos registrados.</p>
      ) : (
        <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
          {receipts.map((item) => (
            <li key={item.id}>
              <Link href={`/academia/recibos/${item.id}`} className="academy-focus flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-academy-tint">
                <VStack gap={1} className="min-w-0">
                  <strong className="font-semibold">{item.concept}</strong>
                  <small className="text-sm text-academy-muted">
                    {formatDate(item.created_at)} · N.º {item.number}{item.refunded_at ? ' · reembolsado' : ''}
                  </small>
                </VStack>
                <strong className="flex items-center gap-2 text-sm tabular-nums text-academy-primary">{money(item.amount_cents)} <Icon name="arrow-right" size={16} /></strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
