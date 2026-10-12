'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="border border-black/10 bg-white p-8">
      <p className="font-display text-4xl tracking-wide">No pudimos leer el CRM</p>
      <p className="mt-3 max-w-xl text-sm text-black/60">{error.message}</p>
      <button className="mt-6 bg-brand px-4 py-2 text-sm font-medium text-ink" type="button" onClick={reset}>
        Reintentar
      </button>
    </div>
  );
}
