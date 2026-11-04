import Link from 'next/link';
import { Cover, Page } from '@/components/academia/ui';
import { money } from '@/lib/crm/format';
import { listProducts } from '@/lib/valux/data';

export default async function MarketplacePage() {
  const products = await listProducts('publicado');

  return (
    <Page>
      <h1 className="font-display text-5xl tracking-wide">Marketplace</h1>
      <p className="mt-2 max-w-lg text-sm text-black/60">Descargas y materiales de la academia, aparte de los cursos.</p>
      {products.length === 0 ? (
        <p className="mt-8 border border-black/10 bg-white px-6 py-16 text-center text-sm text-black/50">No hay productos publicados.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/academia/marketplace/${product.id}`} className="border border-black/10 bg-white">
              <Cover url={product.cover_url} title={product.title} />
              <div className="space-y-2 p-4">
                <p className="line-clamp-2 font-medium leading-snug">{product.title}</p>
                <p className="text-sm text-black/50">{product.creator_name || 'Academia'}</p>
                <p className="text-sm font-medium">{product.price_cents > 0 ? money(product.price_cents) : 'Gratis'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
