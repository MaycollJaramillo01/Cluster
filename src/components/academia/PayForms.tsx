'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { buySubscription, donate } from '@/lib/valux/actions';
import { academyMoney } from '@/lib/valux/money';
import { Icon } from '@/components/ui/Icon';
import { Checkout, payNote, type PayOptions } from './ui';

type Plan = { id: string; name: string; price_cents: number; benefits: string[] };
type Contact = { name: string; email: string };
const initial = { attempt: 0, error: undefined as string | undefined, name: '', email: '', method: '', plan: '', monthly: '', months: '' };
const step = 'grid size-7 shrink-0 place-items-center rounded-academy bg-academy-deep text-xs font-bold text-white';

// Lleva el foco al error para que se lea al volver del servidor.
function useErrorFocus(state: typeof initial) {
  const region = useRef<HTMLElement>(null);
  useEffect(() => {
    if (state.error) region.current?.querySelector<HTMLElement>('[data-checkout-error]')?.focus();
  }, [state.attempt, state.error]);
  return region;
}

function feedback(state: typeof initial) {
  return state.attempt ? { error: state.error, coupon: '', method: state.method, bump: false } : undefined;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <HStack justify="between" gap={3} className={strong ? 'border-t border-academy-line pt-4' : ''}>
      <dt className={strong ? 'font-semibold' : 'text-academy-muted'}>{label}</dt>
      <dd className={strong ? 'text-2xl font-bold tabular-nums' : 'text-right font-semibold tabular-nums'}>{value}</dd>
    </HStack>
  );
}

export function SubscriptionForm({ plans, pay, contact }: { plans: Plan[]; pay: PayOptions | null; contact?: Contact }) {
  const [state, action] = useActionState(buySubscription, initial);
  const [chosen, setChosen] = useState(plans[0]?.id || '');
  const region = useErrorFocus(state);
  const plan = plans.find((entry) => entry.id === chosen) || plans[0];
  const paid = plan.price_cents > 0;

  return (
    <section ref={region} aria-label="Contratar membresía" className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-4 flex items-center gap-3 text-lg font-bold text-academy-ink"><strong aria-hidden="true" className={step}>1</strong>Elige tu plan</legend>
        <section className="grid gap-4 md:grid-cols-3">
          {plans.map((entry) => (
            <label key={entry.id} className="academy-panel flex cursor-pointer flex-col gap-4 p-5 transition-colors hover:border-academy-ink has-[:checked]:border-academy-action has-[:checked]:bg-academy-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-academy-action sm:p-6">
              <HStack as="span" justify="between" align="center" gap={3}>
                <strong className="font-academy-heading text-lg font-bold">{entry.name}</strong>
                <input type="radio" name="plan" value={entry.id} form="membresia" required aria-label={`${entry.name}, ${entry.price_cents > 0 ? `${academyMoney(entry.price_cents)} al mes` : "gratis"}`} checked={entry.id === plan.id} onChange={() => setChosen(entry.id)} className="h-5 w-5 shrink-0 accent-academy-deep" />
              </HStack>
              <strong className="text-4xl font-bold tabular-nums tracking-tight">
                {entry.price_cents > 0 ? academyMoney(entry.price_cents) : 'Gratis'}
                {entry.price_cents > 0 ? <small className="text-base font-medium text-academy-muted"> /mes</small> : null}
              </strong>
              {entry.benefits.length ? (
                <ul className="space-y-2 border-t border-academy-line pt-4 text-sm">
                  {entry.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-academy-primary" aria-hidden="true" />{benefit}</li>
                  ))}
                </ul>
              ) : null}
            </label>
          ))}
        </section>
      </fieldset>
      <section className="academy-panel grid gap-8 p-5 sm:p-8 lg:grid-cols-[2fr_3fr]">
        <VStack as="aside" gap={4} aria-label="Resumen de la membresía" className="rounded-academy bg-academy-page p-5 lg:self-start">
          <Heading level={2} className="text-lg font-bold">Resumen</Heading>
          <dl className="space-y-3 text-sm">
            <Row label="Plan" value={plan.name} />
            <Row label="Frecuencia" value="Mensual" />
            <Row label="Total mensual" value={paid ? academyMoney(plan.price_cents) : 'Gratis'} strong />
          </dl>
          <p className="text-xs leading-relaxed text-academy-muted">Cancela la renovación cuando quieras. El acceso se mantiene hasta el final del período pagado.</p>
        </VStack>
        {paid && !pay ? (
          <p role="status" className="academy-notice self-start">{payNote('pasarela')}</p>
        ) : (
          <Checkout key={state.attempt} id="membresia" start={2} action={action} label="Suscribirme" pay={paid ? pay || undefined : undefined} contact={state.attempt ? state : contact} feedback={feedback(state)} />
        )}
      </section>
    </section>
  );
}

const AMOUNTS = [10, 50, 100];
const MONTHS = [1, 3, 6, 12];

export function DonationForm({ pay, contact }: { pay: PayOptions; contact?: Contact }) {
  const [state, action] = useActionState(donate, initial);
  const [monthly, setMonthly] = useState(state.monthly || '10');
  const [months, setMonths] = useState(state.months || '1');
  const region = useErrorFocus(state);
  const monthlyCents = Math.max(0, Math.round(Number(monthly.replace(',', '.')) * 100) || 0);
  const count = Math.max(1, Math.min(24, Math.floor(Number(months)) || 1));
  const chip = 'academy-filter min-w-16 aria-pressed:border-academy-action aria-pressed:bg-academy-tint aria-pressed:text-academy-primary';

  return (
    <section ref={region} aria-label="Formulario de donación" className="grid items-start gap-6 lg:grid-cols-[1fr_theme(spacing.80)]">
      <VStack gap={8} className="academy-panel p-5 sm:p-8">
        <fieldset className="space-y-6">
          <legend className="mb-4 flex items-center gap-3 text-base font-bold text-academy-ink"><strong aria-hidden="true" className={step}>1</strong>Tu aporte</legend>
          <VStack gap={3}>
            <label className="block space-y-2 text-sm font-semibold">Aporte mensual (L)
              <input name="monthly" form="apoyo" type="number" inputMode="decimal" min="1" step="0.01" required value={monthly} onChange={(event) => setMonthly(event.target.value)} className="academy-field block w-full" />
            </label>
            <HStack gap={2} wrap="wrap" role="group" aria-label="Montos sugeridos">
              {AMOUNTS.map((amount) => <button key={amount} type="button" aria-pressed={Number(monthly) === amount} onClick={() => setMonthly(String(amount))} className={chip}>L {amount}</button>)}
            </HStack>
          </VStack>
          <VStack gap={3}>
            <label className="block space-y-2 text-sm font-semibold">Meses
              <input name="months" form="apoyo" type="number" inputMode="numeric" min="1" max="24" required value={months} onChange={(event) => setMonths(event.target.value)} aria-describedby="meses-ayuda" className="academy-field block w-full" />
            </label>
            <small id="meses-ayuda" className="-mt-1 block text-xs text-academy-muted">De 1 a 24 meses.</small>
            <HStack gap={2} wrap="wrap" role="group" aria-label="Meses sugeridos">
              {MONTHS.map((value) => <button key={value} type="button" aria-pressed={Number(months) === value} onClick={() => setMonths(String(value))} className={chip}>{value === 1 ? '1 mes' : `${value} meses`}</button>)}
            </HStack>
          </VStack>
        </fieldset>
        <Checkout key={state.attempt} id="apoyo" start={2} action={action} label="Continuar al pago" pay={pay} contact={state.attempt ? state : contact} feedback={feedback(state)} />
      </VStack>
      <VStack as="aside" gap={4} aria-label="Resumen del aporte" className="academy-panel p-5 sm:p-6 lg:sticky lg:top-24">
        <Heading level={2} className="text-lg font-bold">Resumen</Heading>
        <dl className="space-y-3 text-sm" aria-live="polite">
          <Row label="Aporte mensual" value={academyMoney(monthlyCents)} />
          <Row label="Meses" value={String(count)} />
          <Row label="Total" value={academyMoney(monthlyCents * count)} strong />
        </dl>
        <p className="text-xs leading-relaxed text-academy-muted">Se cobra una sola vez por el total. La donación queda en el registro de la junta.</p>
      </VStack>
    </section>
  );
}
