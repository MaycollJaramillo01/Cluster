import { buildPayouts, markPayout, saveContract } from '@/lib/valux/actions';
import { formatDate } from '@/lib/crm/format';
import { academyMoney as money } from '@/lib/valux/money';
import { periodYm } from '@/lib/valux/money';
import { paypalConfigured } from '@/lib/valux/paypal';
import { getSettings, listContracts, listPayouts } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function LiquidacionesPage() {
  const [payouts, contracts, settings] = await Promise.all([listPayouts(), listContracts(), getSettings()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Liquidaciones" />
      <p className="max-w-2xl text-sm text-black/60">
        El cálculo junta lo que corresponde a cada vendedor en el mes. La fecha de pago es el día 10 del mes siguiente.
        {paypalConfigured()
          ? ' Con las claves de PayPal cargadas, el botón envía el dinero al correo del vendedor.'
          : ' Cuando se carguen las claves de PayPal, el botón enviará el dinero. Mientras tanto solo deja el registro como transferida.'}
      </p>
      <form action={buildPayouts} className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <Field label="Periodo"><input className={fieldClass} name="period" defaultValue={periodYm()} pattern="\d{4}-\d{2}" /></Field>
        <button className={btn} type="submit">Calcular</button>
      </form>
      <div className="space-y-2">
        {payouts.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{item.name} · {money(item.amount_cents)}</p>
              <p className="text-xs text-black/45">{item.period_ym} · {item.status} · vence {formatDate(item.due_at)}{item.paypal_email ? ` · ${item.paypal_email}` : ''}{item.notes ? ` · ${item.notes}` : ''}</p>
              {item.detail ? <p className="text-xs text-black/45">{item.detail}</p> : null}
            </div>
            {item.status === 'pendiente' ? (
              <form action={markPayout}>
                <input type="hidden" name="id" value={item.id} />
                <button className={btnTiny} type="submit">{paypalConfigured() ? 'Enviar por PayPal' : 'Marcar transferida'}</button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contratos</h2>
        <p className="max-w-2xl text-sm text-black/60">
          General usa la comisión de ajustes ({settings.commission_percent}%). Porcentaje fija la comisión de la academia para esa persona.
          Honorario paga un fijo cada mes y las ventas quedan en la academia. Un reembolso de una venta ya pagada se descuenta en la
          liquidación del mes del reembolso, salvo que el contrato diga que lo absorbe la academia.
        </p>
        {contracts.length ? null : <p className="text-sm text-black/45">No hay profesores ni asociados todavía.</p>}
        {contracts.map((person) => (
          <form key={person.id} action={saveContract} className="grid gap-3 border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
            <input type="hidden" name="id" value={person.id} />
            <p className="font-medium sm:col-span-2 lg:col-span-5">{person.name} <span className="text-xs font-normal text-black/45">{person.email}</span></p>
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
            <Field label="Notas del contrato"><input className={fieldClass} name="terms" defaultValue={person.terms} /></Field>
            <div className="sm:col-span-2 lg:col-span-5"><button className={btnTiny} type="submit">Guardar contrato</button></div>
          </form>
        ))}
      </section>
    </div>
  );
}
