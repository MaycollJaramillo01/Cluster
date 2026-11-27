import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { formatDateTime } from '@/lib/crm/format';
import { attachReceipt } from '@/lib/valux/transfer-actions';
import { academyMoney } from '@/lib/valux/money';
import { bankDetails, getTransfer } from '@/lib/valux/transfers';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { CopyValue } from '@/components/academia/CertificateTools';
import { Icon } from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

const CLOSED: Record<string, { title: string; text: string; done?: boolean }> = {
  aprobada: { title: 'Pago confirmado', text: 'Consulta tu acceso en la Academia.', done: true },
  aprobando: { title: 'Pago confirmado', text: 'Estamos habilitando tu acceso.', done: true },
  reembolsada: { title: 'Pago reembolsado', text: 'El pago se registró como reembolsado.' },
  rechazada: { title: 'No encontramos el depósito', text: 'Escríbenos si ya pagaste, con la referencia de este pago.' },
  vencida: { title: 'Venció el plazo', text: 'Si ya pagaste, escríbenos con la referencia de este pago.' },
};

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[theme(spacing.8)_1fr] gap-4 border-t border-academy-line py-6 first:border-t-0 first:pt-0">
      <strong aria-hidden="true" className="grid size-8 place-items-center rounded-academy bg-academy-deep text-sm text-white">{number}</strong>
      <VStack gap={3} className="min-w-0">
        <Heading level={2} className="text-lg font-bold">{title}</Heading>
        {children}
      </VStack>
    </li>
  );
}

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
  const pending = transfer.status === 'pendiente';
  const closed = CLOSED[transfer.status];
  const uploaded = Boolean(query.subido || transfer.receipt_url);
  const timeline = [
    ['Pedido creado', true],
    ['Depósito y comprobante', uploaded || Boolean(closed?.done)],
    ['Confirmación del equipo', Boolean(closed?.done)],
    ['Acceso', transfer.status === 'aprobada'],
  ] as const;

  return (
    <VStack as="main" gap={6} className="academy-page max-w-6xl">
      <VStack as="header" gap={2}>
        <p className="text-sm font-semibold text-academy-primary">Pago por transferencia</p>
        <Heading level={1} className="academy-title">{pending ? 'Completa tu depósito' : closed?.title || 'Transferencia'}</Heading>
        <p className="text-academy-muted">{transfer.description}</p>
      </VStack>
      <section className="grid items-start gap-6 lg:grid-cols-[1fr_theme(spacing.96)]">
        {pending ? (
          <ol className="academy-panel min-w-0 p-5 sm:p-8" aria-label="Pasos para pagar">
            <Step number={1} title="Deposita el monto exacto">
              <p className="text-4xl font-bold tabular-nums tracking-tight">{academyMoney(transfer.amount_cents)}</p>
              <p className="whitespace-pre-line rounded-academy bg-academy-page p-4 text-sm leading-relaxed">{bank}</p>
            </Step>
            <Step number={2} title="Escribe la referencia en el concepto">
              <HStack gap={3} align="center" wrap="wrap">
                <strong className="rounded-academy border border-academy-line px-4 py-2 font-mono text-2xl tracking-widest">{transfer.reference}</strong>
                <CopyValue value={transfer.reference} label="Copiar referencia" />
              </HStack>
              <small className="text-sm text-academy-muted">Con la referencia identificamos tu pago.</small>
            </Step>
            <Step number={3} title="Sube tu comprobante (opcional)">
              {uploaded ? (
                <p role="status" className="flex items-center gap-2 text-sm font-semibold text-academy-primary"><Icon name="check" size={16} aria-hidden="true" />Comprobante recibido.</p>
              ) : null}
              <form action={attachReceipt} className="space-y-4">
                <input type="hidden" name="reference" value={transfer.reference} />
                <label className="block space-y-2 text-sm font-semibold">{uploaded ? 'Reemplazar comprobante' : 'Archivo del comprobante'}
                  <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required aria-describedby="comprobante-ayuda" aria-invalid={query.error === 'archivo' || undefined} className="academy-field block w-full text-sm" />
                </label>
                <small id="comprobante-ayuda" className="block text-xs text-academy-muted">Imagen o PDF de hasta 8 MB. Ayuda al equipo a encontrar tu depósito.</small>
                {query.error === 'archivo' ? <p role="alert" className="text-sm text-red-800">Sube una imagen o PDF de hasta 8 MB.</p> : null}
                {query.error === 'subida' ? <p role="alert" className="text-sm text-red-800">No se pudo subir. Intenta de nuevo.</p> : null}
                <AcademySubmit label="Subir comprobante" pending="Subiendo…" />
              </form>
            </Step>
          </ol>
        ) : (
          <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8" role="status">
            <Heading level={2} className="text-2xl font-bold">{closed?.title || transfer.status}</Heading>
            <p className="text-academy-muted">{closed?.text}</p>
            <p className="text-sm">Referencia <strong className="font-mono">{transfer.reference}</strong></p>
            {closed?.done ? <Link href="/academia/mis-cursos" className="academy-action academy-action-primary">Ir a mis cursos <Icon name="arrow-right" size={16} aria-hidden="true" /></Link> : <Link href="/academia" className="academy-action academy-action-secondary">Volver a la academia</Link>}
          </VStack>
        )}
        <VStack as="aside" gap={5} aria-label="Resumen del pago" className="academy-panel p-5 sm:p-6 lg:sticky lg:top-24">
          <dl className="space-y-3 text-sm">
            <HStack justify="between" gap={3}><dt className="text-academy-muted">Concepto</dt><dd className="text-right font-semibold">{transfer.description}</dd></HStack>
            <HStack justify="between" gap={3}><dt className="text-academy-muted">Referencia</dt><dd className="font-mono font-semibold">{transfer.reference}</dd></HStack>
            {pending ? <HStack justify="between" gap={3}><dt className="text-academy-muted">Plazo</dt><dd className="text-right">{formatDateTime(transfer.expires_at)}</dd></HStack> : null}
            <HStack justify="between" gap={3} className="border-t border-academy-line pt-3"><dt className="font-semibold">Total</dt><dd className="text-xl font-bold tabular-nums">{academyMoney(transfer.amount_cents)}</dd></HStack>
          </dl>
          <ol aria-label="Estado" className="space-y-3 border-t border-academy-line pt-4 text-sm">
            {timeline.map(([label, done]) => (
              <li key={label} className="flex items-center gap-3">
                <strong aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-academy-full border ${done ? 'border-academy-action bg-academy-action text-academy-action-text' : 'border-academy-line'}`}>{done ? <Icon name="check" size={12} strokeWidth={3} /> : null}</strong>
                <small className={`text-sm ${done ? 'font-semibold text-academy-ink' : 'text-academy-muted'}`}>{label}<em className="sr-only">{done ? ': listo' : ': pendiente'}</em></small>
              </li>
            ))}
          </ol>
          {pending ? <p className="text-xs text-academy-muted">El acceso llega cuando el equipo confirma el depósito en el banco.</p> : null}
        </VStack>
      </section>
    </VStack>
  );
}
