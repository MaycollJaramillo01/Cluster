import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { ProfileSettings } from '@/components/academia/ProfileSettings';
import { getPerson } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const person = await getPerson(await academiaPersonId());
  if (!person) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-12">
        <VStack gap={4} className="border border-black/10 bg-white p-6 sm:p-8">
          <h1 className="font-brand text-3xl font-bold normal-case">Mi perfil</h1>
          <p className="text-sm text-black/70">Entra con tu correo para ver los datos de tu cuenta.</p>
          <Link href="/academia/entrar" className="inline-flex min-h-12 w-fit items-center bg-brand px-5 text-sm font-semibold text-ink hover:bg-brand/85">Entrar a la Academia</Link>
        </VStack>
      </main>
    );
  }
  const { guardado } = await searchParams;
  return <ProfileSettings person={person} saved={guardado === '1'} />;
}
