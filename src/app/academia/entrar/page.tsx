import { enterAcademia } from '@/lib/valux/actions';

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ error?: string; enviado?: string }> }) {
  const query = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Entrar</h1>
      <p className="text-sm text-black/60">Usa el correo de una compra, inscripción o suscripción.</p>
      {query.enviado ? <p className="text-sm">Si ese correo tiene acceso, te enviamos un enlace para entrar. Revisa tu bandeja.</p> : null}
      {query.error ? <p className="text-sm">El enlace venció o no es válido. Pide uno nuevo.</p> : null}
      <form action={enterAcademia} className="space-y-3 border border-black/10 bg-white p-4">
        <input name="email" type="email" required placeholder="Correo" className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand" />
        <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Entrar</button>
      </form>
    </div>
  );
}
