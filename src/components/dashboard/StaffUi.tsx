import Link from 'next/link';
import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@/components/ui/Icon';

// Piezas del panel de la academia (administración y docentes). dashboard/ui sigue siendo el estilo del CRM.
export const btn = 'academy-action academy-action-primary disabled:cursor-not-allowed disabled:opacity-50';
export const btnGhost = 'academy-action academy-action-secondary disabled:cursor-not-allowed disabled:opacity-50';
export const btnSmall = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-academy border border-academy-line bg-academy-surface px-3 text-sm font-semibold text-academy-ink transition-colors hover:border-academy-primary hover:text-academy-primary disabled:cursor-not-allowed disabled:opacity-50';
export const btnDanger = 'academy-action border border-red-200 bg-academy-surface text-red-800 hover:bg-red-50';
export const fieldClass = 'academy-field block w-full min-w-0 font-normal';
export const labelClass = 'block min-w-0 space-y-2 text-sm font-semibold text-academy-ink';
export const rowClass = 'flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5';
export const cell = 'px-4 py-3 align-top';
export const kindLabel: Record<string, string> = { curso: 'Curso', producto: 'Recurso', suscripcion: 'Membresía', donacion: 'Donación' };
export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// "2026-11" → "Noviembre de 2026"
export function periodLabel(ym: string) {
  return /^\d{4}-\d{2}$/.test(ym) ? capitalize(new Intl.DateTimeFormat('es-HN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${ym}-01T00:00:00Z`))) : ym;
}

export function PayoutStatus({ status }: { status: string }) {
  return <Pill tone={status === 'transferida' ? 'ok' : status === 'sin saldo' ? 'off' : 'wait'}>{capitalize(status)}</Pill>;
}

export function PageTitle({ title, description, eyebrow, back, action }: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  back?: { href: string; label: string };
  action?: ReactNode;
}) {
  return (
    <VStack as="header" gap={3}>
      {back ? <Link href={back.href} className="academy-nav academy-focus -ml-3 w-fit"><Icon name="arrow-right" size={16} className="rotate-180" />{back.label}</Link> : null}
      <HStack gap={4} align="end" justify="between" wrap="wrap">
        <VStack gap={2} className="min-w-0">
          {eyebrow ? <p className="text-sm font-semibold text-academy-primary">{eyebrow}</p> : null}
          <Heading level={1} className="academy-title">{title}</Heading>
          {description ? <p className="max-w-prose text-academy-muted">{description}</p> : null}
        </VStack>
        {action}
      </HStack>
    </VStack>
  );
}

export function SectionTitle({ id, title, description, action }: { id?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <HStack gap={3} align="end" justify="between" wrap="wrap">
      <VStack gap={1} className="min-w-0">
        <Heading id={id} level={2} className="break-words text-xl font-bold">{title}</Heading>
        {description ? <p className="max-w-prose text-sm text-academy-muted">{description}</p> : null}
      </VStack>
      {action}
    </HStack>
  );
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'ok' | 'error' }) {
  if (tone === 'error') return <p role="alert" className="rounded-academy border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{children}</p>;
  return (
    <p role={tone === 'ok' ? 'status' : undefined} className="academy-notice flex items-start gap-2">
      <Icon name={tone === 'ok' ? 'check' : 'shield'} size={16} className="mt-0.5 shrink-0 text-academy-primary" />
      <Text type="inherit">{children}</Text>
    </p>
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <VStack gap={1} className={`min-w-0 ${className}`}>
      <label className={labelClass}>{label}{children}</label>
      {hint ? <small className="text-xs text-academy-muted">{hint}</small> : null}
    </VStack>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <VStack as="dl" gap={1} className="academy-panel min-w-0 p-4 sm:p-5">
      <dt className="text-sm font-semibold text-academy-muted">{label}</dt>
      <dd className="break-words font-academy-heading text-3xl font-bold tabular-nums text-academy-ink">{value}</dd>
      {hint ? <dd className="text-xs text-academy-muted">{hint}</dd> : null}
    </VStack>
  );
}

const tones = {
  ok: 'bg-academy-tint text-academy-primary',
  wait: 'border border-academy-line bg-academy-surface text-academy-ink',
  off: 'bg-academy-page text-academy-muted',
  bad: 'bg-red-50 text-red-900',
};

export function Pill({ tone = 'wait', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <strong className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-academy-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</strong>;
}

export function Tabs({ label, items }: { label: string; items: { href: string; label: string; current: boolean; count?: number }[] }) {
  return (
    <nav aria-label={label} className="relative -m-1 overflow-x-auto p-1">
      <ul className="flex w-max gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={item.current ? 'page' : undefined} className="academy-filter academy-focus gap-2 whitespace-nowrap">
              {item.label}
              {item.count != null ? <small className="tabular-nums text-academy-muted">{item.count}</small> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Table({ head, label, children }: { head: string[]; label: string; children: ReactNode }) {
  return (
    <section aria-label={label} tabIndex={0} className="academy-panel relative overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-academy-line bg-academy-tint">
            {head.map((item, index) => <th key={`${item}-${index}`} scope="col" className="px-4 py-3 text-xs font-semibold text-academy-muted">{item}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-academy-line">{children}</tbody>
      </table>
    </section>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <VStack gap={1} align="start" className="academy-panel p-6">
      <p className="font-academy-heading text-lg font-bold">{title}</p>
      {children ? <p className="text-sm text-academy-muted">{children}</p> : null}
    </VStack>
  );
}

// Publicar o rechazar un recurso o una nota; solo muestra el cambio que todavía no se aplicó.
export function ReviewButtons({ action, id, status, title }: { action: (data: FormData) => Promise<void>; id: string; status: string; title: string }) {
  return (
    <HStack gap={2}>
      {status !== 'publicado' ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="publicado" /><button className={btnSmall} type="submit">Publicar<small className="sr-only"> {title}</small></button></form> : null}
      {status !== 'rechazado' ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="rechazado" /><button className={`${btnSmall} text-red-800`} type="submit">Rechazar<small className="sr-only"> {title}</small></button></form> : null}
    </HStack>
  );
}

export const reviewTone = (status: string) => (status === 'publicado' ? 'ok' : status === 'rechazado' ? 'bad' : 'wait');
