import Link from 'next/link';
import { formatDateTime } from '@/lib/crm/format';
import { approveTransfer, rejectTransfer } from '@/lib/valux/transfer-actions';
import { academyMoney } from '@/lib/valux/money';
import { listTransfers } from '@/lib/valux/transfers';
import { Empty, Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

const FILTERS = [
  { status: 'pendiente', label: 'Pendientes' },
  { status: 'vencida', label: 'Vencidas' },
  { status: 'aprobando', label: 'Por entregar' },
  { status: 'aprobada', label: 'Aprobadas' },
  { status: 'reembolsada', label: 'Reembolsadas' },
  { status: 'rechazada', label: 'Rechazadas' },
];

const ERRORS: Record<string, string> = {
  banco: 'Anotá el número de operación del banco antes de aprobar.',
  acceso: 'El depósito quedó confirmado. El sistema volverá a intentar la entrega. También puedes reintentar aquí.',
};

export default async function TransferenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const status = FILTERS.some((item) => item.status === query.estado) ? query.estado : 'pendiente';
  const transfers = await listTransfers(status);

  return (
    <div className="space-y-6">
      <PageTitle title="Transferencias" />
      <p className="max-w-2xl text-sm text-black/60">
        Aprobá solo después de ver el depósito en el banco. El comprobante que sube el comprador no prueba el pago. Las pendientes vencen solas a las 72 horas; una vencida todavía se puede aprobar si el dinero llegó.
      </p>
      <nav className="flex flex-wrap gap-2 text-xs">
        {FILTERS.map((item) => (
          <Link
            key={item.status}
            href={`/dashboard/cursos/transferencias?estado=${item.status}`}
            className={`px-2 py-1 ${item.status === status ? 'bg-ink text-white' : 'bg-black/5'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {query.ok ? <p role="status" className="text-sm text-brand">Transferencia aprobada. Se habilitó el acceso.</p> : null}
      {query.error && ERRORS[query.error] ? <p className="text-sm">{ERRORS[query.error]}</p> : null}

      {transfers.length === 0 ? (
        <Empty title="No hay transferencias en este estado." />
      ) : (
        <div className="space-y-3">
          {transfers.map((item) => (
            <article key={item.id} className="space-y-3 border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    <span className="font-mono">{item.reference}</span> · {academyMoney(item.amount_cents)}
                  </p>
                  <p className="text-sm">{item.description}</p>
                  <p className="text-xs text-black/45">
                    {item.buyer_name} · {item.buyer_email} · {item.kind} · creada {formatDateTime(item.created_at)} · vence {formatDateTime(item.expires_at)}
                    {item.bank_ref ? ` · operación ${item.bank_ref}` : ''}
                    {item.note ? ` · ${item.note}` : ''}
                  </p>
                </div>
                {item.receipt_url ? (
                  <a className="text-sm underline" href={`/dashboard/comprobante/${item.id}`} target="_blank" rel="noreferrer">
                    Ver comprobante
                  </a>
                ) : (
                  <span className="text-xs text-black/40">Sin comprobante</span>
                )}
              </div>
              {item.status === 'aprobando' ? (
                <form action={approveTransfer}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className={btn} type="submit">Reintentar entrega</button>
                </form>
              ) : ['pendiente', 'vencida'].includes(item.status) ? (
                <div className="flex flex-wrap items-end gap-3">
                  <form action={approveTransfer} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <Field label="Nº de operación del banco">
                      <input className={fieldClass} name="bank_ref" required />
                    </Field>
                    <button className={btn} type="submit">Aprobar y dar acceso</button>
                  </form>
                  <form action={rejectTransfer} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <Field label="Motivo">
                      <input className={fieldClass} name="note" placeholder="No llegó el depósito" />
                    </Field>
                    <button className={btnTiny} type="submit">Rechazar</button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
