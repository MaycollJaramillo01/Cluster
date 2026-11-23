import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { ProfileSettings } from '@/components/academia/ProfileSettings';
import { getPerson } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const person = await getPerson(await academiaPersonId());
  if (!person) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-12">
        <VStack gap={4} className="academy-panel items-start p-6 sm:p-8">
          <Heading level={1} className="academy-title">Mi perfil</Heading>
          <p className="text-sm text-academy-muted">Entra con tu correo para ver los datos de tu cuenta.</p>
          <Button as={Link} href="/academia/entrar" label="Entrar a la Academia" variant="primary" />
        </VStack>
      </main>
    );
  }
  const { guardado } = await searchParams;
  return <ProfileSettings person={person} saved={guardado === '1'} />;
}
