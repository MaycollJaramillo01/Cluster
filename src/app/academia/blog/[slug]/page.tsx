import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/valux/data';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45"><Link href="/academia/blog">Blog</Link></p>
      <h1 className="font-display text-5xl tracking-wide">{post.title}</h1>
      {post.author_name ? <p className="text-sm text-black/50">{post.author_name}</p> : null}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/75">{post.body}</p>
    </article>
  );
}
