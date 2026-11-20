import { saveSettings } from '@/lib/valux/actions';
import { getSettings } from '@/lib/valux/data';
import { Field, PageTitle, btn, fieldClass } from '@/components/dashboard/ui';

export default async function ComisionPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <PageTitle title="Comisión" />
      <form action={saveSettings} className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <Field label="Comisión %">
          <input className={fieldClass} name="commission" type="number" min="0" max="100" defaultValue={settings.commission_percent} />
        </Field>
        <Field label="Datos para transferencia (banco, cuenta, titular)">
          <textarea className={fieldClass} name="bank" rows={4} defaultValue={settings.bank_details} placeholder={'Banco Atlántida\nCuenta de ahorro 0000000000\nA nombre de Cluster Media'} />
        </Field>
        <button className={btn} type="submit">Guardar</button>
      </form>
    </div>
  );
}
