import Link from 'next/link';
import { createProduct, reviewProduct } from '@/lib/valux/actions';
import { money } from '@/lib/crm/format';
import { listPeople, listProducts } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function MarketplaceAdmin() {
  const [products, people] = await Promise.all([listProducts(), listPeople()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Marketplace" action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/academia/marketplace">Ver catálogo</Link>} />
      <form action={createProduct} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-2">
        <Field label="Título"><input className={fieldClass} name="title" required /></Field>
        <Field label="Precio USD"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue="0" /></Field>
        <Field label="Creador">
          <select className={fieldClass} name="creator_id" defaultValue="">
            <option value="">Sin creador</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </Field>
        <Field label="Descarga"><input className={fieldClass} name="download_url" placeholder="https://" /></Field>
        <Field label="O sube el archivo"><input className={fieldClass} name="file" type="file" /></Field>
        <Field label="Portada"><input className={fieldClass} name="cover_url" placeholder="https://" /></Field>
        <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
        <Field label="Descripción"><textarea className={fieldClass} name="description" rows={3} /></Field>
        <label className="flex items-center gap-2 text-sm md:col-span-2"><input name="published" type="checkbox" /> Publicar directo</label>
        <button className={btn} type="submit">Crear producto</button>
      </form>
      <div className="space-y-2">
        {products.map((product) => (
          <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-xs text-black/45">{product.review_status} · {money(product.price_cents)} · {product.creator_name || 'Sin creador'}</p>
            </div>
            <div className="flex gap-2">
              <form action={reviewProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="status" value="publicado" /><button className={btnTiny} type="submit">Publicar</button></form>
              <form action={reviewProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="status" value="rechazado" /><button className={btnTiny} type="submit">Rechazar</button></form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
