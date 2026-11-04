import Link from 'next/link';
import { formatDateTime } from '@/lib/crm/format';
import { listFormSubmits } from '@/lib/crm/queries';
import { Empty, Mark, PageTitle } from '@/components/dashboard/ui';

const DETAIL_LABELS: Record<string, string> = {
  empresa: 'Empresa',
  ciudad: 'Ciudad',
  departamento: 'Departamento',
  website: 'Sitio o red',
  sitioWeb: 'Sitio web',
  redesSociales: 'Redes sociales',
  servicio: 'Servicio',
  mensaje: 'Mensaje',
  origen: 'Origen',
  historia: 'Historia',
  categoria: 'Categoría',
  descripcion: 'A qué se dedica',
  productos: 'Productos o servicios',
  etapa: 'Etapa',
  logotipo: 'Logotipo',
  sinEmpresa: 'Todavía no tiene empresa',
  consentimientoDatos: 'Consentimiento de datos',
  aceptaOportunidades: 'Acepta oportunidades',
  cargo: 'Cargo',
  municipio: 'Municipio',
  redes: 'Redes',
  promover: 'Qué quiere promover',
  paquete: 'Paquete',
  puesto: 'Puesto',
  salarioUsd: 'Salario (USD)',
  portafolio: 'Portafolio',
  linkedin: 'LinkedIn',
  archivos: 'Archivos',
  identidad: 'Identidad',
  proveedor: 'Proveedor',
  respuesta: 'Respuesta',
  confirmado: 'Confirmado',
  interes: 'Interés',
  instagram: 'Instagram',
  attribution: 'Atribución',
  calculator: 'Calculadora',
  auditUrl: 'URL auditada',
  auditScore: 'Score SEO',
};

function detailLabel(key: string) {
  return DETAIL_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function DetailValue({ value }: { value: string }) {
  const lines = value.split('\n').filter((line) => line.trim());
  return (
    <dd className="mt-1 space-y-1 border-l-2 border-brand pl-3 text-sm">
      {lines.map((line, index) => {
        const link = line.match(/https?:\/\/\S+/)?.[0];
        if (!link) return <span key={`${index}-${line}`} className="block whitespace-pre-wrap">{line}</span>;
        return (
          <a key={`${index}-${link}`} href={link} target="_blank" rel="noreferrer" className="block break-all text-brand">
            {line}
          </a>
        );
      })}
    </dd>
  );
}

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
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{selected.form_name}</p>
              <p className="mt-2 text-sm text-black/45">{formatDateTime(selected.created_at)}</p>
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
                  ...(selected.sales_experience ? [['¿Tiene experiencia en ventas?', selected.sales_experience] as const] : []),
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-black/45">{label}</dt>
                    <dd className="mt-1 border-l-2 border-brand pl-3 text-sm">{value}</dd>
                  </div>
                ))}
                {Object.entries(selected.details || {}).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-black/45">{detailLabel(key)}</dt>
                    <DetailValue value={value} />
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
