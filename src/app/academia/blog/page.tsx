import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { NewsletterForm } from '@/components/academia/NewsletterForm';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { listPosts } from '@/lib/valux/data';

export default async function BlogIndex() {
  const posts = await listPosts('publicado');
  const [latest, ...rest] = posts;
  const byline = (post: (typeof posts)[number]) => [post.author_name, formatDate(post.published_at || post.created_at)].filter(Boolean).join(' · ');

  return (
    <main className="academy-page max-w-6xl space-y-8">
      <VStack as="header" gap={2}>
        <p className="text-sm font-semibold text-academy-primary">Blog</p>
        <Heading level={1} className="academy-title">Notas de la Academia</Heading>
      </VStack>
      <section className="grid items-start gap-8 lg:grid-cols-[1fr_theme(spacing.80)]">
        {latest ? (
          <VStack gap={6} className="min-w-0">
            <article className="academy-panel p-6 sm:p-10">
              <VStack gap={4}>
                <p className="text-sm font-semibold text-academy-muted">Lo más reciente · {byline(latest)}</p>
                <Heading level={2} className="break-words text-3xl font-bold leading-tight sm:text-4xl">
                  <Link href={`/academia/blog/${latest.slug}`} className="academy-focus rounded-academy hover:underline hover:underline-offset-4">{latest.title}</Link>
                </Heading>
                {latest.excerpt ? <p className="max-w-prose text-lg leading-relaxed text-academy-muted">{latest.excerpt}</p> : null}
                <Link href={`/academia/blog/${latest.slug}`} aria-hidden="true" tabIndex={-1} className="flex w-fit items-center gap-2 text-sm font-semibold text-academy-primary">Leer la nota <Icon name="arrow-right" size={16} /></Link>
              </VStack>
            </article>
            {rest.length ? (
              <ul aria-label="Más notas" className="academy-panel divide-y divide-academy-line overflow-hidden">
                {rest.map((post) => (
                  <li key={post.id} className="grid gap-2 p-5 sm:grid-cols-[theme(spacing.32)_1fr] sm:gap-6 sm:p-6">
                    <time dateTime={post.published_at || post.created_at} className="text-sm text-academy-muted sm:pt-1">{formatDate(post.published_at || post.created_at)}</time>
                    <VStack gap={2} className="min-w-0">
                      <Heading level={2} className="break-words text-xl font-bold">
                        <Link href={`/academia/blog/${post.slug}`} className="academy-focus rounded-academy hover:underline hover:underline-offset-4">{post.title}</Link>
                      </Heading>
                      {post.excerpt ? <p className="text-sm leading-relaxed text-academy-muted">{post.excerpt}</p> : null}
                      {post.author_name ? <p className="text-xs font-semibold text-academy-muted">{post.author_name}</p> : null}
                    </VStack>
                  </li>
                ))}
              </ul>
            ) : null}
          </VStack>
        ) : (
          <p className="academy-panel p-6 text-academy-muted">Todavía no hay notas publicadas.</p>
        )}
        <VStack gap={4} className="lg:sticky lg:top-24">
          <NewsletterForm />
        </VStack>
      </section>
    </main>
  );
}
