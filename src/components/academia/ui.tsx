import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { academyMoney } from '@/lib/valux/money';
import { SubmitButton } from '@/components/ui/SubmitButton';

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

const courseArt: Record<string, { icon: IconName; tone: string }> = {
  'publicidad-facebook-instagram': { icon: 'megaphone', tone: 'bg-ink text-brand' },
  'diseno-contenido-canva': { icon: 'pen', tone: 'bg-paper-dim text-ink' },
  'ventas-por-whatsapp': { icon: 'whatsapp', tone: 'bg-brand text-ink' },
  'ia-automatizacion-negocios': { icon: 'bot', tone: 'bg-ink-700 text-brand' },
  'meta-ads-negocios-locales': { icon: 'target', tone: 'bg-paper-soft text-ink' },
};

export function Cover({ url, title, slug = '', eager = false }: { url: string; title: string; slug?: string; eager?: boolean }) {
  const art = courseArt[slug];
  if (art && (!url || url.startsWith('/assets/videos/services/'))) {
    return (
      <figure aria-hidden="true" className={`relative grid aspect-video w-full place-items-center overflow-hidden ${art.tone}`}>
        <Icon name={art.icon} strokeWidth={1.25} className="h-20 w-20 sm:h-24 sm:w-24" />
      </figure>
    );
  }
  if (url) return <img src={url} alt="" width={640} height={360} loading={eager ? 'eager' : 'lazy'} className="aspect-video w-full bg-ink object-cover" />;
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
  if (code === 'pasarela') return 'El pago no está disponible en este momento.';
  if (code === 'datos') return 'Faltan el nombre y el correo.';
  if (code === 'curso') return 'Este curso ya no está disponible. Vuelve al catálogo para elegir otro.';
  if (code?.startsWith('cupon-')) return COUPON_ERRORS[code.slice(6)] || 'Ese cupón no aplica.';
  if (code) return 'No se pudo completar el pago.';
  return '';
}

export type PayOptions = { card: boolean; transfer: boolean };

// Tarjeta (Stripe) o transferencia. Con un solo método disponible no se pregunta.
export function PayMethod({ options, method }: { options?: PayOptions; method?: string }) {
  if (!options) return null;
  if (options.card && options.transfer) {
    return (
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 text-xs text-black/45">Forma de pago</legend>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="metodo" value="tarjeta" defaultChecked={method !== 'transferencia'} /> Tarjeta</label>
        <label className="flex min-h-11 items-center gap-2"><input type="radio" name="metodo" value="transferencia" defaultChecked={method === 'transferencia'} /> Transferencia bancaria</label>
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
  contact,
  feedback,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  label: string;
  note?: string;
  pay?: PayOptions;
  // Oferta opcional en el mismo pago: la casilla empieza sin marcar.
  bump?: { title: string; cents: number } | null;
  // Campo de cupón (solo cursos de pago).
  coupon?: boolean;
  contact?: { name: string; email: string };
  feedback?: { error?: string; coupon: string; method: string; bump: boolean };
}) {
  const field = 'min-h-11 w-full border border-black/25 bg-white px-3 py-2.5 text-base text-ink placeholder:text-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
  const couponError = feedback?.error?.startsWith('cupon-') ? payNote(feedback.error) : '';
  return (
    <form action={action} className="space-y-4 [color-scheme:light]">
      {feedback?.error && !couponError ? <p role="alert" tabIndex={-1} data-checkout-error className="border border-black/15 bg-paper p-3 text-sm">{payNote(feedback.error)} Revisa los datos o intenta de nuevo.</p> : null}
      {Object.entries(hidden || {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Nombre</span>
        <input name="name" autoComplete="name" defaultValue={contact?.name} required className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Correo</span>
        <input name="email" type="email" autoComplete="email" spellCheck={false} defaultValue={contact?.email} required className={field} />
      </label>
      {bump ? (
        <label className="flex items-start gap-3 border border-dashed border-brand bg-brand/5 p-3 text-sm">
          <input type="checkbox" name="bump" value="1" defaultChecked={feedback?.bump} className="mt-1" />
          <span>
            <span className="block font-medium">Agrega {bump.title} por {academyMoney(bump.cents)}</span>
            <span className="block text-xs text-black/55">Opcional. Se suma a este mismo pago.</span>
          </span>
        </label>
      ) : null}
      {coupon ? (
        <details open={Boolean(feedback?.coupon || couponError) || undefined}>
          <summary className="w-fit cursor-pointer text-sm font-medium underline underline-offset-4">Tengo un cupón</summary>
          <label className="mt-3 block text-sm">
            <span className="mb-1.5 block font-medium text-ink">Código del cupón</span>
            <input name="cupon" autoComplete="off" spellCheck={false} defaultValue={feedback?.coupon} aria-invalid={Boolean(couponError) || undefined} aria-describedby={couponError ? 'checkout-coupon-error' : undefined} data-checkout-error={couponError ? '' : undefined} className={`${field} uppercase`} />
          </label>
          {couponError ? <p id="checkout-coupon-error" role="alert" className="mt-2 text-sm text-red-800">{couponError} Revisa el código o continúa sin cupón.</p> : null}
        </details>
      ) : null}
      <PayMethod options={pay} method={feedback?.method} />
      <SubmitButton pending="Procesando…">{label}</SubmitButton>
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
