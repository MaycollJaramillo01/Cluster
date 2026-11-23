import { PayMethod, payNote, payReady, type PayOptions } from '@/components/academia/ui';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { donate } from '@/lib/valux/actions';
import { paymentOptions } from '@/lib/valux/transfers';

export default async function ApoyarPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;
  const pay = await paymentOptions();

  return (
    <VStack as="main" gap={5} className="academy-page max-w-xl">
      <Heading level={1} className="academy-title">Apoyar</Heading>
      <p className="text-academy-muted">Una donación mensual, por los meses que elijas. Queda en el registro de la junta.</p>
      {query.ok ? <p role="status" className="academy-notice">Donación registrada.</p> : null}
      {query.error ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}
      {!payReady(pay) ? (
        <p className="border border-black/10 bg-white p-4 text-sm leading-relaxed">{payNote('pasarela')}</p>
      ) : (
      <form action={donate} className="academy-panel space-y-4 p-5 sm:p-6">
        <label className="block space-y-2 text-sm font-semibold">Mensual (L)
          <input name="monthly" type="number" min="1" step="0.01" defaultValue="10" required className="academy-field block w-full" />
        </label>
        <label className="block space-y-2 text-sm font-semibold">Meses
          <input name="months" type="number" min="1" max="24" defaultValue="1" className="academy-field block w-full" />
        </label>
        <CheckoutFields pay={pay} />
      </form>
      )}
    </VStack>
  );
}

function CheckoutFields({ pay }: { pay: PayOptions }) {
  return (
    <>
      <label className="block space-y-2 text-sm font-semibold">Nombre
        <input name="name" required autoComplete="name" className="academy-field block w-full" />
      </label>
      <label className="block space-y-2 text-sm font-semibold">Correo
        <input name="email" type="email" required autoComplete="email" className="academy-field block w-full" />
      </label>
      <PayMethod options={pay} />
      <AcademySubmit label="Continuar" pending="Procesando…" fullWidth />
    </>
  );
}
