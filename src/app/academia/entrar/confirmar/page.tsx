import { redirect } from 'next/navigation';
import { confirmLoginLink } from '@/lib/valux/actions';
import { loginCourse } from '@/lib/valux/login-course';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { AcademySubmit } from '@/components/academia/AcademySubmit';

// El GET no gasta el enlace: los antivirus de correo lo abren antes que la persona.
export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ t?: string; curso?: string }> }) {
  const { t, curso } = await searchParams;
  if (!t) redirect('/academia/entrar');

  return (
    <VStack as="main" gap={5} className="academy-page max-w-lg">
      <Heading level={1} className="academy-title">Entrar</Heading>
      <form action={confirmLoginLink} className="academy-panel p-5">
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="curso" value={loginCourse(curso)} />
        <AcademySubmit pending="Verificando…" label="Entrar a la academia" fullWidth />
      </form>
    </VStack>
  );
}
