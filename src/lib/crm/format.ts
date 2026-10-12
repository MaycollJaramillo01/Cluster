const TIME_ZONE = 'America/Tegucigalpa';

export function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((Number(cents) || 0) / 100);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('es-HN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(asDate(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('es-HN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(asDate(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(asDate(value));
}

export function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  }).format(asDate(value));
}

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('es-HN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] || '?'}${parts[1]?.[0] || ''}`;
  return letters.slice(0, 2).toUpperCase();
}

export function rate(value: number) {
  return `${Number(value || 0).toFixed(1)}%`;
}
