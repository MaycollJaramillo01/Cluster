import type { ReactNode } from 'react';

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 py-10 ${className}`}>{children}</div>;
}

export function Cover({ url, title }: { url: string; title: string }) {
  if (url) return <img src={url} alt="" className="aspect-video w-full bg-ink object-cover" />;
  return (
    <div className="flex aspect-video items-end bg-ink p-4" aria-hidden>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">{title ? 'Curso' : ''}</span>
    </div>
  );
}

export function payNote(code?: string) {
  if (code === 'pasarela') return 'El cobro queda listo cuando se carguen las claves de PayPal o Stripe.';
  if (code === 'datos') return 'Faltan el nombre y el correo.';
  if (code) return 'No se pudo completar el pago.';
  return '';
}

export function Checkout({
  action,
  hidden,
  label,
  note,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden?: Record<string, string>;
  label: string;
  note?: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {Object.entries(hidden || {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label className="block text-sm">
        <span className="mb-1 block text-xs text-black/45">Nombre</span>
        <input name="name" required className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-ink" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs text-black/45">Correo</span>
        <input name="email" type="email" required className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-ink" />
      </label>
      <button className="w-full bg-brand px-4 py-3 text-sm font-medium text-ink" type="submit">{label}</button>
      {note ? <p className="text-center text-xs text-black/45">{note}</p> : null}
    </form>
  );
}

export function durationLabel(minutes: number) {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) return `${hours} h ${rest} min`;
  if (hours) return `${hours} h`;
  return `${rest} min`;
}
