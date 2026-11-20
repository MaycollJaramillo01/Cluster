import { PayMethod, payNote, payReady } from '@/components/academia/ui';
import { buySubscription, cancelMySubscription } from '@/lib/valux/actions';
import { listPlans, personSubscription } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { paymentOptions } from '@/lib/valux/transfers';

const label = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45';
const input = 'w-full border border-black/15 px-3 py-2 outline-none focus:border-brand';

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; cancelada?: string }>;
}) {
  const query = await searchParams;
  const plans = await listPlans(true);
  const personId = await academiaPersonId();
  const current = personId ? await personSubscription(personId) : null;
  const pay = await paymentOptions();
  const paid = plans.some((plan) => plan.price_cents > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="max-w-2xl space-y-2">
        <h1 className="font-display text-5xl tracking-wide">Membresías</h1>
        <p className="text-sm text-black/60">
          Pago mensual en lempiras. Cancela cuando quieras.
          El acceso se mantiene hasta el final del período pagado.
        </p>
      </div>
      {query.ok ? <p className="text-sm text-brand">Membresía activa.</p> : null}
      {query.cancelada ? <p className="text-sm">Listo, no se va a renovar.</p> : null}
      {query.error === 'cancelar' ? <p className="text-sm">No se pudo cancelar en la pasarela. Prueba de nuevo o escríbenos.</p> : null}
      {query.error === 'plan' ? <p className="text-sm">Elige un plan.</p> : null}
      {query.error && !['cancelar', 'plan'].includes(query.error) ? <p className="text-sm">{payNote(query.error)}</p> : null}

      {current ? (
        <div className="max-w-md space-y-3 border border-black/10 bg-white p-4 text-sm">
          <p className="font-medium">Plan {current.plan_name || 'completo'}</p>
          <p>
            {current.status === 'activa'
              ? `Tu membresía está activa. Próxima renovación: ${formatDate(current.current_period_end)}.`
              : `No se va a renovar. Tienes los beneficios hasta el ${formatDate(current.current_period_end)}.`}
          </p>
          {current.status === 'activa' && current.gateway_id ? (
            <form action={cancelMySubscription}>
              <button className="border border-black/15 px-4 py-2 text-sm" type="submit">Cancelar renovación</button>
            </form>
          ) : null}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-sm text-black/60">Todavía no hay planes disponibles.</p>
      ) : (
        <form action={buySubscription} className="space-y-5">
          <fieldset className="grid gap-3 md:grid-cols-3">
            <legend className="sr-only">Plan</legend>
            {plans.map((plan) => (
              <label
                key={plan.id}
                className="flex cursor-pointer flex-col gap-3 border border-black/10 bg-white p-4 has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="plan" value={plan.id} required />
                  <span className="font-medium">{plan.name}</span>
                </span>
                <span className="font-display text-4xl tracking-wide">
                  {money(plan.price_cents)}<span className="text-base text-black/45"> /mes</span>
                </span>
                <ul className="space-y-1 text-sm text-black/70">
                  {plan.benefits.map((benefit) => <li key={benefit}>· {benefit}</li>)}
                </ul>
              </label>
            ))}
          </fieldset>
          {paid && !payReady(pay) ? (
            <p className="max-w-md border border-black/10 bg-white p-4 text-sm leading-relaxed">{payNote('pasarela')}</p>
          ) : (
          <div className="max-w-md space-y-3 border border-black/10 bg-white p-4">
            <label className="block text-sm">
              <span className={label}>Nombre</span>
              <input name="name" required className={input} />
            </label>
            <label className="block text-sm">
              <span className={label}>Correo</span>
              <input name="email" type="email" required className={input} />
            </label>
            {paid ? <PayMethod options={pay} /> : null}
            <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Suscribirme</button>
          </div>
          )}
        </form>
      )}
    </div>
  );
}
