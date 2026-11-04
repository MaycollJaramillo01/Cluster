import { saveSettings, setSubscriptionStatus } from '@/lib/valux/actions';
import { formatDate, money } from '@/lib/crm/format';
import { getSettings, listSubscriptions } from '@/lib/valux/data';
import { Field, PageTitle, btn, btnTiny, fieldClass } from '@/components/dashboard/ui';

export default async function SuscripcionAdmin() {
  const [settings, subscriptions] = await Promise.all([getSettings(), listSubscriptions()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Suscripción" />
      <form action={saveSettings} className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <Field label="Precio mensual USD">
          <input className={fieldClass} name="subscription" type="number" min="0" step="0.01" defaultValue={(settings.subscription_cents / 100).toFixed(2)} />
        </Field>
        <input type="hidden" name="commission" value={settings.commission_percent} />
        <button className={btn} type="submit">Guardar precio</button>
      </form>
      <div className="space-y-2">
        {subscriptions.length === 0 ? <p className="text-sm text-black/50">Nadie está suscrito.</p> : subscriptions.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-black/45">{item.email} · {item.status} · vence {item.current_period_end ? formatDate(item.current_period_end) : '—'} · {money(settings.subscription_cents)}</p>
            </div>
            <form action={setSubscriptionStatus} className="flex gap-2">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="status" value={item.status === 'activa' ? 'cancelada' : 'activa'} />
              <button className={btnTiny} type="submit">{item.status === 'activa' ? 'Cancelar' : 'Activar'}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
