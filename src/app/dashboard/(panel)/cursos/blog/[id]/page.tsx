import { notFound } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { updatePost } from '@/lib/valux/actions';
import { getPost } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Cover } from '@/components/academia/ui';
import { Field, PageTitle, fieldClass } from '@/components/dashboard/StaffUi';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-3xl">
      <PageTitle back={{ href: '/dashboard/cursos/blog', label: 'Blog' }} eyebrow="Editar nota" title={post.title} />
      <form action={updatePost} className="academy-panel">
        <input type="hidden" name="id" value={post.id} />
        <VStack gap={5} className="p-5 sm:p-6">
          <Field label="Título"><input className={fieldClass} name="title" defaultValue={post.title} required /></Field>
          <Field label="Extracto" hint="Una o dos frases para la lista del blog."><input className={fieldClass} name="excerpt" defaultValue={post.excerpt} /></Field>
          <Field label="Cuerpo" hint="Usa «## » para un subtítulo y «- » para una lista."><textarea className={fieldClass} name="body" rows={14} defaultValue={post.body} /></Field>
          {post.cover_url ? <figure className="max-w-xs overflow-hidden rounded-academy"><Cover url={post.cover_url} title={post.title} /></figure> : null}
          <Field label="Enlace de la portada"><input className={fieldClass} name="cover_url" defaultValue={post.cover_url} inputMode="url" /></Field>
          <Field label="O sube la portada"><input className={`${fieldClass} text-sm file:mr-3 file:rounded-academy file:border-0 file:bg-academy-tint file:px-3 file:py-1 file:font-semibold file:text-academy-primary`} name="cover" type="file" accept="image/*" /></Field>
        </VStack>
        <VStack className="rounded-b-academy-lg border-t border-academy-line bg-academy-page px-5 py-4 sm:px-6">
          <AcademySubmit label="Guardar nota" pending="Guardando…" />
        </VStack>
      </form>
    </VStack>
  );
}
