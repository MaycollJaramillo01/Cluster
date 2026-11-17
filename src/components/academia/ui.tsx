import type { ReactNode } from 'react';
import { academyMoney } from '@/lib/valux/money';

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
  if (code === 'pasarela') return 'El cobro queda listo cuando se cargue la clave de Stripe o los datos para transferencia.';
  if (code === 'datos') return 'Faltan el nombre y el correo.';
  if (code) return 'No se pudo completar el pago.';
  return '';
}

export type PayOptions = { card: boolean; transfer: boolean };

// Tarjeta (Stripe) o transferencia. Con un solo método disponible no se pregunta.
export function PayMethod({ options }: { options?: PayOptions }) {
  if (!options) return null;
  if (options.card && options.transfer) {
    return (
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 text-xs text-black/45">Forma de pago</legend>
        <label className="flex items-center gap-2"><input type="radio" name="metodo" value="tarjeta" defaultChecked /> Tarjeta</label>
        <label className="flex items-center gap-2"><input type="radio" name="metodo" value="transferencia" /> Transferencia bancaria</label>
      </fieldset>
    );
  }
  return <input type="hidden" name="metodo" value={options.card ? 'tarjeta' : 'transferencia'} />;
}

export function payReady(options: PayOptions) {
  return options.card || options.transfer;
}

export function payHint(options: PayOptions) {
  if (options.card && options.transfer) return 'Pagás con tarjeta o por transferencia.';
  if (options.card) return 'Pagás con tarjeta.';
  return 'Pagás por transferencia; el acceso llega al confirmar el depósito.';
}

export function Checkout({
  action,
  hidden,
  label,
  note,
  pay,
  bump,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden?: Record<string, string>;
  label: string;
  note?: string;
  pay?: PayOptions;
  // Oferta opcional en el mismo pago: la casilla empieza sin marcar.
  bump?: { title: string; cents: number } | null;
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
      {bump ? (
        <label className="flex items-start gap-3 border border-dashed border-brand bg-brand/5 p-3 text-sm">
          <input type="checkbox" name="bump" value="1" className="mt-1" />
          <span>
            <span className="block font-medium">Agrega {bump.title} por {academyMoney(bump.cents)}</span>
            <span className="block text-xs text-black/55">Opcional. Se suma a este mismo pago.</span>
          </span>
        </label>
      ) : null}
      <PayMethod options={pay} />
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
