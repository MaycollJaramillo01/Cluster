import Link from 'next/link';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { createPost, reviewPost } from '@/lib/valux/actions';
import { listPeople, listPosts } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, PageTitle, Pill, ReviewButtons, SectionTitle, capitalize, fieldClass, reviewTone } from '@/components/dashboard/StaffUi';
import { Icon } from '@/components/ui/Icon';

const fileInput = `${fieldClass} text-sm file:mr-3 file:rounded-academy file:border-0 file:bg-academy-tint file:px-3 file:py-1 file:font-semibold file:text-academy-primary`;

export default async function BlogAdmin() {
  const [posts, people] = await Promise.all([listPosts(), listPeople()]);

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Contenido"
        title="Blog"
        description="Notas de la academia. Una nota publicada aparece en el blog público."
        action={<Link className="academy-nav academy-focus" href="/academia/blog">Ver blog <Icon name="arrow-right" size={15} /></Link>}
      />

      <details open={posts.length === 0 || undefined} className="academy-panel">
        <summary className="academy-focus flex min-h-12 cursor-pointer list-none items-center px-5 font-semibold text-academy-primary sm:px-6">Nueva nota</summary>
        <form action={createPost} className="grid gap-5 border-t border-academy-line p-5 sm:p-6 md:grid-cols-2">
          <Field label="Título" className="md:col-span-2"><input className={fieldClass} name="title" required /></Field>
          <Field label="Autor">
            <select className={fieldClass} name="author_id" defaultValue="">
              <option value="">Sin autor</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </Field>
          <Field label="Extracto" hint="Una o dos frases para la lista del blog."><input className={fieldClass} name="excerpt" /></Field>
          <Field label="Cuerpo" hint="Usa «## » para un subtítulo y «- » para una lista." className="md:col-span-2"><textarea className={fieldClass} name="body" rows={8} /></Field>
          <Field label="Enlace de la portada"><input className={fieldClass} name="cover_url" placeholder="https://" inputMode="url" /></Field>
          <Field label="O sube la portada"><input className={fileInput} name="cover" type="file" accept="image/*" /></Field>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold md:col-span-2"><input name="published" type="checkbox" className="size-4" /> Publicar directo</label>
          <HStack className="md:col-span-2"><AcademySubmit label="Crear nota" pending="Guardando…" /></HStack>
        </form>
      </details>

      <VStack as="section" gap={4} aria-labelledby="notas">
        <SectionTitle id="notas" title="Notas" description={`${posts.length} en total.`} />
        {posts.length === 0 ? <Empty title="Todavía no hay notas." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <VStack gap={1} className="min-w-0">
                  <HStack gap={3} align="center" wrap="wrap">
                    <Link className="academy-focus break-words font-semibold hover:underline hover:underline-offset-4" href={`/dashboard/cursos/blog/${post.id}`}>{post.title}</Link>
                    <Pill tone={reviewTone(post.status)}>{capitalize(post.status)}</Pill>
                  </HStack>
                  <p className="text-sm text-academy-muted">{post.author_name || 'Sin autor'}</p>
                </VStack>
                <ReviewButtons action={reviewPost} id={post.id} status={post.status} title={post.title} />
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
