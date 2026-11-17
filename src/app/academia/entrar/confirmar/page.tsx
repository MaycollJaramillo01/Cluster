import { redirect } from 'next/navigation';
import { confirmLoginLink } from '@/lib/valux/actions';

// El GET no gasta el enlace: los antivirus de correo lo abren antes que la persona.
export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  if (!t) redirect('/academia/entrar');

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Entrar</h1>
      <p className="text-sm text-black/60">Confirma para entrar a la academia. El enlace sirve una sola vez.</p>
      <form action={confirmLoginLink}>
        <input type="hidden" name="t" value={t} />
        <button className="w-full bg-brand px-4 py-2.5 text-sm font-medium text-ink" type="submit">Entrar a la academia</button>
      </form>
    </div>
  );
}
