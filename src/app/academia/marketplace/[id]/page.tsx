import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Checkout, Cover, payHint, payNote, payReady } from '@/components/academia/ui';
import { academyMoney as money } from '@/lib/valux/money';
import { buyProduct } from '@/lib/valux/actions';
import { academiaPersonId } from '@/lib/valux/session';
import { canReadProduct, getProduct } from '@/lib/valux/data';
import { paymentOptions } from '@/lib/valux/transfers';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getProduct(id);
  if (!product || product.review_status !== 'publicado') notFound();
  const pay = await paymentOptions();
  const open = await canReadProduct(await academiaPersonId(), product);

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <p className="text-sm text-black/45"><Link href="/academia/marketplace">Marketplace</Link></p>
        <h1 className="font-display text-5xl tracking-wide">{product.title}</h1>
        <p className="text-sm text-black/50">{product.creator_name || 'Academia'}</p>
        <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-black/70">{product.description}</p>
        {query.ok ? <p className="text-sm text-brand">Compra registrada.</p> : null}
        {query.error ? <p className="text-sm">{payNote(query.error)}</p> : null}
        {open && product.download_url ? <a className="inline-block bg-ink px-4 py-3 text-sm text-white" href={`/api/academia/descargas/producto/${encodeURIComponent(product.id)}`}>Descargar</a> : null}
      </div>
      <aside className="border border-black/10 bg-white lg:sticky lg:top-6">
        <Cover url={product.cover_url} title={product.title} />
        <div className="space-y-4 p-4">
          <p className="font-display text-5xl tracking-wide">{product.price_cents > 0 ? money(product.price_cents) : 'Gratis'}</p>
          {open ? <p className="text-sm text-black/75">{product.download_url ? 'Tienes acceso a la descarga.' : 'El archivo aún no está disponible.'}</p> : product.price_cents > 0 && !payReady(pay) ? (
            <p className="text-sm leading-relaxed text-black/70">{payNote('pasarela')}</p>
          ) : (
            <Checkout
              action={buyProduct}
              hidden={{ id: product.id }}
              label={product.price_cents > 0 ? 'Comprar ahora' : 'Obtener'}
              pay={product.price_cents > 0 ? pay : undefined}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
