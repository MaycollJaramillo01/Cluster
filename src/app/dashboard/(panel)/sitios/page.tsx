import Link from 'next/link';
import { createSite, deleteSite } from '@/lib/crm/actions';
import { listSites } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, Table, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const sites = await listSites(params.kind);

  return (
    <div className="space-y-6">
      <PageTitle title="Páginas" />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form action={createSite} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Nombre">
            <input className={fieldClass} name="name" required />
          </Field>
          <Field label="Tipo">
            <select className={fieldClass} name="kind" defaultValue="embudo">
              <option value="embudo">Embudo</option>
              <option value="sitio">Sitio</option>
            </select>
          </Field>
          <Field label="Ruta">
            <input className={fieldClass} name="url" placeholder="/participa" />
          </Field>
          <button className={btn} type="submit">Crear</button>
        </form>
        {sites.length === 0 ? (
          <Empty title="Sin páginas" />
        ) : (
          <Table head={['Nombre', 'Tipo', 'Estado', 'Ruta', '']}>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/editor?id=${site.id}`} className="font-medium hover:text-brand">
                    {site.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize">{site.kind}</td>
                <td className="px-4 py-3 capitalize">{site.status}</td>
                <td className="px-4 py-3 font-mono text-xs">{site.url || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteSite}>
                    <input type="hidden" name="id" value={site.id} />
                    <button className={btnTiny} type="submit">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
