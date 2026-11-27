import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { confirmLoginLink } from '@/lib/valux/actions';
import { loginCourse } from '@/lib/valux/login-course';
import { publishedCourse } from '@/lib/valux/data';
import { AcademySubmit } from '@/components/academia/AcademySubmit';
import { AuthShell } from '@/components/academia/AuthShell';

// El GET no gasta el enlace: los antivirus de correo lo abren antes que la persona.
export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ t?: string; curso?: string }> }) {
  const { t, curso } = await searchParams;
  if (!t) redirect('/academia/entrar');
  const slug = loginCourse(curso);
  const course = slug ? await publishedCourse(slug) : null;

  return (
    <AuthShell step={2} course={course}>
      <VStack gap={2}>
        <p className="w-fit rounded-academy-full bg-academy-tint px-3 py-1 text-xs font-semibold text-academy-primary">Enlace de acceso</p>
        <Heading level={1} className="academy-title">Confirma tu acceso</Heading>
        <p className="text-academy-muted">Por seguridad, confirma que quieres entrar con este enlace. Sirve una sola vez.</p>
      </VStack>
      <form action={confirmLoginLink}>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="curso" value={slug} />
        <AcademySubmit pending="Verificando…" label="Entrar a la academia" fullWidth />
      </form>
      <p className="border-t border-academy-line pt-5 text-sm text-academy-muted">
        ¿No pediste este acceso? Cierra esta página. <Link href="/academia" className="font-semibold text-academy-ink underline underline-offset-4">Volver a la academia</Link>
      </p>
    </AuthShell>
  );
}
