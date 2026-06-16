import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';

// ── Lista de chequeo con viñetas verdes ──────────────────────
export function CheckList({
  items,
  columns = 1,
  tone = 'dark',
  className = '',
}: {
  items: string[];
  columns?: 1 | 2;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <ul
      className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''} ${className}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
              tone === 'light' ? 'bg-white/20 text-white' : 'bg-brand/15 text-brand-300'
            }`}
          >
            <Icon name="check" size={13} strokeWidth={2.5} />
          </span>
          <span
            className={`text-[15px] leading-relaxed ${
              tone === 'light' ? 'text-white/90' : 'text-paper/70'
            }`}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Grid de tarjetas "incluye" con icono ─────────────────────
export type IncludeItem = { icon: IconName; title: string; text: string };

export function IncludeGrid({ items }: { items: IncludeItem[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal
          key={item.title}
          delay={i * 50}
          className="group relative bg-ink-900 p-8 transition-colors duration-500 hover:bg-ink-850"
        >
          <span className="mono-label absolute right-6 top-6 text-paper/20">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand-300 transition-all duration-500 group-hover:border-brand/40 group-hover:bg-brand group-hover:text-white">
            <Icon name={item.icon} size={24} />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold text-paper">
            {item.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-paper/55">
            {item.text}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

// ── Pasos de proceso numerados ───────────────────────────────
export type Step = { title: string; text: string };

export function ProcessSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.title}
          delay={i * 80}
          className="card-dark p-7"
        >
          <span className="font-display text-5xl font-semibold text-brand/30">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-paper">
            {step.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-paper/55">
            {step.text}
          </p>
        </Reveal>
      ))}
    </ol>
  );
}

// ── Lista de pills ───────────────────────────────────────────
export function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-2 text-sm font-medium text-paper/70 transition-colors hover:border-brand/40 hover:text-paper"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Bloque genérico de texto ─────────────────────────────────
export function ProseBlock({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl text-lg leading-relaxed text-paper/65 ${className}`}>
      {children}
    </div>
  );
}
