import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover, payNote, payReady } from '@/components/academia/ui';
import { ProductForm } from '@/components/academia/PayForms';
import { Icon } from '@/components/ui/Icon';
import { academyMoney as money } from '@/lib/valux/money';
import { academiaPersonId } from '@/lib/valux/session';
import { canReadProduct, getPerson, getProduct } from '@/lib/valux/data';
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
  const personId = await academiaPersonId();
  const [pay, open, person] = await Promise.all([paymentOptions(), canReadProduct(personId, product), getPerson(personId)]);
  const paid = product.price_cents > 0;

  return (
    <main className="academy-page grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_theme(spacing.96)]">
      <VStack as="article" gap={6} className="min-w-0">
        <HStack as="nav" aria-label="Ruta" gap={2} align="center" className="text-sm">
          <Link href="/academia/marketplace" className="academy-focus rounded-academy font-semibold text-academy-muted hover:text-academy-ink">Marketplace</Link>
          <Icon name="arrow-right" size={14} className="text-academy-muted" />
          <p aria-current="page" className="truncate font-semibold">{product.title}</p>
        </HStack>
        <VStack as="header" gap={3}>
          <Heading level={1} className="academy-title">{product.title}</Heading>
          <p className="text-sm font-semibold text-academy-muted">Por {product.creator_name || 'Academia Cluster'}</p>
        </VStack>
        {query.ok ? <p role="status" className="academy-notice flex items-center gap-2"><Icon name="check" size={16} className="text-academy-primary" />Compra registrada.</p> : null}
        {query.error ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}
        {product.description ? <p className="max-w-prose whitespace-pre-wrap break-words text-lg leading-relaxed text-academy-ink">{product.description}</p> : null}
        <HStack gap={3} align="start" className="academy-panel p-5">
          <Icon name="upload" size={20} className="mt-0.5 shrink-0 rotate-180 text-academy-primary" />
          <VStack gap={1}>
            <Heading level={2} className="text-base font-bold">Qué recibes</Heading>
            <p className="text-sm text-academy-muted">Un archivo descargable. Lo descargas desde esta página cuando tienes acceso.</p>
          </VStack>
        </HStack>
      </VStack>
      <VStack as="aside" gap={0} aria-label={open ? 'Descarga' : 'Obtener el recurso'} className="academy-panel overflow-hidden lg:sticky lg:top-24">
        {product.cover_url ? <Cover url={product.cover_url} title={product.title} /> : null}
        <VStack gap={5} className="p-5 sm:p-6">
          <p className="text-4xl font-bold tabular-nums tracking-tight">{paid ? money(product.price_cents) : 'Gratis'}</p>
          {open ? (
            product.download_url ? (
              <VStack gap={3}>
                <p role="status" className="flex items-center gap-2 text-sm font-semibold text-academy-primary"><Icon name="check" size={16} />Tienes acceso a la descarga.</p>
                <a className="academy-action academy-action-primary w-full" href={`/api/academia/descargas/producto/${encodeURIComponent(product.id)}`}>Descargar <Icon name="upload" size={16} className="rotate-180" /></a>
              </VStack>
            ) : (
              <p className="text-sm text-academy-muted">Tienes acceso. El archivo aún no está disponible.</p>
            )
          ) : paid && !payReady(pay) ? (
            <p role="status" className="academy-notice">{payNote('pasarela')}</p>
          ) : (
            <ProductForm id={product.id} label={paid ? 'Comprar ahora' : 'Obtener gratis'} pay={paid ? pay : undefined} contact={person ? { name: person.name, email: person.email } : undefined} />
          )}
        </VStack>
      </VStack>
    </main>
  );
}
