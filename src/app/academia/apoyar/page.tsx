import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { payNote, payReady } from '@/components/academia/ui';
import { DonationForm } from '@/components/academia/PayForms';
import { getPerson } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { paymentOptions } from '@/lib/valux/transfers';
import { Icon } from '@/components/ui/Icon';

export default async function ApoyarPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;
  const pay = await paymentOptions();
  const person = await getPerson(await academiaPersonId());

  return (
    <VStack as="main" gap={8} className="academy-page max-w-5xl">
      <VStack as="header" gap={2}>
        <p className="text-sm font-semibold text-academy-primary">Apoyar</p>
        <Heading level={1} className="academy-title">Apoya la academia</Heading>
        <p className="max-w-prose text-academy-muted">Una donación mensual, por los meses que elijas. Queda en el registro de la junta.</p>
      </VStack>
      {query.ok ? (
        <VStack as="section" gap={4} role="status" className="academy-panel items-start p-6 sm:p-8">
          <Icon name="check" size={28} className="text-academy-primary" />
          <Heading level={2} className="text-2xl font-bold">Gracias. Tu donación quedó registrada.</Heading>
          <p className="text-academy-muted">Te enviamos un correo de confirmación. Gracias por apoyar a la Academia.</p>
          <Link href="/academia" className="academy-action academy-action-secondary">Volver a la academia</Link>
        </VStack>
      ) : (
        <>
          {query.error ? <p role="alert" className="academy-notice">{payNote(query.error)}</p> : null}
          {payReady(pay) ? (
            <DonationForm pay={pay} contact={person ? { name: person.name, email: person.email } : undefined} />
          ) : (
            <p role="status" className="academy-notice">{payNote('pasarela')}</p>
          )}
        </>
      )}
    </VStack>
  );
}
