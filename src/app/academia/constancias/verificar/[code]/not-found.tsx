import Link from 'next/link';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';

// Enlace mal copiado o desactivado por la persona: no se distingue cuál, para no revelar si la constancia existe.
export default function CertificateNotFound() {
  return (
    <main className="academy-page max-w-xl">
      <VStack as="section" gap={4} className="academy-panel items-start p-6 sm:p-8">
        <Heading level={1} className="text-2xl font-bold">No pudimos verificar esta constancia</Heading>
        <p className="text-academy-muted">El enlace puede estar mal copiado o su titular lo desactivó. Pídele que te comparta el enlace de nuevo.</p>
        <Link href="/academia" className="academy-action academy-action-secondary">Ir a la academia</Link>
      </VStack>
    </main>
  );
}
