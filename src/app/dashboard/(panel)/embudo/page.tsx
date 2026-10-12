import { createOpportunity, moveOpportunity } from '@/lib/crm/actions';
import { money } from '@/lib/crm/format';
import { listContacts, listOpportunities } from '@/lib/crm/queries';
import { STAGES } from '@/lib/crm/types';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const params = await searchParams;
  const [opportunities, contacts] = await Promise.all([
    listOpportunities(params.stage),
    listContacts({}),
  ]);
  const columns = params.stage ? STAGES.filter((stage) => stage.id === params.stage) : STAGES;

  return (
    <div className="space-y-6">
      <PageTitle title="Oportunidades" />
      <form action={createOpportunity} className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-5">
        <Field label="Contacto">
          <select className={fieldClass} name="contact_id" required>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </Field>
        <Field label="Título"><input className={fieldClass} name="title" required /></Field>
        <Field label="Valor USD"><input className={fieldClass} name="value" type="number" min="0" step="0.01" defaultValue="600" /></Field>
        <Field label="Etapa">
          <select className={fieldClass} name="stage" defaultValue="nuevo">
            {STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
          </select>
        </Field>
        <div className="flex items-end"><button className={btn} type="submit">Crear</button></div>
      </form>
      <div className="grid gap-3 xl:grid-cols-5">
        {columns.map((stage) => {
          const cards = opportunities.filter((item) => item.stage === stage.id);
          const total = cards.reduce((sum, card) => sum + card.value_cents, 0);
          return (
            <section key={stage.id} className="border border-black/10 bg-white">
              <header className="border-b border-black/10 px-3 py-3">
                <h2 className="font-display text-2xl tracking-wide">{stage.label}</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{cards.length} · {money(total)}</p>
              </header>
              <ul className="space-y-2 p-2">
                {cards.map((card) => (
                  <li key={card.id} className="border border-black/10 p-3">
                    <p className="text-sm font-medium">{card.title}</p>
                    <p className="text-xs text-black/50">{card.contact_name}</p>
                    <p className="mt-2 font-display text-2xl">{money(card.value_cents)}</p>
                    <form action={moveOpportunity} className="mt-2 flex gap-1">
                      <input type="hidden" name="id" value={card.id} />
                      <select className="min-w-0 flex-1 border border-black/15 px-1 py-1 text-xs" name="stage" defaultValue={card.stage}>
                        {STAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                      <button className="bg-ink px-2 text-[10px] uppercase tracking-[0.12em] text-white" type="submit">Mover</button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
