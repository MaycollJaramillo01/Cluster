import { createSubscriber, unsubscribe } from '@/lib/crm/actions';
import { listSubscribers } from '@/lib/crm/queries';
import { Field, PageTitle, Rate, Table, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const subscribers = (await listSubscribers(params.q)).filter((item) =>
    params.estado === 'baja' ? item.status !== 'subscribed' : params.estado === 'activos' ? item.status === 'subscribed' : true,
  );

  return (
    <div className="space-y-6">
      <PageTitle title="Suscriptores" />
      <form className="flex flex-wrap gap-2" action="/dashboard/mensajes/suscriptores">
        <input className={`${fieldClass} max-w-sm`} name="q" defaultValue={params.q || ''} placeholder="Buscar" />
        <button className={btn} type="submit">Buscar</button>
      </form>
      <form action={createSubscriber} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <Field label="Nombre"><input className={fieldClass} name="name" required /></Field>
        <Field label="Correo"><input className={fieldClass} name="email" type="email" required /></Field>
        <div className="flex items-end"><button className={btn} type="submit">Agregar</button></div>
      </form>
      <Table head={['Nombre', 'Correo', 'Apertura', 'Clics', 'Estado', '']}>
        {subscribers.map((subscriber) => (
          <tr key={subscriber.id} className="border-b border-black/5 last:border-0">
            <td className="px-4 py-3 font-medium">{subscriber.name}</td>
            <td className="px-4 py-3 text-black/70">{subscriber.email}</td>
            <td className="px-4 py-3"><Rate value={subscriber.open_rate} /></td>
            <td className="px-4 py-3"><Rate value={subscriber.click_rate} /></td>
            <td className="px-4 py-3">{subscriber.status === 'subscribed' ? 'Activo' : 'Baja'}</td>
            <td className="px-4 py-3">
              {subscriber.status === 'subscribed' ? (
                <form action={unsubscribe}>
                  <input type="hidden" name="id" value={subscriber.id} />
                  <button className={btnTiny} type="submit">Dar de baja</button>
                </form>
              ) : null}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
