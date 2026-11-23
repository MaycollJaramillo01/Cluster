import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Icon } from '@/components/ui/Icon';
import { Page } from '@/components/academia/ui';
import { subscribeNewsletter } from '@/lib/valux/actions';
import { listPosts } from '@/lib/valux/data';

export default async function BlogIndex() {
  const posts = (await listPosts('publicado'));

  return (
    <Page className="gap-6">
      <Heading level={1} className="academy-title">Blog</Heading>
      <section className="grid gap-6 lg:grid-cols-3">
        <VStack gap={0} className="academy-panel divide-y divide-academy-line lg:col-span-2">
          {posts.length === 0 ? <p className="p-6 text-academy-muted">No hay notas publicadas.</p> : posts.map((post) => (
            <Link key={post.id} href={`/academia/blog/${post.slug}`} className="academy-focus group flex items-center gap-4 p-5 hover:bg-academy-tint sm:p-6">
              <VStack gap={2} className="min-w-0 flex-1">
                <Heading level={2} className="break-words text-2xl font-bold">{post.title}</Heading>
                <p className="break-words text-sm leading-relaxed text-academy-muted">{post.excerpt}</p>
              </VStack>
              <Icon name="arrow-right" size={19} className="shrink-0 text-academy-primary" />
            </Link>
          ))}
        </VStack>
        <form action={subscribeNewsletter} className="academy-panel self-start bg-academy-tint p-5 sm:p-6">
          <VStack gap={4}>
            <Heading level={2} className="text-xl font-bold">Boletín de Academia</Heading>
            <label className="space-y-2 text-sm font-semibold">Correo para el boletín
              <input name="email" type="email" autoComplete="email" required className="academy-field block w-full" />
            </label>
            <AcademySubmit label="Suscribirme" pending="Enviando…" fullWidth />
          </VStack>
        </form>
      </section>
    </Page>
  );
}
