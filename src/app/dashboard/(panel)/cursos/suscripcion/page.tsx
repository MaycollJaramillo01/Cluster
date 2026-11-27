import { Grid } from '@astryxdesign/core/Grid';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { savePlan, setSubscriptionStatus } from '@/lib/valux/actions';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { listPlans, listSubscriptions } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, PageTitle, Pill, SectionTitle, btnSmall, capitalize, fieldClass } from '@/components/dashboard/StaffUi';

const STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'off' }> = {
  activa: { label: 'Activa', tone: 'ok' },
  no_renueva: { label: 'No se renueva', tone: 'wait' },
  cancelada: { label: 'Cancelada', tone: 'off' },
};

export default async function SuscripcionAdmin() {
  const [plans, subscriptions] = await Promise.all([listPlans(), listSubscriptions()]);

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Operación"
        title="Membresías"
        description="Cada curso elige en su ficha desde qué plan queda incluido. Un plan abre los cursos de su nivel y de los niveles menores. Un precio nuevo aplica a las altas nuevas; las suscripciones con tarjeta ya creadas siguen con su precio."
      />

      <VStack as="section" gap={4} aria-labelledby="planes">
        <SectionTitle id="planes" title="Planes" />
        <Grid columns={{ minWidth: 260, max: 3 }} gap={4}>
          {plans.map((plan) => (
            <form key={plan.id} action={savePlan} className="academy-panel flex flex-col gap-5 p-5" aria-label={`Plan ${plan.name}`}>
              <input type="hidden" name="id" value={plan.id} />
              <HStack gap={2} align="center" justify="between">
                <Pill tone="wait">Nivel {plan.level}</Pill>
                <Pill tone={plan.active ? 'ok' : 'off'}>{plan.active ? 'A la venta' : 'Fuera de venta'}</Pill>
              </HStack>
              <Field label="Nombre"><input className={fieldClass} name="name" required defaultValue={plan.name} /></Field>
              <Field label="Precio mensual (L)"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={(plan.price_cents / 100).toFixed(2)} /></Field>
              <Field label="Beneficios" hint="Uno por línea."><textarea className={fieldClass} rows={4} name="benefits" defaultValue={plan.benefits.join('\n')} /></Field>
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" value="1" defaultChecked={plan.active} className="size-4" /> A la venta</label>
              <HStack className="mt-auto"><AcademySubmit label="Guardar plan" pending="Guardando…" /></HStack>
            </form>
          ))}
        </Grid>
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="suscripciones">
        <SectionTitle id="suscripciones" title="Suscripciones" description={`${subscriptions.length} en total.`} />
        {subscriptions.length === 0 ? <Empty title="Nadie está suscrito." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {subscriptions.map((item) => {
              const status = STATUS[item.status] || { label: capitalize(item.status.replace('_', ' ')), tone: 'wait' as const };
              const running = ['activa', 'no_renueva'].includes(item.status);
              return (
                <li key={item.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <VStack gap={1} className="min-w-0">
                    <HStack gap={3} align="center" wrap="wrap">
                      <p className="break-words font-semibold">{item.name}</p>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </HStack>
                    <p className="break-all text-sm text-academy-muted">{item.email}</p>
                    <p className="text-sm">{item.plan_name || 'Plan completo'}{item.plan_name ? ` · ${money(item.price_cents)}/mes` : ''} · vence el {item.current_period_end ? formatDate(item.current_period_end) : '—'}</p>
                  </VStack>
                  <form action={setSubscriptionStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={running ? 'cancelada' : 'activa'} />
                    <button className={`${btnSmall} ${running ? 'text-red-800' : ''}`} type="submit">{running ? 'Cancelar' : 'Activar'}<small className="sr-only"> la suscripción de {item.name}</small></button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
