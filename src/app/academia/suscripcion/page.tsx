import { Page, PayMethod, payNote, payReady } from '@/components/academia/ui';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { buySubscription, cancelMySubscription } from '@/lib/valux/actions';
import { listPlans, personSubscription } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { paymentOptions } from '@/lib/valux/transfers';

const label = 'block space-y-2 text-sm font-semibold';
const input = 'academy-field block w-full';

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
    <Page className="max-w-5xl gap-6">
      <header className="academy-hero space-y-3 rounded-academy-xl p-6 text-white sm:p-9">
        <Heading level={1} className="text-4xl font-bold text-white sm:text-5xl">Membresías</Heading>
        <p className="max-w-prose text-white/80">
          Pago mensual en lempiras. Cancela cuando quieras.
          El acceso se mantiene hasta el final del período pagado.
        </p>
      </header>
      {query.ok ? <p className="text-sm text-brand">Membresía activa.</p> : null}
      {query.cancelada ? <p className="text-sm">Listo, no se va a renovar.</p> : null}
      {query.error === 'cancelar' ? <p className="text-sm">No se pudo cancelar en la pasarela. Prueba de nuevo o escríbenos.</p> : null}
      {query.error === 'plan' ? <p className="text-sm">Elige un plan.</p> : null}
      {query.error && !['cancelar', 'plan'].includes(query.error) ? <p className="text-sm">{payNote(query.error)}</p> : null}

      {current ? (
        <section className="academy-panel max-w-md space-y-3 p-5 text-sm">
          <p className="font-medium">Plan {current.plan_name || 'completo'}</p>
          <p>
            {current.status === 'activa'
              ? `Tu membresía está activa. Próxima renovación: ${formatDate(current.current_period_end)}.`
              : `No se va a renovar. Tienes los beneficios hasta el ${formatDate(current.current_period_end)}.`}
          </p>
          {current.status === 'activa' && current.gateway_id ? (
            <form action={cancelMySubscription}>
              <button className="academy-action academy-action-secondary" type="submit">Cancelar renovación</button>
            </form>
          ) : null}
        </section>
      ) : plans.length === 0 ? (
        <p className="text-sm text-black/60">Todavía no hay planes disponibles.</p>
      ) : (
        <form action={buySubscription} className="space-y-5">
          <fieldset className="grid gap-3 md:grid-cols-3">
            <legend className="sr-only">Plan</legend>
            {plans.map((plan) => (
              <label
                key={plan.id}
                className="academy-panel flex cursor-pointer flex-col gap-3 p-5 has-[:checked]:border-academy-primary has-[:checked]:bg-academy-tint"
              >
                <HStack as="span" gap={2} align="center">
                  <input type="radio" name="plan" value={plan.id} required />
                  <strong>{plan.name}</strong>
                </HStack>
                <strong className="text-4xl font-bold tracking-tight">
                  {money(plan.price_cents)}<small className="text-base font-medium text-academy-muted"> /mes</small>
                </strong>
                <ul className="space-y-1 text-sm text-black/70">
                  {plan.benefits.map((benefit) => <li key={benefit}>· {benefit}</li>)}
                </ul>
              </label>
            ))}
          </fieldset>
          {paid && !payReady(pay) ? (
            <p className="max-w-md border border-black/10 bg-white p-4 text-sm leading-relaxed">{payNote('pasarela')}</p>
          ) : (
          <section className="academy-panel max-w-md space-y-4 p-5">
            <label className={label}>Nombre
              <input name="name" required className={input} />
            </label>
            <label className={label}>Correo
              <input name="email" type="email" required className={input} />
            </label>
            {paid ? <PayMethod options={pay} /> : null}
            <AcademySubmit label="Suscribirme" pending="Procesando…" fullWidth />
          </section>
          )}
        </form>
      )}
    </Page>
  );
}
