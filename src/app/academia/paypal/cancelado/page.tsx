import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';

// Vuelta desde la pasarela sin pagar. No sabemos qué se estaba comprando, así que se ofrecen las salidas habituales.
export default function PagoCancelado() {
  return (
    <main className="academy-page max-w-2xl">
      <VStack as="section" gap={5} className="academy-panel items-start p-6 sm:p-10">
        <strong aria-hidden="true" className="grid size-12 place-items-center rounded-academy-full bg-academy-page text-academy-muted"><Icon name="close" size={22} /></strong>
        <VStack gap={2}>
          <Heading level={1} className="academy-title">Pago cancelado</Heading>
          <p className="text-academy-muted">No se hizo ningún cobro y no se registró la compra. Puedes volver a intentarlo cuando quieras.</p>
        </VStack>
        <HStack gap={3} wrap="wrap">
          <Link href="/academia" className="academy-action academy-action-primary">Ver cursos <Icon name="arrow-right" size={16} /></Link>
          <Link href="/academia/mis-cursos" className="academy-action academy-action-secondary">Ir a mis cursos</Link>
        </HStack>
      </VStack>
    </main>
  );
}
