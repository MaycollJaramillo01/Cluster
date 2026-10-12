import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addAutomationStep, deleteAutomationStep } from '@/lib/crm/actions';
import { getAutomation } from '@/lib/crm/queries';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

const kinds: Record<string, string> = {
  email: 'Correo',
  espera: 'Espera',
  etiqueta: 'Etiqueta',
  whatsapp: 'WhatsApp',
};

export default async function AutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automation = await getAutomation(id);
  if (!automation) notFound();

  return (
    <div className="space-y-6">
      <PageTitle title={automation.name} action={<Link className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45" href="/dashboard/mensajes/automatizaciones">Volver</Link>} />
      <p className="text-sm text-black/55">{automation.goal || 'Sin meta'} · {automation.status}</p>
      <ol className="space-y-2">
        {automation.steps.map((step, index) => (
          <li key={step.id} className="flex items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <p className="text-sm"><span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">{index + 1} {kinds[step.kind] || step.kind}</span>{step.detail}</p>
            <form action={deleteAutomationStep}>
              <input type="hidden" name="id" value={automation.id} />
              <input type="hidden" name="step_id" value={step.id} />
              <button className={btnTiny} type="submit">Quitar</button>
            </form>
          </li>
        ))}
      </ol>
      <form action={addAutomationStep} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-[180px_1fr_auto]">
        <input type="hidden" name="id" value={automation.id} />
        <Field label="Paso">
          <select className={fieldClass} name="kind" defaultValue="email">
            <option value="email">Correo</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="espera">Espera</option>
            <option value="etiqueta">Etiqueta</option>
          </select>
        </Field>
        <Field label="Detalle"><input className={fieldClass} name="detail" required placeholder="Qué pasa en este paso" /></Field>
        <div className="flex items-end"><button className={btn} type="submit">Agregar</button></div>
      </form>
    </div>
  );
}
