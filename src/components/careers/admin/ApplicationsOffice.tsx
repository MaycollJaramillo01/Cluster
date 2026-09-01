'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationStatus } from '@/lib/careers/types';
import { APPLICATION_STATUSES } from '@/lib/careers/types';
import { Icon } from '@/components/ui/Icon';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function ApplicationsOffice() {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<{ ok?: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch('/api/careers/applications', { cache: 'no-store' });
      const data = (await response.json()) as {
        applications?: Application[];
        blob?: { ok?: boolean };
      };
      if (!cancelled) {
        setApplications(data.applications ?? []);
        setStorage(data.blob ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (!needle) return true;
      const hay = `${item.name} ${item.email} ${item.country} ${item.whatsapp}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [applications, query, status]);

  return (
    <section className="theme-light bg-paper pt-32 pb-20 text-fg">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mono-label text-accent">{t('eyebrow')}</p>
            <h1 className="mt-3 text-4xl text-fg sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-[15px] text-muted">
              {t('count', { count: applications.length })}
            </p>
            {storage ? (
              <p
                className={`mt-3 text-sm ${
                  storage.ok ? 'text-accent' : 'text-ink-700'
                }`}
              >
                {storage.ok ? t('blobOk') : t('blobOff')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search')}
            className="w-full bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:max-w-sm"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus | 'all')}
            className="bg-surface px-4 py-3 text-[15px] text-fg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] [&>option]:bg-paper"
          >
            <option value="all">{t('statusAll')}</option>
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-16 mono-label text-faint">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-16 text-muted">{t('empty')}</p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/postulaciones/${item.id}`}
                  className="flex h-full flex-col border border-ink-950/10 bg-paper p-6 transition-colors hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center bg-ink-950 font-display text-lg text-paper">
                      {initials(item.name)}
                    </span>
                    <span className="mono-label text-accent">{t(`status.${item.status}`)}</span>
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold uppercase text-ink-950">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-sm text-ink-700">
                    {item.country} · USD {item.salaryUsd}
                  </p>
                  <p className="mt-1 truncate text-sm text-faint">{item.email}</p>
                  <div className="mt-6 flex items-center justify-between text-xs text-faint">
                    <span>{formatDate(item.createdAt, locale)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="video" size={14} />
                      {item.files.filter((file) => file.field === 'portfolio').length}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
