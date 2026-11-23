import { notFound } from 'next/navigation';
import { formatDateTime } from '@/lib/crm/format';
import { attachReceipt } from '@/lib/valux/transfer-actions';
import { academyMoney } from '@/lib/valux/money';
import { bankDetails, getTransfer } from '@/lib/valux/transfers';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';

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
    <VStack as="main" gap={5} className="academy-page max-w-xl">
      <Heading level={1} className="academy-title">Transferencia</Heading>
      <p className="text-academy-muted">{transfer.description}</p>
      <section className="academy-panel space-y-3 p-5 text-sm sm:p-6">
        <p className="text-4xl font-bold tracking-tight">{academyMoney(transfer.amount_cents)}</p>
        <p>
          Referencia para el concepto: <strong className="font-mono">{transfer.reference}</strong>
        </p>
        <p className="academy-notice font-medium" role="status">{STATUS[transfer.status] || transfer.status}</p>
        {transfer.status === 'pendiente' ? (
          <>
            <p className="whitespace-pre-line border-t border-black/10 pt-3 leading-relaxed">{bank}</p>
            <p className="text-xs text-black/50">Plazo: hasta el {formatDateTime(transfer.expires_at)}. El acceso llega cuando confirmamos el depósito en el banco.</p>
          </>
        ) : null}
      </section>

      {transfer.status === 'pendiente' ? (
        <form action={attachReceipt} className="academy-panel space-y-4 p-5 sm:p-6">
          <input type="hidden" name="reference" value={transfer.reference} />
          <label className="block space-y-2 text-sm font-semibold">Comprobante (opcional)
            <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="academy-field block w-full text-sm" />
          </label>
          {query.subido || transfer.receipt_url ? <p className="text-sm text-brand">Comprobante recibido.</p> : null}
          {query.error === 'archivo' ? <p className="text-sm">Subí una imagen o PDF de hasta 8 MB.</p> : null}
          {query.error === 'subida' ? <p className="text-sm">No se pudo subir. Probá de nuevo.</p> : null}
          <AcademySubmit label="Subir comprobante" pending="Subiendo…" />
        </form>
      ) : null}
    </VStack>
  );
}
