import { buildPayouts, markPayout } from '@/lib/valux/actions';
import { formatDate, money } from '@/lib/crm/format';
import { periodYm } from '@/lib/valux/money';
import { paypalConfigured } from '@/lib/valux/paypal';
import { listPayouts } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function LiquidacionesPage() {
  const payouts = await listPayouts();

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
    </div>
  );
}
