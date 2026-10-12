import type { ReactNode } from 'react';
import { initials, rate } from '@/lib/crm/format';

export const btn =
  'inline-flex items-center justify-center bg-brand px-4 py-2 text-sm font-medium text-ink transition hover:brightness-95';
export const btnGhost =
  'inline-flex items-center justify-center border border-black/15 bg-white px-4 py-2 text-sm text-ink transition hover:border-ink';
export const btnTiny =
  'inline-flex items-center justify-center border border-black/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-black/60 hover:border-ink hover:text-ink';
export const fieldClass =
  'w-full border border-black/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand';
export const labelClass = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-black/45';

export function PageTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="font-display text-4xl tracking-wide text-ink md:text-5xl">{title}</h1>
      {action}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`border border-black/10 bg-white ${className}`}>{children}</section>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 border border-black/10 bg-white px-6 py-16 text-center">
      <p className="font-display text-4xl tracking-wide">{title}</p>
      {children}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-black/10 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            {head.map((item) => (
              <th key={item} className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-black/45">
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Mark({ name }: { name: string }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-ink text-[11px] font-medium uppercase text-white">
      {initials(name)}
    </span>
  );
}

export function Rate({ value }: { value: number }) {
  const hot = value > 0;
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-xs ${hot ? 'bg-brand/20 text-ink' : 'bg-black/5 text-black/40'}`}>
      {rate(value)}
    </span>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="border border-brand/50 bg-brand/10 px-3 py-2 text-sm">{children}</p>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="border border-black/10 border-t-[3px] border-t-brand bg-white p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{label}</p>
      <p className="mt-3 font-display text-5xl leading-none tracking-wide">{value}</p>
      {hint ? <p className="mt-2 text-sm text-black/55">{hint}</p> : null}
    </article>
  );
}
