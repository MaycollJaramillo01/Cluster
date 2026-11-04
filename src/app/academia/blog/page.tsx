import Link from 'next/link';
import { Page } from '@/components/academia/ui';
import { subscribeNewsletter } from '@/lib/valux/actions';
import { listPosts } from '@/lib/valux/data';

export default async function BlogIndex() {
  const posts = (await listPosts('publicado'));

  return (
    <Page className="space-y-8">
      <h1 className="font-display text-5xl tracking-wide">Blog</h1>
      <div className="space-y-3">
        {posts.length === 0 ? <p className="text-sm text-black/50">No hay notas publicadas.</p> : posts.map((post) => (
          <Link key={post.id} href={`/academia/blog/${post.slug}`} className="block border border-black/10 bg-white p-4 hover:border-ink">
            <p className="font-display text-3xl tracking-wide">{post.title}</p>
            <p className="mt-2 text-sm text-black/60">{post.excerpt}</p>
          </Link>
        ))}
      </div>
      <form action={subscribeNewsletter} className="flex flex-wrap gap-2 border border-black/10 bg-white p-4">
        <input name="email" type="email" required placeholder="Correo para el boletín" className="min-w-64 flex-1 border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand" />
        <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Suscribirme</button>
      </form>
    </Page>
  );
}
