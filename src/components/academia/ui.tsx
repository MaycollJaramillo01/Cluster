import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { academyMoney } from '@/lib/valux/money';

// Estado de una clase en el temario. Ocupa siempre el mismo ancho para que los títulos queden alineados.
export function LessonMark({ done, locked }: { done: boolean; locked: boolean }) {
  return (
    <span className="inline-flex w-3.5 shrink-0 justify-center">
      {done ? <Icon name="check" size={14} strokeWidth={2.25} /> : locked ? <Icon name="lock" size={14} className="opacity-50" /> : null}
      {done || locked ? <span className="sr-only">{done ? 'Completada:' : 'Bloqueada:'}</span> : null}
    </span>
  );
}

const LIST = /^([-*•]|\d+[.)])\s+(.*)/;

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong> : part,
  );
}

// Texto de la clase: cada línea es un párrafo; "## título", listas con "- " o "1." y **negrita**.
// Una línea corta sin punto final justo antes de una lista hace de subtítulo. Todo se pinta como texto, nunca HTML.
export function LessonText({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n').map((line) => line.trim());
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; start: number; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((item, index) => <li key={index} className="pl-1">{inline(item)}</li>);
    blocks.push(list.ordered
      ? <ol key={blocks.length} start={list.start} className="list-decimal space-y-2 pl-6 marker:text-black/45">{items}</ol>
      : <ul key={blocks.length} className="list-disc space-y-2 pl-6 marker:text-black/35">{items}</ul>);
    list = null;
  };
  lines.forEach((line, index) => {
    const item = line.match(LIST);
    if (item) {
      const ordered = /^\d/.test(line);
      if (list && list.ordered !== ordered) flush();
      // Una lista numerada cortada por un párrafo sigue con su número ("2.", "3.").
      list ??= { ordered, start: parseInt(line, 10) || 1, items: [] };
      list.items.push(item[2]);
      return;
    }
    flush();
    if (!line) return;
    const heading = line.match(/^#{1,3}\s+(.*)/);
    const label = !heading && line.length <= 60 && !/[.:;,!?)]$/.test(line) && LIST.test(lines[index + 1] || '');
    blocks.push(heading || label
      ? <h2 key={blocks.length} className="pt-3 font-sans text-lg font-semibold normal-case leading-snug tracking-normal">{inline(heading ? heading[1] : line)}</h2>
      : <p key={blocks.length}>{inline(line)}</p>);
  });
  flush();
  return <div className="max-w-[68ch] space-y-4 text-base leading-relaxed text-ink">{blocks}</div>;
}

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

const COUPON_ERRORS: Record<string, string> = {
  invalido: 'Ese cupón no existe o ya no está activo.',
  vencido: 'Ese cupón ya venció.',
  agotado: 'Ese cupón ya se usó todas las veces permitidas.',
  curso: 'Ese cupón es para otro curso.',
};

export function payNote(code?: string) {
  if (code === 'pasarela') return 'El cobro queda listo cuando se cargue la clave de Stripe o los datos para transferencia.';
  if (code === 'datos') return 'Faltan el nombre y el correo.';
  if (code?.startsWith('cupon-')) return COUPON_ERRORS[code.slice(6)] || 'Ese cupón no aplica.';
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
  coupon,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden?: Record<string, string>;
  label: string;
  note?: string;
  pay?: PayOptions;
  // Oferta opcional en el mismo pago: la casilla empieza sin marcar.
  bump?: { title: string; cents: number } | null;
  // Campo de cupón (solo cursos de pago).
  coupon?: boolean;
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
      {coupon ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-black/45">Cupón (opcional)</span>
          <input name="cupon" autoComplete="off" className="w-full border border-black/15 px-3 py-2.5 text-sm uppercase outline-none focus:border-ink" />
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
