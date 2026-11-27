import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover, LessonText } from '@/components/academia/ui';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/crm/format';
import { getPostBySlug } from '@/lib/valux/data';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const date = post.published_at || post.created_at;

  return (
    <main className="academy-page max-w-3xl">
      <VStack as="article" gap={8}>
        <VStack as="header" gap={4}>
          <Link href="/academia/blog" className="academy-nav academy-focus w-fit"><Icon name="arrow-right" size={16} className="rotate-180" />Blog</Link>
          <Heading level={1} className="academy-title">{post.title}</Heading>
          {post.excerpt ? <p className="text-lg leading-relaxed text-academy-muted">{post.excerpt}</p> : null}
          <p className="text-sm font-semibold text-academy-muted">
            {post.author_name ? `${post.author_name} · ` : ''}<time dateTime={date}>{formatDate(date)}</time>
          </p>
        </VStack>
        {post.cover_url ? <figure className="overflow-hidden rounded-academy-lg"><Cover url={post.cover_url} title={post.title} /></figure> : null}
        <section className="border-t border-academy-line pt-8 [&_li]:text-lg [&_p]:text-lg">
          <LessonText text={post.body} />
        </section>
        <VStack as="footer" gap={4} className="academy-panel items-start p-6 sm:p-8">
          <Heading level={2} className="text-xl font-bold">Sigue aprendiendo</Heading>
          <p className="text-academy-muted">Lleva estas ideas a la práctica con los cursos de la Academia.</p>
          <HStack gap={3} wrap="wrap">
            <Link href="/academia" className="academy-action academy-action-primary">Ver cursos <Icon name="arrow-right" size={16} /></Link>
            <Link href="/academia/blog" className="academy-action academy-action-secondary">Volver al blog</Link>
          </HStack>
        </VStack>
      </VStack>
    </main>
  );
}
