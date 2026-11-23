import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
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
    <main className="academy-page grid items-start gap-6 lg:grid-cols-3">
      <VStack as="article" gap={4} className="min-w-0 lg:col-span-2">
        <Link href="/academia/marketplace" className="academy-nav academy-focus w-fit">← Marketplace</Link>
        <Heading level={1} className="academy-title">{product.title}</Heading>
        <p className="text-sm font-semibold text-academy-muted">{product.creator_name || 'Academia'}</p>
        <p className="max-w-prose whitespace-pre-wrap leading-relaxed text-academy-muted">{product.description}</p>
        {query.ok ? <p role="status" className="academy-notice">Compra registrada.</p> : null}
        {query.error ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}
        {open && product.download_url ? <a className="academy-action academy-action-primary w-fit" href={`/api/academia/descargas/producto/${encodeURIComponent(product.id)}`}>Descargar</a> : null}
      </VStack>
      <aside className="academy-panel overflow-hidden lg:sticky lg:top-24">
        <Cover url={product.cover_url} title={product.title} />
        <VStack gap={4} className="p-5 sm:p-6">
          <p className="text-4xl font-bold tracking-tight">{product.price_cents > 0 ? money(product.price_cents) : 'Gratis'}</p>
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
        </VStack>
      </aside>
    </main>
  );
}
