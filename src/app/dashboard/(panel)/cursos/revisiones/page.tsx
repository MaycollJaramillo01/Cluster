import { reviewPost, reviewProduct, setApplicationStatus } from '@/lib/valux/actions';
import { listApplications, listPosts, listProducts } from '@/lib/valux/data';
import { PageTitle, btnTiny } from '@/components/dashboard/ui';

export default async function RevisionesPage() {
  const [products, posts, applications] = await Promise.all([
    listProducts('pendiente'),
    listPosts('pendiente'),
    listApplications(),
  ]);
  const fichas = applications.filter((item) => String(item.status) === 'nueva' || String(item.status) === 'revision');

  return (
    <div className="space-y-8">
      <PageTitle title="Revisiones" />
      <section className="space-y-2">
        <h2 className="font-display text-3xl tracking-wide">Productos</h2>
        {products.length === 0 ? <p className="text-sm text-black/50">Nada pendiente.</p> : products.map((product) => (
          <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <p>{product.title}</p>
            <div className="flex gap-2">
              <form action={reviewProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="status" value="publicado" /><button className={btnTiny} type="submit">Publicar</button></form>
              <form action={reviewProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="status" value="rechazado" /><button className={btnTiny} type="submit">Rechazar</button></form>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-3xl tracking-wide">Blog</h2>
        {posts.length === 0 ? <p className="text-sm text-black/50">Nada pendiente.</p> : posts.map((post) => (
          <article key={post.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <p>{post.title}</p>
            <div className="flex gap-2">
              <form action={reviewPost}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="status" value="publicado" /><button className={btnTiny} type="submit">Publicar</button></form>
              <form action={reviewPost}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="status" value="rechazado" /><button className={btnTiny} type="submit">Rechazar</button></form>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-3xl tracking-wide">Fichas</h2>
        {fichas.length === 0 ? <p className="text-sm text-black/50">Nada pendiente.</p> : fichas.map((item) => (
          <article key={String(item.id)} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <p>{String(item.full_name)} · {String(item.email)}</p>
            <form action={setApplicationStatus} className="flex gap-2">
              <input type="hidden" name="id" value={String(item.id)} />
              <input type="hidden" name="status" value="revision" />
              <button className={btnTiny} type="submit">En revisión</button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
