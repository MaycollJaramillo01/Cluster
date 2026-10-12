import Link from 'next/link';
import { addBlock, deleteBlock, moveBlock, publishSite } from '@/lib/crm/actions';
import { getSite, listSites } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, btnGhost, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const sites = await listSites();
  const site = params.id ? await getSite(params.id) : sites[0] ?? null;

  if (!site) {
    return (
      <Empty title="Nada que editar">
        <Link className={btn} href="/dashboard/sitios">Crear una página</Link>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title={site.name}
        action={
          <form action={publishSite}>
            <input type="hidden" name="id" value={site.id} />
            <input type="hidden" name="status" value={site.status === 'publicado' ? 'borrador' : 'publicado'} />
            <button className={btnGhost} type="submit">
              {site.status === 'publicado' ? 'Pasar a borrador' : 'Publicar'}
            </button>
          </form>
        }
      />
      <div className="flex flex-wrap gap-2">
        {sites.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/editor?id=${item.id}`}
            className={`px-3 py-1 text-sm ${item.id === site.id ? 'bg-ink text-white' : 'border border-black/10 bg-white'}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <form action={addBlock} className="space-y-3 border border-black/10 bg-white p-4">
            <input type="hidden" name="site_id" value={site.id} />
            <Field label="Bloque">
              <select className={fieldClass} name="type" defaultValue="heading">
                <option value="nav">Menú</option>
                <option value="heading">Título</option>
                <option value="text">Texto</option>
                <option value="button">Botón</option>
              </select>
            </Field>
            <Field label="Texto">
              <textarea className={fieldClass} name="text" rows={3} required />
            </Field>
            <Field label="Enlace">
              <input className={fieldClass} name="href" placeholder="/contacto" />
            </Field>
            <button className={btn} type="submit">Agregar bloque</button>
          </form>
          <ul className="space-y-2">
            {site.blocks.map((block, index) => (
              <li key={block.id} className="flex items-start justify-between gap-3 border border-black/10 bg-white p-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{block.type}</p>
                  <p className="mt-1 text-sm">{block.text}</p>
                </div>
                <div className="flex gap-1">
                  <form action={moveBlock}>
                    <input type="hidden" name="site_id" value={site.id} />
                    <input type="hidden" name="block_id" value={block.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button className={btnTiny} type="submit" disabled={index === 0}>Subir</button>
                  </form>
                  <form action={moveBlock}>
                    <input type="hidden" name="site_id" value={site.id} />
                    <input type="hidden" name="block_id" value={block.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button className={btnTiny} type="submit" disabled={index === site.blocks.length - 1}>Bajar</button>
                  </form>
                  <form action={deleteBlock}>
                    <input type="hidden" name="site_id" value={site.id} />
                    <input type="hidden" name="block_id" value={block.id} />
                    <button className={btnTiny} type="submit">Quitar</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <article className="min-h-[480px] border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-ink px-6 py-4 text-white">
            <p className="font-brand text-xs font-extrabold uppercase tracking-[0.2em]">Cluster</p>
          </div>
          <div className="space-y-6 px-6 py-8">
            {site.blocks.map((block) => {
              if (block.type === 'nav') {
                return (
                  <p key={block.id} className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/50">
                    {block.text}
                  </p>
                );
              }
              if (block.type === 'heading') {
                return <h2 key={block.id} className="font-display text-5xl leading-none tracking-wide">{block.text}</h2>;
              }
              if (block.type === 'button') {
                return (
                  <p key={block.id}>
                    <span className="inline-block bg-brand px-4 py-2 text-sm font-medium text-ink">{block.text}</span>
                  </p>
                );
              }
              return <p key={block.id} className="max-w-md text-sm leading-relaxed text-black/70">{block.text}</p>;
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
