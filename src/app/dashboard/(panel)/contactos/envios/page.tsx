import Link from 'next/link';
import { formatDateTime } from '@/lib/crm/format';
import { listFormSubmits } from '@/lib/crm/queries';
import { Empty, Mark, PageTitle } from '@/components/dashboard/ui';

export default async function SubmitsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; form?: string }>;
}) {
  const params = await searchParams;
  const [submits, allSubmits] = await Promise.all([listFormSubmits(params.form), listFormSubmits()]);
  const forms = [...new Set(allSubmits.map((item) => item.form_name))];
  const selected = submits.find((item) => item.id === params.id) || submits[0];

  return (
    <div className="space-y-6">
      <PageTitle title="Envíos" />
      {submits.length === 0 ? <Empty title="Sin envíos" /> : (
        <div className="grid min-h-[520px] border border-black/10 bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border-b border-black/10 lg:border-b-0 lg:border-r">
            <div className="border-b border-black/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{submits.length} envíos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/dashboard/contactos/envios" className={`px-2 py-1 text-xs ${!params.form ? 'bg-ink text-white' : 'bg-black/5'}`}>Todos</Link>
                {forms.map((form) => (
                  <Link key={form} href={`/dashboard/contactos/envios?form=${encodeURIComponent(form)}`} className={`px-2 py-1 text-xs ${params.form === form ? 'bg-ink text-white' : 'bg-black/5'}`}>
                    {form}
                  </Link>
                ))}
              </div>
            </div>
            <ul>
              {submits.map((submit) => (
                <li key={submit.id}>
                  <Link
                    href={`/dashboard/contactos/envios?id=${submit.id}${params.form ? `&form=${encodeURIComponent(params.form)}` : ''}`}
                    className={`flex items-center gap-3 border-b border-black/5 px-4 py-3 ${selected?.id === submit.id ? 'bg-brand/10' : 'hover:bg-black/[0.02]'}`}
                  >
                    <Mark name={submit.name} />
                    <span>
                      <span className="block text-sm font-medium">{submit.name}</span>
                      <span className="block text-xs text-black/45">{formatDateTime(submit.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {selected ? (
            <div className="px-6 py-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{formatDateTime(selected.created_at)}</p>
              {selected.contact_id ? (
                <Link href={`/dashboard/contactos/${selected.contact_id}`} className="mt-2 inline-block text-sm text-brand">
                  Abrir ficha
                </Link>
              ) : null}
              <dl className="mt-6 space-y-4">
                {[
                  ['Nombre y apellido', selected.name],
                  ['E-mail', selected.email],
                  ['Teléfono', selected.phone || '—'],
                  ['País', selected.country || '—'],
                  ['¿Tiene experiencia en ventas?', selected.sales_experience || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-black/45">{label}</dt>
                    <dd className="mt-1 border-l-2 border-brand pl-3 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
