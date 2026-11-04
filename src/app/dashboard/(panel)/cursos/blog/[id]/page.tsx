import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updatePost } from '@/lib/valux/actions';
import { getPost } from '@/lib/valux/data';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <PageTitle title={post.title} action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/dashboard/cursos/blog">Volver</Link>} />
      <form action={updatePost} className="max-w-2xl space-y-3 border border-black/10 bg-white p-4">
        <input type="hidden" name="id" value={post.id} />
        <Field label="Título"><input className={fieldClass} name="title" defaultValue={post.title} required /></Field>
        <Field label="Extracto"><input className={fieldClass} name="excerpt" defaultValue={post.excerpt} /></Field>
        <Field label="Cuerpo"><textarea className={fieldClass} name="body" rows={12} defaultValue={post.body} /></Field>
        <Field label="Portada"><input className={fieldClass} name="cover_url" defaultValue={post.cover_url} /></Field>
        <Field label="O sube la portada"><input className={fieldClass} name="cover" type="file" accept="image/*" /></Field>
        <button className={btn} type="submit">Guardar</button>
      </form>
    </div>
  );
}
