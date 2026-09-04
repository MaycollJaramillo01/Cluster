'use client';

import { Icon } from '@/components/ui/Icon';
import type { Application, ApplicationPatchInput, ApplicationStatus } from '@/lib/careers/types';

export const ACTOR_KEY = 'cluster-hr-actor';

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDate(value: string, locale: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string, locale: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function whatsappHref(value: string, text?: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function readActor() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACTOR_KEY) ?? '';
}

export function writeActor(value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACTOR_KEY, value.trim());
}

export async function patchApplication(id: string, patch: ApplicationPatchInput) {
  const response = await fetch(`/api/careers/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...patch, actor: patch.actor || readActor() }),
  });
  const data = (await response.json()) as { application?: Application; error?: string };
  if (!response.ok || !data.application) {
    throw new Error(data.error || 'save_failed');
  }
  return data.application;
}

export async function patchApplications(ids: string[], patch: ApplicationPatchInput) {
  const response = await fetch('/api/careers/applications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, patch: { ...patch, actor: patch.actor || readActor() } }),
  });
  const data = (await response.json()) as { applications?: Application[]; error?: string };
  if (!response.ok || !data.applications) {
    throw new Error(data.error || 'save_failed');
  }
  return data.applications;
}

export function exportCsv(applications: Application[]) {
  const header = [
    'nombre',
    'email',
    'whatsapp',
    'pais',
    'salario_usd',
    'estado',
    'rating',
    'tags',
    'proxima_accion',
    'fecha_accion',
    'motivo_descarte',
    'creado',
  ];
  const rows = applications.map((item) => [
    item.name,
    item.email,
    item.whatsapp,
    item.country,
    item.salaryUsd,
    item.status,
    String(item.rating || ''),
    item.tags.join('; '),
    item.nextAction,
    item.nextActionAt,
    item.rejectionReason,
    item.createdAt,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seleccion-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const STATUS_TONE: Record<ApplicationStatus, string> = {
  new: 'bg-accent/15 text-ink-950',
  screening: 'bg-ink-950/8 text-ink-950',
  interview: 'bg-accent/15 text-ink-950',
  test: 'bg-ink-950/8 text-ink-950',
  offer: 'bg-accent text-accent-fg',
  hired: 'bg-ink-950 text-paper',
  hold: 'bg-ink-950/8 text-ink-700',
  rejected: 'bg-ink-950/8 text-ink-700',
  archived: 'bg-ink-950/5 text-faint',
};

export function StatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[status]}`}
    >
      {label}
    </span>
  );
}

export function RatingStars({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        const className = active ? 'text-accent' : 'text-ink-950/20';
        if (!onChange) {
          return (
            <Icon
              key={star}
              name="star"
              size={size}
              className={className}
              fill={active ? 'currentColor' : 'none'}
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star}`}
            onClick={() => onChange(star === value ? 0 : star)}
            className={className}
          >
            <Icon name="star" size={size} fill={active ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}

export const inputClass =
  'w-full bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] [&>option]:bg-paper';

export const paperCard = 'border border-ink-950/10 bg-paper p-6 sm:p-7';

export const btnSolid =
  'inline-flex items-center justify-center bg-ink-950 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper hover:opacity-90 disabled:opacity-50';

export const btnQuiet =
  'inline-flex items-center justify-center bg-surface px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg hover:bg-surface-2 disabled:opacity-50';
