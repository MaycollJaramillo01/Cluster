import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { buildPayouts, markPayout, saveContract } from '@/lib/valux/actions';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { periodYm } from '@/lib/valux/money';
import { paypalConfigured } from '@/lib/valux/paypal';
import { getSettings, listContracts, listPayouts } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Empty, Field, PageTitle, PayoutStatus, SectionTitle, btnSmall, fieldClass, periodLabel } from '@/components/dashboard/StaffUi';

const CONTRACTS = { general: 'General', porcentaje: 'Porcentaje propio', honorario: 'Honorario fijo' };

export default async function LiquidacionesPage() {
  const [payouts, contracts, settings] = await Promise.all([listPayouts(), listContracts(), getSettings()]);
  const paypal = paypalConfigured();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-6xl">
      <PageTitle
        eyebrow="Operación"
        title="Liquidaciones"
        description={`El cálculo junta lo que corresponde a cada vendedor en el mes. La fecha de pago es el día 10 del mes siguiente. ${paypal
          ? 'Con las claves de PayPal cargadas, el botón envía el dinero al correo del vendedor.'
          : 'Cuando se carguen las claves de PayPal, el botón enviará el dinero. Mientras tanto solo deja el registro como transferida.'}`}
      />

      <form action={buildPayouts} className="academy-panel grid items-end gap-4 p-5 sm:grid-cols-[theme(spacing.56)_auto] sm:justify-start sm:p-6">
        <Field label="Periodo (año-mes)"><input className={fieldClass} name="period" defaultValue={periodYm()} pattern="\d{4}-\d{2}" inputMode="numeric" /></Field>
        <AcademySubmit label="Calcular liquidaciones" pending="Calculando…" />
      </form>

      <VStack as="section" gap={4} aria-labelledby="pagos">
        <SectionTitle id="pagos" title="Pagos a vendedores" />
        {payouts.length === 0 ? <Empty title="Todavía no hay liquidaciones.">Calcula un periodo para ver cuánto le toca a cada vendedor.</Empty> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {payouts.map((item) => (
              <li key={item.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                <VStack gap={1} className="min-w-0">
                  <HStack gap={3} align="center" wrap="wrap">
                    <p className="font-semibold">{item.name}</p>
                    <PayoutStatus status={item.status} />
                  </HStack>
                  <p className="text-sm text-academy-muted">{periodLabel(item.period_ym)} · vence el {formatDate(item.due_at)}{item.paypal_email ? ` · ${item.paypal_email}` : ''}</p>
                  {item.notes ? <p className="text-sm text-academy-muted">{item.notes}</p> : null}
                  {item.detail ? <p className="text-xs text-academy-muted">{item.detail}</p> : null}
                </VStack>
                <HStack gap={4} align="center" justify="between" className="sm:justify-end">
                  <p className="font-academy-heading text-xl font-bold tabular-nums">{money(item.amount_cents)}</p>
                  {item.status === 'pendiente' ? (
                    <form action={markPayout}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className={btnSmall} type="submit">{paypal ? 'Enviar por PayPal' : 'Marcar transferida'}<small className="sr-only"> a {item.name}</small></button>
                    </form>
                  ) : null}
                </HStack>
              </li>
            ))}
          </ul>
        )}
      </VStack>

      <VStack as="section" gap={4} aria-labelledby="contratos">
        <SectionTitle
          id="contratos"
          title="Contratos"
          description={`General usa la comisión de ajustes (${settings.commission_percent}%). Porcentaje fija la comisión de la academia para esa persona. Honorario paga un fijo cada mes y las ventas quedan en la academia. Un reembolso de una venta ya pagada se descuenta en la liquidación del mes del reembolso, salvo que el contrato diga que lo absorbe la academia.`}
        />
        {contracts.length === 0 ? <Empty title="No hay profesores ni asociados todavía." /> : (
          <ul className="academy-panel divide-y divide-academy-line overflow-hidden">
            {contracts.map((person) => (
              <li key={person.id}>
                <details>
                  <summary className="academy-focus flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-academy-page sm:px-5">
                    <VStack gap={0} className="min-w-0">
                      <strong className="font-semibold">{person.name}</strong>
                      <small className="break-all text-sm text-academy-muted">{person.email}</small>
                    </VStack>
                    <HStack gap={3} align="center">
                      <small className="text-sm text-academy-muted">{CONTRACTS[person.kind]}{person.kind === 'porcentaje' && person.percent != null ? ` · ${person.percent}%` : ''}{person.kind === 'honorario' && person.fee_cents ? ` · ${money(person.fee_cents)}/mes` : ''}</small>
                      <small className="text-sm font-semibold text-academy-primary">Editar</small>
                    </HStack>
                  </summary>
                  <form action={saveContract} className="grid gap-5 border-t border-academy-line bg-academy-page p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                    <input type="hidden" name="id" value={person.id} />
                    <Field label="Tipo">
                      <select className={fieldClass} name="kind" defaultValue={person.kind}>
                        <option value="general">General</option>
                        <option value="porcentaje">Porcentaje propio</option>
                        <option value="honorario">Honorario fijo</option>
                      </select>
                    </Field>
                    <Field label="Comisión academia (%)"><input className={fieldClass} name="percent" type="number" min="0" max="100" defaultValue={person.percent ?? ''} /></Field>
                    <Field label="Honorario mensual (L)"><input className={fieldClass} name="fee" inputMode="decimal" defaultValue={person.fee_cents ? (person.fee_cents / 100).toFixed(2) : ''} /></Field>
                    <Field label="Reembolsos">
                      <select className={fieldClass} name="refund" defaultValue={person.refund}>
                        <option value="descontar">Se descuentan al profesor</option>
                        <option value="academia">Los absorbe la academia</option>
                      </select>
                    </Field>
                    <Field label="Notas del contrato" className="sm:col-span-2 lg:col-span-4"><input className={fieldClass} name="terms" defaultValue={person.terms} /></Field>
                    <HStack className="sm:col-span-2 lg:col-span-4"><AcademySubmit label="Guardar contrato" pending="Guardando…" /></HStack>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </VStack>
  );
}
