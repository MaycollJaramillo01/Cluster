import { savePlan, setSubscriptionStatus } from '@/lib/valux/actions';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listPlans, listSubscriptions } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function SuscripcionAdmin() {
  const [plans, subscriptions] = await Promise.all([listPlans(), listSubscriptions()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Membresías" />
      <p className="text-sm text-black/55">
        Cada curso elige en su ficha desde qué plan queda incluido. Un plan abre los cursos de su nivel y de los niveles menores.
        Un precio nuevo aplica a las altas nuevas; las suscripciones con tarjeta ya creadas siguen con su precio.
      </p>
      <div className="grid gap-3 lg:grid-cols-3">
        {plans.map((plan) => (
          <form key={plan.id} action={savePlan} className="space-y-3 border border-black/10 bg-white p-4">
            <input type="hidden" name="id" value={plan.id} />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Nivel {plan.level}</p>
            <Field label="Nombre">
              <input className={fieldClass} name="name" required defaultValue={plan.name} />
            </Field>
            <Field label="Precio mensual (L)">
              <input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={(plan.price_cents / 100).toFixed(2)} />
            </Field>
            <Field label="Beneficios (uno por línea)">
              <textarea className={`${fieldClass} min-h-28`} name="benefits" defaultValue={plan.benefits.join('\n')} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" value="1" defaultChecked={plan.active} /> A la venta
            </label>
            <button className={btn} type="submit">Guardar</button>
          </form>
        ))}
      </div>
      <div className="space-y-2">
        {subscriptions.length === 0 ? <p className="text-sm text-black/50">Nadie está suscrito.</p> : subscriptions.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{item.name} · {item.plan_name || 'Plan completo'}</p>
              <p className="text-xs text-black/45">
                {item.email} · {item.status === 'no_renueva' ? 'no renueva' : item.status} · vence {item.current_period_end ? formatDate(item.current_period_end) : '—'}
                {item.plan_name ? ` · ${money(item.price_cents)}/mes` : ''}
              </p>
            </div>
            <form action={setSubscriptionStatus} className="flex gap-2">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="status" value={['activa', 'no_renueva'].includes(item.status) ? 'cancelada' : 'activa'} />
              <button className={btnTiny} type="submit">{['activa', 'no_renueva'].includes(item.status) ? 'Cancelar' : 'Activar'}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
