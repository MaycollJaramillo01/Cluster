import Link from 'next/link';
import { createPost, reviewPost } from '@/lib/valux/actions';
import { listPeople, listPosts } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function BlogAdmin() {
  const [posts, people] = await Promise.all([listPosts(), listPeople()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Blog" action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/academia/blog">Ver blog</Link>} />
      <form action={createPost} className="grid gap-3 border border-black/10 bg-white p-4">
        <Field label="Título"><input className={fieldClass} name="title" required /></Field>
        <Field label="Autor">
          <select className={fieldClass} name="author_id" defaultValue="">
            <option value="">Sin autor</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </Field>
        <Field label="Extracto"><input className={fieldClass} name="excerpt" /></Field>
        <Field label="Cuerpo"><textarea className={fieldClass} name="body" rows={6} /></Field>
        <Field label="Portada"><input className={fieldClass} name="cover_url" placeholder="https://" /></Field>
        <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
        <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" /> Publicar directo</label>
        <button className={btn} type="submit">Crear nota</button>
      </form>
      <div className="space-y-2">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <Link className="font-medium hover:text-brand" href={`/dashboard/cursos/blog/${post.id}`}>{post.title}</Link>
              <p className="text-xs text-black/45">{post.status} · {post.author_name || 'Sin autor'}</p>
            </div>
            <div className="flex gap-2">
              <form action={reviewPost}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="status" value="publicado" /><button className={btnTiny} type="submit">Publicar</button></form>
              <form action={reviewPost}><input type="hidden" name="id" value={post.id} /><input type="hidden" name="status" value="rechazado" /><button className={btnTiny} type="submit">Rechazar</button></form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
