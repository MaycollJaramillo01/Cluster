import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { Cover } from '@/components/academia/ui';
import { getPostBySlug } from '@/lib/valux/data';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="academy-page max-w-3xl">
      <VStack as="article" gap={5}>
        <Link href="/academia/blog" className="academy-nav academy-focus w-fit">← Blog</Link>
        <Heading level={1} className="academy-title">{post.title}</Heading>
        {post.author_name ? <p className="text-sm font-semibold text-academy-muted">{post.author_name}</p> : null}
        {post.cover_url ? <figure className="overflow-hidden rounded-academy-lg"><Cover url={post.cover_url} title={post.title} /></figure> : null}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-academy-ink">{post.body}</p>
      </VStack>
    </main>
  );
}
