import { redirect } from 'next/navigation';
import { confirmLoginLink } from '@/lib/valux/actions';
import { loginCourse } from '@/lib/valux/login-course';

// El GET no gasta el enlace: los antivirus de correo lo abren antes que la persona.
export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ t?: string; curso?: string }> }) {
  const { t, curso } = await searchParams;
  if (!t) redirect('/academia/entrar');

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Entrar</h1>
      <form action={confirmLoginLink}>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="curso" value={loginCourse(curso)} />
        <button className="w-full bg-brand px-4 py-2.5 text-sm font-medium text-ink" type="submit">Entrar a la academia</button>
      </form>
    </div>
  );
}
