import { payNote } from '@/components/academia/ui';
import { buySubscription, cancelMySubscription } from '@/lib/valux/actions';
import { getSettings, personSubscription } from '@/lib/valux/data';
import { academiaPersonId } from '@/lib/valux/session';
import { formatDate, money } from '@/lib/crm/format';
import { paymentReady } from '@/lib/valux/stripe';

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; cancelada?: string }>;
}) {
  const query = await searchParams;
  const settings = await getSettings();
  const personId = await academiaPersonId();
  const current = personId ? await personSubscription(personId) : null;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl tracking-wide">Suscripción</h1>
      <p className="text-sm text-black/60">
        {money(settings.subscription_cents)} al mes abre el catálogo de cursos y el marketplace. Se renueva sola cada mes y se cancela cuando quieras.
      </p>
      {query.ok ? <p className="text-sm text-brand">Suscripción activa.</p> : null}
      {query.cancelada ? <p className="text-sm">Listo, no se va a renovar.</p> : null}
      {query.error === 'cancelar' ? <p className="text-sm">No se pudo cancelar en la pasarela. Probá de nuevo o escribinos.</p> : null}
      {query.error && query.error !== 'cancelar' ? <p className="text-sm">{payNote(query.error)}</p> : null}
      {current ? (
        <div className="space-y-3 border border-black/10 bg-white p-4 text-sm">
          <p>
            {current.status === 'activa'
              ? `Tu suscripción está activa. Próxima renovación: ${formatDate(current.current_period_end)}.`
              : `No se va a renovar. Tenés acceso hasta el ${formatDate(current.current_period_end)}.`}
          </p>
          {current.status === 'activa' && current.gateway_id ? (
            <form action={cancelMySubscription}>
              <button className="border border-black/15 px-4 py-2 text-sm" type="submit">Cancelar renovación</button>
            </form>
          ) : null}
        </div>
      ) : settings.subscription_cents > 0 && !paymentReady() ? (
        <p className="border border-black/10 bg-white p-4 text-sm leading-relaxed">{payNote('pasarela')}</p>
      ) : (
        <form action={buySubscription} className="space-y-3 border border-black/10 bg-white p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Nombre</span>
            <input name="name" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">Correo</span>
            <input name="email" type="email" required className="w-full border border-black/15 px-3 py-2 outline-none focus:border-brand" />
          </label>
          <button className="bg-brand px-4 py-2 text-sm font-medium text-ink" type="submit">Suscribirme</button>
        </form>
      )}
    </div>
  );
}
