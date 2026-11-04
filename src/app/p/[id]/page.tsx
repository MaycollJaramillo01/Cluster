import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/crm/queries';

export default async function PublishedSite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site || site.status !== 'publicado') notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <p className="font-brand text-xs font-extrabold uppercase tracking-[0.2em]">Cluster</p>
      <div className="mt-8 space-y-6">
        {site.blocks.length === 0 ? <h1 className="font-display text-5xl tracking-wide">{site.name}</h1> : null}
        {site.blocks.map((block) => {
          if (block.type === 'nav') {
            return <p key={block.id} className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/50">{block.text}</p>;
          }
          if (block.type === 'heading') {
            return <h1 key={block.id} className="font-display text-6xl leading-none tracking-wide">{block.text}</h1>;
          }
          if (block.type === 'button') {
            const href = block.href || '#';
            return (
              <p key={block.id}>
                <Link className="inline-block bg-brand px-4 py-2 text-sm font-medium text-ink" href={href}>{block.text}</Link>
              </p>
            );
          }
          return <p key={block.id} className="max-w-xl text-sm leading-relaxed text-black/70">{block.text}</p>;
        })}
      </div>
    </main>
  );
}
