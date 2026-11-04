import Link from 'next/link';

export default function PagoCancelado() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Pago cancelado</h1>
      <p className="text-sm text-black/60">No se registró la compra.</p>
      <Link className="text-sm underline" href="/academia">Volver a la academia</Link>
    </div>
  );
}
