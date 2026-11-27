import type { ReactNode } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';
import { academyMoney } from '@/lib/valux/money';
import { AcademySubmit } from './AcademySubmit';

// Estado de una clase en el temario. Ocupa siempre el mismo ancho para que los títulos queden alineados.
export function LessonMark({ done, locked }: { done: boolean; locked: boolean }) {
  return (
    <i className="inline-flex w-4 shrink-0 justify-center text-academy-primary not-italic">
      {done ? <Icon name="check" size={14} strokeWidth={2.25} /> : locked ? <Icon name="lock" size={14} className="opacity-50" /> : null}
      {done || locked ? <small className="sr-only">{done ? 'Completada:' : 'Bloqueada:'}</small> : null}
    </i>
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
  return <VStack gap={4} className="max-w-prose text-base leading-relaxed text-academy-ink">{blocks}</VStack>;
}

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <VStack as="main" className={`academy-page ${className}`}>{children}</VStack>;
}

const courseArt: Record<string, string> = {
  'publicidad-facebook-instagram': '/assets/academia/stitch/marketing.webp',
  'diseno-contenido-canva': '/assets/academia/stitch/diseno.webp',
  'ventas-por-whatsapp': '/assets/academia/stitch/ventas.webp',
  'ia-automatizacion-negocios': '/assets/academia/stitch/tecnologia.webp',
  'meta-ads-negocios-locales': '/assets/academia/meta-ads-locales.webp',
};

export function Cover({ url, title, slug = '', eager = false, aspect = 'aspect-video' }: { url: string; title: string; slug?: string; eager?: boolean; aspect?: string }) {
  const defaultCover = !url || url.startsWith('/assets/videos/services/') || url.startsWith('/assets/stock/')
    || (slug === 'publicidad-facebook-instagram' && url === '/assets/stock/social.jpg')
    || (slug === 'meta-ads-negocios-locales' && url === '/assets/stock/analytics.jpg');
  const image = defaultCover && courseArt[slug] ? courseArt[slug] : url;
  if (image) return <img src={image} alt="" width={640} height={360} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} className={`${aspect} w-full bg-academy-deep object-cover`} />;
  return (
    <figure aria-hidden="true" className={`academy-hero grid ${aspect} place-items-center text-white`}>
      <Icon name={title ? 'play' : 'pen'} size={46} strokeWidth={1.25} />
    </figure>
  );
}

const COUPON_ERRORS: Record<string, string> = {
  invalido: 'Ese cupón no existe o ya no está activo.',
  vencido: 'Ese cupón ya venció.',
  agotado: 'Ese cupón ya se usó todas las veces permitidas.',
  curso: 'Ese cupón es para otro curso.',
};

export function payNote(code?: string) {
  if (code === 'reembolso') return 'Este pago fue devuelto o está en disputa. Ya no da acceso a la compra.';
  if (code === 'suspendido') return 'Tu cuenta está suspendida. Contacta al equipo de Academia para recuperar el acceso.';
  if (code === 'pasarela') return 'El pago no está disponible en este momento.';
  if (code === 'datos') return 'Faltan el nombre y el correo.';
  if (code === 'plan') return 'Elige un plan disponible.';
  if (code === 'monto') return 'Escribe un aporte de al menos L 1.00.';
  if (code === 'curso') return 'Este curso ya no está disponible. Vuelve al catálogo para elegir otro.';
  if (code === 'producto') return 'Este recurso ya no está disponible.';
  if (code?.startsWith('cupon-')) return COUPON_ERRORS[code.slice(6)] || 'Ese cupón no aplica.';
  if (code) return 'No se pudo completar el pago.';
  return '';
}

export type PayOptions = { card: boolean; transfer: boolean };

const METHODS = {
  tarjeta: { label: 'Tarjeta', detail: 'Pagas en la pasarela segura de Stripe.' },
  transferencia: { label: 'Transferencia bancaria', detail: 'Te damos una referencia y los datos de la cuenta. El acceso llega cuando confirmamos el depósito.' },
} as const;

// Tarjeta (Stripe) o transferencia. Con un solo método disponible no se pregunta, pero se dice cuál es.
export function PayMethod({ options, method, quiet = false }: { options?: PayOptions; method?: string; quiet?: boolean }) {
  if (!options) return null;
  if (options.card && options.transfer) {
    return (
      <fieldset className="space-y-2 text-sm">
        <legend className={quiet ? 'sr-only' : 'mb-3 font-semibold text-academy-ink'}>Forma de pago</legend>
        {(['tarjeta', 'transferencia'] as const).map((value) => (
          <label key={value} className="academy-panel flex min-h-14 cursor-pointer items-start gap-3 p-4 transition-colors hover:border-academy-ink has-[:checked]:border-academy-action has-[:checked]:bg-academy-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-academy-action">
            <input type="radio" name="metodo" value={value} defaultChecked={value === 'transferencia' ? method === 'transferencia' : method !== 'transferencia'} className="mt-0.5 h-4 w-4 shrink-0" />
            <VStack as="span" gap={0.5}>
              <strong className="font-semibold text-academy-ink">{METHODS[value].label}</strong>
              <small className="text-sm text-academy-muted">{METHODS[value].detail}</small>
            </VStack>
          </label>
        ))}
      </fieldset>
    );
  }
  const only = options.card ? 'tarjeta' : 'transferencia';
  return (
    <>
      <input type="hidden" name="metodo" value={only} />
      <p className="rounded-academy border border-academy-line bg-academy-page p-4 text-sm"><strong className="font-semibold">{METHODS[only].label}.</strong> <small className="text-sm text-academy-muted">{METHODS[only].detail}</small></p>
    </>
  );
}

export function payReady(options: PayOptions) {
  return options.card || options.transfer;
}

export function payHint(options: PayOptions) {
  if (options.card && options.transfer) return 'Pagas con tarjeta o por transferencia.';
  if (options.card) return 'Pagas con tarjeta.';
  return 'Pagas por transferencia; el acceso llega al confirmar el depósito.';
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
  id,
  start = 1,
  stacked = false,
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
  // Campos fuera del formulario (plan, monto) se asocian con form={id}; start numera los pasos después de ellos.
  id?: string;
  start?: number;
  // En columnas angostas nombre y correo van uno debajo del otro.
  stacked?: boolean;
}) {
  const field = 'academy-field w-full';
  const couponError = feedback?.error?.startsWith('cupon-') ? payNote(feedback.error) : '';
  const step = 'grid size-7 shrink-0 place-items-center rounded-academy bg-academy-deep text-xs font-bold text-white';
  return (
    <form id={id} action={action} className="space-y-6 [color-scheme:light]">
      {feedback?.error && !couponError ? <p role="alert" tabIndex={-1} data-checkout-error className="rounded-academy border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{payNote(feedback.error)} Revisa los datos o intenta de nuevo.</p> : null}
      {Object.entries(hidden || {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <fieldset className="space-y-4">
        <legend className="mb-4 flex items-center gap-3 text-base font-bold text-academy-ink"><strong aria-hidden="true" className={step}>{start}</strong>Tus datos</legend>
        <section className={stacked ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2'}>
          <label className="block space-y-2 text-sm font-semibold">
            Nombre
            <input name="name" autoComplete="name" defaultValue={contact?.name} required className={field} />
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            Correo
            <input name="email" type="email" autoComplete="email" spellCheck={false} defaultValue={contact?.email} required className={field} />
          </label>
        </section>
        {coupon ? (
          <details open={Boolean(feedback?.coupon || couponError) || undefined}>
            <summary className="academy-focus w-fit cursor-pointer rounded-academy py-1 text-sm font-semibold underline underline-offset-4">Tengo un cupón</summary>
            <label className="mt-3 block max-w-xs space-y-2 text-sm font-semibold">
              Código del cupón
              <input name="cupon" autoComplete="off" spellCheck={false} defaultValue={feedback?.coupon} aria-invalid={Boolean(couponError) || undefined} aria-describedby={couponError ? 'checkout-coupon-error' : undefined} data-checkout-error={couponError ? '' : undefined} className={`${field} uppercase`} />
            </label>
            {couponError ? <p id="checkout-coupon-error" role="alert" className="mt-2 text-sm text-red-800">{couponError} Revisa el código o continúa sin cupón.</p> : null}
          </details>
        ) : null}
      </fieldset>
      {bump ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-academy border border-dashed border-academy-action bg-academy-tint p-4 text-sm">
          <input type="checkbox" name="bump" value="1" defaultChecked={feedback?.bump} className="mt-0.5 h-4 w-4 shrink-0" />
          <VStack as="span" gap={1}>
            <strong className="font-semibold">Agrega {bump.title} por {academyMoney(bump.cents)}</strong>
            <small className="text-xs text-academy-muted">Opcional. Se suma a este mismo pago.</small>
          </VStack>
        </label>
      ) : null}
      {pay ? (
        <section className="space-y-4 border-t border-academy-line pt-6">
          <p className="flex items-center gap-3 text-base font-bold text-academy-ink"><strong aria-hidden="true" className={step}>{start + 1}</strong>Forma de pago</p>
          <PayMethod options={pay} method={feedback?.method} quiet />
        </section>
      ) : null}
      <VStack gap={2}>
        <AcademySubmit pending="Procesando…" label={label} fullWidth />
        {pay ? <PurchaseLegalLinks /> : null}
        {note ? <p className="text-center text-xs text-academy-muted">{note}</p> : null}
      </VStack>
    </form>
  );
}

export function PurchaseLegalLinks() {
  return (
    <p className="text-center text-xs leading-relaxed text-academy-muted">
      <a href="/terminos#academia" className="academy-focus underline underline-offset-4" target="_blank" rel="noopener">Términos de compra y reembolsos</a>
      {' · '}
      <a href="/privacidad#academia" className="academy-focus underline underline-offset-4" target="_blank" rel="noopener">Privacidad</a>
    </p>
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
