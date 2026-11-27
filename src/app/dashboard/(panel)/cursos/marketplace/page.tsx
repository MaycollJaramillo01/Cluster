import Link from 'next/link';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { createProduct, reviewProduct } from '@/lib/valux/actions';
import { academyMoney as money } from '@/lib/valux/money';
import { listPeople, listProducts } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, Notice, PageTitle, Pill, ReviewButtons, SectionTitle, capitalize, fieldClass, reviewTone } from '@/components/dashboard/StaffUi';
import { Icon } from '@/components/ui/Icon';

const fileInput = `${fieldClass} text-sm file:mr-3 file:rounded-academy file:border-0 file:bg-academy-tint file:px-3 file:py-1 file:font-semibold file:text-academy-primary`;

export default async function MarketplaceAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [products, people, query] = await Promise.all([listProducts(), listPeople(), searchParams]);
  const failed = query.error === 'archivo' || query.error === 'archivo-privado';

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Contenido"
        title="Marketplace"
        description="Recursos descargables que se venden o regalan en la academia."
        action={<Link className="academy-nav academy-focus" href="/academia/marketplace">Ver catálogo <Icon name="arrow-right" size={15} /></Link>}
      />
      {query.error === 'archivo' ? <Notice tone="error">No se pudo guardar la descarga. Verifica el enlace o el almacenamiento privado y el límite de 8 MB.</Notice> : null}
      {query.error === 'archivo-privado' ? <Notice tone="error">Sube el archivo del producto de pago para proteger la descarga.</Notice> : null}

      <details open={failed || products.length === 0 || undefined} className="academy-panel">
        <summary className="academy-focus flex min-h-12 cursor-pointer list-none items-center px-5 font-semibold text-academy-primary sm:px-6">Nuevo recurso</summary>
        <form action={createProduct} className="grid gap-5 border-t border-academy-line p-5 sm:p-6 md:grid-cols-2">
          <Field label="Título"><input className={fieldClass} name="title" required /></Field>
          <Field label="Precio (L)" hint="0 para un recurso gratis."><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
          <Field label="Creador">
            <select className={fieldClass} name="creator_id" defaultValue="">
              <option value="">Sin creador</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </Field>
          <Field label="Descripción" className="md:row-span-2"><textarea className={fieldClass} name="description" rows={4} /></Field>
          <Field label="Enlace de descarga"><input className={fieldClass} name="download_url" placeholder="https://" inputMode="url" /></Field>
          <Field label="O sube el archivo" hint="Obligatorio en recursos de pago, para proteger la descarga."><input className={fileInput} name="file" type="file" /></Field>
          <Field label="Enlace de la portada"><input className={fieldClass} name="cover_url" placeholder="https://" inputMode="url" /></Field>
          <Field label="O sube la portada"><input className={fileInput} name="cover" type="file" accept="image/*" /></Field>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold md:col-span-2"><input name="published" type="checkbox" className="size-4" /> Publicar directo</label>
          <HStack className="md:col-span-2"><AcademySubmit label="Crear recurso" pending="Guardando…" /></HStack>
        </form>
      </details>

      <VStack as="section" gap={4} aria-labelledby="recursos">
        <SectionTitle id="recursos" title="Recursos" description={`${products.length} en total.`} />
        {products.length === 0 ? <Empty title="Todavía no hay recursos." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <VStack gap={1} className="min-w-0">
                  <HStack gap={3} align="center" wrap="wrap">
                    <p className="break-words font-semibold">{product.title}</p>
                    <Pill tone={reviewTone(product.review_status)}>{capitalize(product.review_status)}</Pill>
                  </HStack>
                  <p className="text-sm text-academy-muted">{product.price_cents ? money(product.price_cents) : 'Gratis'} · {product.creator_name || 'Sin creador'}</p>
                </VStack>
                <ReviewButtons action={reviewProduct} id={product.id} status={product.review_status} title={product.title} />
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
