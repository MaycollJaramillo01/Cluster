import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/crm/format';
import { approveTransfer, rejectTransfer } from '@/lib/valux/transfer-actions';
import { academyMoney } from '@/lib/valux/money';
import { listTransfers } from '@/lib/valux/transfers';
import { Empty, Notice, PageTitle, Pill, Tabs, btn, btnGhost, fieldClass, kindLabel, labelClass } from '@/components/dashboard/StaffUi';

const FILTERS = [
  { status: 'pendiente', label: 'Pendientes', empty: 'No hay transferencias pendientes.' },
  { status: 'vencida', label: 'Vencidas', empty: 'No hay transferencias vencidas.' },
  { status: 'aprobando', label: 'Por entregar', empty: 'No hay accesos por entregar.' },
  { status: 'aprobada', label: 'Aprobadas', empty: 'Todavía no hay transferencias aprobadas.' },
  { status: 'reembolsada', label: 'Reembolsadas', empty: 'No hay transferencias reembolsadas.' },
  { status: 'rechazada', label: 'Rechazadas', empty: 'No hay transferencias rechazadas.' },
];

const ERRORS: Record<string, string> = {
  banco: 'Anota el número de operación del banco antes de aprobar.',
  acceso: 'El depósito quedó confirmado, pero el acceso no se entregó. El sistema volverá a intentarlo; también puedes reintentarlo aquí.',
};

export default async function TransferenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const filter = FILTERS.find((item) => item.status === query.estado) || FILTERS[0];
  const transfers = await listTransfers(filter.status);

  return (
    <VStack gap={6} className="mx-auto w-full max-w-6xl">
      <PageTitle eyebrow="Operación" title="Transferencias" description="Pagos por depósito o transferencia bancaria que esperan confirmación." />
      <Notice>Aprueba solo después de ver el depósito en el banco. El comprobante que sube el comprador no prueba el pago. Las pendientes vencen solas a las 72 horas; una vencida todavía se puede aprobar si el dinero llegó.</Notice>
      <Tabs label="Estado de las transferencias" items={FILTERS.map((item) => ({ href: `/dashboard/cursos/transferencias?estado=${item.status}`, label: item.label, current: item === filter }))} />
      {query.ok ? <Notice tone="ok">Transferencia aprobada. Se habilitó el acceso.</Notice> : null}
      {query.error && ERRORS[query.error] ? <Notice tone="error">{ERRORS[query.error]}</Notice> : null}

      {transfers.length === 0 ? (
        <Empty title={filter.empty} />
      ) : (
        <VStack as="ol" gap={4} aria-label={filter.label}>
          {transfers.map((item) => {
            const open = item.status === 'pendiente' || item.status === 'vencida';
            const decide = open || item.status === 'aprobando';
            return (
              <li key={item.id}>
                <article aria-label={`Transferencia ${item.reference}`} className={`academy-panel grid gap-5 p-4 sm:p-6 ${decide ? 'lg:grid-cols-[minmax(0,1fr)_theme(spacing.96)] lg:gap-8' : ''}`}>
                  <VStack gap={4} className="min-w-0">
                    <HStack gap={2} align="center" wrap="wrap">
                      <code className="rounded-academy bg-academy-tint px-2 py-1 font-mono text-sm font-semibold">{item.reference}</code>
                      <Pill>{kindLabel[item.kind] || item.kind}</Pill>
                      {item.status === 'vencida' ? <Pill tone="bad">Vencida</Pill> : null}
                    </HStack>
                    <VStack gap={1}>
                      <p className="font-academy-heading text-3xl font-bold tabular-nums">{academyMoney(item.amount_cents)}</p>
                      <p className="break-words font-semibold">{item.description}</p>
                    </VStack>
                    <dl className="grid gap-4 rounded-academy bg-academy-page p-4 text-sm sm:grid-cols-2">
                      <VStack gap={1} className="min-w-0">
                        <dt className="text-xs font-semibold text-academy-muted">Comprador</dt>
                        <dd className="break-words font-semibold">{item.buyer_name}</dd>
                        <dd className="break-all text-academy-muted">{item.buyer_email}</dd>
                      </VStack>
                      <VStack gap={1}>
                        <dt className="text-xs font-semibold text-academy-muted">Fechas</dt>
                        <dd>Creada el {formatDateTime(item.created_at)}</dd>
                        <dd>Vence el {formatDateTime(item.expires_at)}</dd>
                      </VStack>
                      {item.bank_ref ? (
                        <VStack gap={1}>
                          <dt className="text-xs font-semibold text-academy-muted">Operación del banco</dt>
                          <dd className="break-all font-mono">{item.bank_ref}</dd>
                        </VStack>
                      ) : null}
                      {item.note ? (
                        <VStack gap={1}>
                          <dt className="text-xs font-semibold text-academy-muted">Nota</dt>
                          <dd className="break-words">{item.note}</dd>
                        </VStack>
                      ) : null}
                    </dl>
                    {item.receipt_url ? (
                      <a className="academy-nav academy-focus -ml-3 w-fit text-academy-primary" href={`/dashboard/comprobante/${item.id}`} target="_blank" rel="noreferrer">
                        <Icon name="link" size={16} />Ver comprobante<small className="sr-only"> (se abre en otra pestaña)</small>
                      </a>
                    ) : (
                      <p className="text-sm text-academy-muted">El comprador no subió comprobante.</p>
                    )}
                  </VStack>

                  {item.status === 'aprobando' ? (
                    <VStack gap={3} className="self-start rounded-academy-lg border border-academy-line bg-academy-page p-4 sm:p-5">
                      <p className="text-sm">El depósito está confirmado y falta entregar el acceso.</p>
                      <form action={approveTransfer}>
                        <input type="hidden" name="id" value={item.id} />
                        <button className={`${btn} w-full`} type="submit">Reintentar entrega</button>
                      </form>
                    </VStack>
                  ) : open ? (
                    <VStack gap={5} className="self-start rounded-academy-lg border border-academy-line bg-academy-page p-4 sm:p-5">
                      <form action={approveTransfer} className="grid gap-3">
                        <input type="hidden" name="id" value={item.id} />
                        <label className={labelClass}>N.º de operación del banco<input className={fieldClass} name="bank_ref" required autoComplete="off" spellCheck={false} /></label>
                        <button className={btn} type="submit"><Icon name="check" size={16} />Aprobar y dar acceso</button>
                      </form>
                      <form action={rejectTransfer} className="grid gap-3 border-t border-academy-line pt-5">
                        <input type="hidden" name="id" value={item.id} />
                        <label className={labelClass}>Motivo del rechazo<input className={fieldClass} name="note" placeholder="No llegó el depósito" /></label>
                        <button className={btnGhost} type="submit">Rechazar</button>
                      </form>
                    </VStack>
                  ) : null}
                </article>
              </li>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}
