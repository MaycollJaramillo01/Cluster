import { payNote } from '@/components/academia/ui';
import { buySubscription } from '@/lib/valux/actions';
import { getSettings } from '@/lib/valux/data';
import { money } from '@/lib/crm/format';
import { paymentReady } from '@/lib/valux/stripe';

export default async function SuscripcionPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const query = await searchParams;
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Suscripción</h1>
      <p className="text-sm text-black/60">
        {money(settings.subscription_cents)} al mes abre el catálogo de cursos y el marketplace, igual que un suscriptor.
      </p>
      {query.ok ? <p className="text-sm text-brand">Suscripción activa.</p> : null}
      {query.error ? <p className="text-sm">{payNote(query.error)}</p> : null}
      {settings.subscription_cents > 0 && !paymentReady() ? (
        <p className="border border-black/10 bg-white p-4 text-sm leading-relaxed">{payNote('pasarela')}</p>
      ) : (
      <form action={buySubscription} className="space-y-3 border border-black/10 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Meses</span>
          <input name="months" type="number" min="1" max="12" defaultValue="1" className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Nombre</span>
          <input name="name" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Correo</span>
          <input name="email" type="email" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
        </label>
        <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Continuar</button>
      </form>
      )}
    </div>
  );
}
