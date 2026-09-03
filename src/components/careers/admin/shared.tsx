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
  new: 'bg-emerald-50 text-emerald-800',
  screening: 'bg-sky-50 text-sky-800',
  interview: 'bg-violet-50 text-violet-800',
  test: 'bg-amber-50 text-amber-800',
  offer: 'bg-[#02C39A]/20 text-[#08604c]',
  hired: 'bg-ink-950 text-white',
  hold: 'bg-stone-100 text-stone-600',
  rejected: 'bg-rose-50 text-rose-800',
  archived: 'bg-stone-100 text-stone-500',
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
      className={`inline-flex rounded-[999px] px-2.5 py-1 text-xs font-medium ${STATUS_TONE[status]}`}
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

export const inputClass = 'crm-input [&>option]:bg-white';
