import { notFound } from 'next/navigation';
import { formatDateTime } from '@/lib/crm/format';
import { attachReceipt } from '@/lib/valux/transfer-actions';
import { academyMoney } from '@/lib/valux/money';
import { bankDetails, getTransfer } from '@/lib/valux/transfers';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  pendiente: 'Esperando el depósito',
  aprobada: 'Pago confirmado. Consulta tu acceso en la Academia.',
  aprobando: 'Pago confirmado. Estamos habilitando tu acceso.',
  reembolsada: 'El pago se registró como reembolsado.',
  rechazada: 'No encontramos el depósito. Escribinos si ya pagaste.',
  vencida: 'Venció el plazo. Si ya pagaste, escribinos con la referencia.',
};

export default async function TransferenciaPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ subido?: string; error?: string }>;
}) {
  const { reference } = await params;
  const query = await searchParams;
  const transfer = await getTransfer(reference);
  if (!transfer) notFound();
  const bank = await bankDetails();

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Transferencia</h1>
      <p className="text-sm text-black/60">{transfer.description}</p>
      <div className="space-y-3 border border-black/10 bg-white p-4 text-sm">
        <p className="font-display text-4xl tracking-wide">{academyMoney(transfer.amount_cents)}</p>
        <p>
          Referencia para el concepto: <strong className="font-mono">{transfer.reference}</strong>
        </p>
        <p className="font-medium">{STATUS[transfer.status] || transfer.status}</p>
        {transfer.status === 'pendiente' ? (
          <>
            <p className="whitespace-pre-line border-t border-black/10 pt-3 leading-relaxed">{bank}</p>
            <p className="text-xs text-black/50">Plazo: hasta el {formatDateTime(transfer.expires_at)}. El acceso llega cuando confirmamos el depósito en el banco.</p>
          </>
        ) : null}
      </div>

      {transfer.status === 'pendiente' ? (
        <form action={attachReceipt} className="space-y-3 border border-black/10 bg-white p-4">
          <input type="hidden" name="reference" value={transfer.reference} />
          <label className="block text-sm">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Comprobante (opcional)</span>
            <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="w-full text-sm" />
          </label>
          {query.subido || transfer.receipt_url ? <p className="text-sm text-brand">Comprobante recibido.</p> : null}
          {query.error === 'archivo' ? <p className="text-sm">Subí una imagen o PDF de hasta 8 MB.</p> : null}
          {query.error === 'subida' ? <p className="text-sm">No se pudo subir. Probá de nuevo.</p> : null}
          <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Subir comprobante</button>
        </form>
      ) : null}
    </div>
  );
}
