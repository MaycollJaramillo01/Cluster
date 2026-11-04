import { saveSettings } from '@/lib/valux/actions';
import { getSettings } from '@/lib/valux/data';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function ComisionPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <PageTitle title="Comisión" />
      <p className="max-w-xl text-sm text-black/60">De cada curso o producto vendido, este porcentaje se queda en la academia. El resto queda para el profesor o el creador y entra en la liquidación del mes.</p>
      <form action={saveSettings} className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <Field label="Comisión %">
          <input className={fieldClass} name="commission" type="number" min="0" max="100" defaultValue={settings.commission_percent} />
        </Field>
        <Field label="Suscripción mensual USD">
          <input className={fieldClass} name="subscription" type="number" min="0" step="0.01" defaultValue={(settings.subscription_cents / 100).toFixed(2)} />
        </Field>
        <button className={btn} type="submit">Guardar</button>
      </form>
    </div>
  );
}
