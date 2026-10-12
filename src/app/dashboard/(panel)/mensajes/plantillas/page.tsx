import Link from 'next/link';
import { createTemplate, deleteTemplate } from '@/lib/crm/actions';
import { listTemplates } from '@/lib/crm/queries';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const params = await searchParams;
  const kind = params.tipo === 'biblioteca' ? 'library' : params.tipo === 'mias' ? 'mine' : '';
  const templates = await listTemplates(kind);

  return (
    <div className="space-y-6">
      <PageTitle title="Plantillas" />
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/mensajes/plantillas" className={`px-3 py-2 text-sm ${!kind ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>Todas</Link>
        <Link href="/dashboard/mensajes/plantillas?tipo=mias" className={`px-3 py-2 text-sm ${kind === 'mine' ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>Mías</Link>
        <Link href="/dashboard/mensajes/plantillas?tipo=biblioteca" className={`px-3 py-2 text-sm ${kind === 'library' ? 'bg-brand text-ink' : 'border border-black/10 bg-white'}`}>Biblioteca</Link>
      </div>
      <form action={createTemplate} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-3">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Asunto"><input className={fieldClass} name="subject" /></Field>
        <Field label="Vista previa"><input className={fieldClass} name="preview" /></Field>
        <button className={btn} type="submit">Guardar plantilla</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <article key={template.id} className="border border-black/10 bg-white p-4">
            <div className="mb-4 min-h-28 bg-ink p-4 text-white">
              <p className="font-brand text-[10px] uppercase tracking-[0.18em] text-brand">Cluster</p>
              <p className="mt-4 font-display text-3xl leading-none">{template.name}</p>
            </div>
            <p className="text-sm font-medium">{template.subject || template.name}</p>
            <p className="mt-1 text-xs text-black/50">{template.preview}</p>
            {template.kind === 'mine' ? (
              <form action={deleteTemplate} className="mt-3">
                <input type="hidden" name="id" value={template.id} />
                <button className={btnTiny} type="submit">Eliminar</button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
