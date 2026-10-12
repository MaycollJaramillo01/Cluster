import Link from 'next/link';
import { createOperator, deleteOperator } from '@/lib/crm/actions';
import { listOperators } from '@/lib/crm/queries';
import { Empty, Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function OperatorsPage() {
  const operators = await listOperators();

  return (
    <div className="space-y-6">
      <PageTitle title="Operadores" />
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form action={createOperator} className="space-y-3 border border-black/10 bg-white p-4">
          <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
          <Field label="Correo"><input className={fieldClass} name="email" type="email" /></Field>
          <button className={btn} type="submit">Crear operador</button>
        </form>
        {operators.length === 0 ? <Empty title="Sin operadores" /> : (
          <div className="space-y-3">
            {operators.map((operator) => (
              <article key={operator.id} className="flex items-center justify-between gap-3 border border-black/10 bg-white px-4 py-4">
                <div>
                  <p className="font-medium">{operator.name}</p>
                  <p className="text-xs text-black/45">{operator.email || 'Sin correo'} · Próximas: {operator.upcoming}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link className={btnTiny} href="/dashboard/citas/agenda">Ver agenda</Link>
                  <form action={deleteOperator}>
                    <input type="hidden" name="id" value={operator.id} />
                    <button className={btnTiny} type="submit">Quitar</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
