import { VStack } from '@astryxdesign/core/VStack';
import { saveSettings } from '@/lib/valux/actions';
import { getSettings } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { Field, PageTitle, fieldClass } from '@/components/dashboard/StaffUi';

export default async function ComisionPage() {
  const settings = await getSettings();

  return (
    <VStack gap={8} className="mx-auto w-full max-w-3xl">
      <PageTitle eyebrow="Operación" title="Comisión" description="La parte de cada venta que se queda la academia y los datos que ven los compradores para pagar por transferencia." />
      <form action={saveSettings} className="academy-panel">
        <VStack gap={6} className="p-5 sm:p-6">
          <Field label="Comisión de la academia (%)" hint="Se aplica a los vendedores con contrato general." className="max-w-xs">
            <input className={fieldClass} name="commission" type="number" min="0" max="100" defaultValue={settings.commission_percent} />
          </Field>
          <Field label="Datos para transferencia (banco, cuenta, titular)" hint="Aparecen en la página de pago de cada transferencia.">
            <textarea className={fieldClass} name="bank" rows={5} defaultValue={settings.bank_details} placeholder={'Banco Atlántida\nCuenta de ahorro 0000000000\nA nombre de Cluster Media'} />
          </Field>
        </VStack>
        <VStack className="rounded-b-academy-lg border-t border-academy-line bg-academy-page px-5 py-4 sm:px-6">
          <AcademySubmit label="Guardar" pending="Guardando…" />
        </VStack>
      </form>
    </VStack>
  );
}
