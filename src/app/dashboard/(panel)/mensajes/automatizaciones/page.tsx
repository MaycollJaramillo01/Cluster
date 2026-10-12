import Link from 'next/link';
import { createAutomation, deleteAutomation } from '@/lib/crm/actions';
import { formatDate } from '@/lib/crm/format';
import { listAutomations } from '@/lib/crm/queries';
import { Field, PageTitle, Rate, Table, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function AutomationsPage() {
  const automations = await listAutomations();

  return (
    <div className="space-y-6">
      <PageTitle title="Flujos" />
      <form action={createAutomation} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Meta"><input className={fieldClass} name="goal" placeholder="Agendar visita" /></Field>
        <div className="flex items-end"><button className={btn} type="submit">Crear</button></div>
      </form>
      <Table head={['Nombre', 'Estado', 'Pasos', 'Abiertos', 'Creada', '']}>
        {automations.map((automation) => (
          <tr key={automation.id} className="border-b border-black/5 last:border-0">
            <td className="px-4 py-3">
              <Link href={`/dashboard/mensajes/automatizaciones/${automation.id}`} className="font-medium hover:text-brand">{automation.name}</Link>
            </td>
            <td className="px-4 py-3 capitalize">{automation.status}</td>
            <td className="px-4 py-3">{automation.steps.length}</td>
            <td className="px-4 py-3"><Rate value={automation.opened_rate} /></td>
            <td className="px-4 py-3 text-black/45">{formatDate(automation.created_at)}</td>
            <td className="px-4 py-3">
              <form action={deleteAutomation}>
                <input type="hidden" name="id" value={automation.id} />
                <button className={btnTiny} type="submit">Eliminar</button>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
