import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';

export default function PagoCancelado() {
  return (
    <main className="academy-page max-w-xl">
      <VStack gap={4} className="academy-panel items-start p-6">
        <Heading level={1} className="academy-title">Pago cancelado</Heading>
        <p className="text-academy-muted">No se registró la compra.</p>
        <Button as={Link} href="/academia" label="Volver a la academia" variant="primary" />
      </VStack>
    </main>
  );
}
