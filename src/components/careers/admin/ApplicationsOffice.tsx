'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationStatus } from '@/lib/careers/types';
import { APPLICATION_STATUSES, PARKED_STATUSES, PIPELINE_STATUSES } from '@/lib/careers/types';
import { isFollowUpDue, isFollowUpOverdue } from '@/lib/careers/crm';
import { Icon } from '@/components/ui/Icon';
import {
  RatingStars,
  StatusBadge,
  exportCsv,
  formatDate,
  initials,
  inputClass,
  patchApplication,
  readActor,
  writeActor,
} from './shared';
import { LogoutButton } from './CareersAuthGate';

type ViewMode = 'board' | 'list';

export function ApplicationsOffice() {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [country, setCountry] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [dueOnly, setDueOnly] = useState(false);
  const [view, setView] = useState<ViewMode>('board');
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<{ ok?: boolean } | null>(null);
  const [actor, setActor] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    setActor(readActor());
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

  const countries = useMemo(() => {
    return [...new Set(applications.map((item) => item.country).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [applications]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (country !== 'all' && item.country !== country) return false;
      if (minRating > 0 && item.rating < minRating) return false;
      if (dueOnly && !isFollowUpDue(item)) return false;
      if (!needle) return true;
      const hay = `${item.name} ${item.email} ${item.country} ${item.whatsapp} ${item.tags.join(' ')} ${item.nextAction}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [applications, query, status, country, minRating, dueOnly]);

  const stats = useMemo(() => {
    const inbox = applications.filter((item) => item.status === 'new').length;
    const process = applications.filter((item) =>
      ['screening', 'interview', 'test'].includes(item.status),
    ).length;
    const offer = applications.filter((item) => item.status === 'offer').length;
    const hired = applications.filter((item) => item.status === 'hired').length;
    const due = applications.filter((item) => isFollowUpDue(item)).length;
    return { inbox, process, offer, hired, due };
  }, [applications]);

  async function moveTo(id: string, nextStatus: ApplicationStatus) {
    const current = applications.find((item) => item.id === id);
    if (!current || current.status === nextStatus) return;
    setApplications((list) =>
      list.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    );
    try {
      const saved = await patchApplication(id, { status: nextStatus, actor });
      setApplications((list) => list.map((item) => (item.id === id ? saved : item)));
    } catch {
      setApplications((list) =>
        list.map((item) => (item.id === id ? current : item)),
      );
    }
  }

  function onActor(value: string) {
    setActor(value);
    writeActor(value);
  }

  return (
    <section className="theme-light bg-paper pt-32 pb-20 text-fg">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mono-label text-accent">{t('eyebrow')}</p>
            <h1 className="mt-3 text-4xl text-fg sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-[15px] text-muted">{t('count', { count: applications.length })}</p>
            {storage ? (
              <p className={`mt-3 text-sm ${storage.ok ? 'text-accent' : 'text-ink-700'}`}>
                {storage.ok ? t('blobOk') : t('blobOff')}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <LogoutButton />
            <label className="block text-sm text-muted">
            {t('actor')}
            <input
              value={actor}
              onChange={(event) => onActor(event.target.value)}
              placeholder={t('actorPlaceholder')}
              className={`${inputClass} mt-1.5 sm:w-56`}
            />
            </label>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label={t('statInbox')} value={stats.inbox} />
          <Stat label={t('statProcess')} value={stats.process} />
          <Stat label={t('statOffer')} value={stats.offer} />
          <Stat label={t('statHired')} value={stats.hired} />
          <Stat label={t('statDue')} value={stats.due} accent={stats.due > 0} />
        </div>

        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search')}
            className={`${inputClass} lg:max-w-sm`}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus | 'all')}
            className={inputClass}
          >
            <option value="all">{t('statusAll')}</option>
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className={inputClass}
          >
            <option value="all">{t('countryAll')}</option>
            {countries.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={minRating}
            onChange={(event) => setMinRating(Number(event.target.value))}
            className={inputClass}
          >
            <option value={0}>{t('ratingAll')}</option>
            {[3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {t('ratingMin', { count: value })}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(event) => setDueOnly(event.target.checked)}
            />
            {t('dueOnly')}
          </label>
          <div className="ml-auto flex flex-wrap gap-2">
            <ViewButton active={view === 'board'} onClick={() => setView('board')}>
              {t('viewBoard')}
            </ViewButton>
            <ViewButton active={view === 'list'} onClick={() => setView('list')}>
              {t('viewList')}
            </ViewButton>
            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="bg-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-fg hover:bg-surface-2 disabled:opacity-40"
            >
              {t('exportCsv')}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-16 mono-label text-faint">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-16 text-muted">
            {applications.length === 0 ? t('emptyNone') : t('empty')}
          </p>
        ) : view === 'board' ? (
          <div className="mt-8 space-y-6">
            <BoardRow
              columns={[...PIPELINE_STATUSES]}
              applications={filtered}
              dragging={dragging}
              setDragging={setDragging}
              onDrop={moveTo}
              locale={locale}
              t={t}
            />
            <BoardRow
              columns={[...PARKED_STATUSES]}
              applications={filtered}
              dragging={dragging}
              setDragging={setDragging}
              onDrop={moveTo}
              locale={locale}
              t={t}
              muted
            />
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto border border-ink-950/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('colCandidate')}</th>
                  <th className="px-4 py-3 font-medium">{t('colStage')}</th>
                  <th className="px-4 py-3 font-medium">{t('colRating')}</th>
                  <th className="px-4 py-3 font-medium">{t('colFollowup')}</th>
                  <th className="px-4 py-3 font-medium">{t('colApplied')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-ink-950/10">
                    <td className="px-4 py-4">
                      <Link href={`/postulaciones/${item.id}`} className="block hover:text-accent">
                        <span className="font-medium text-ink-950">{item.name}</span>
                        <span className="mt-1 block text-xs text-faint">
                          {item.country} · USD {item.salaryUsd}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} label={t(`status.${item.status}`)} />
                    </td>
                    <td className="px-4 py-4">
                      <RatingStars value={item.rating} />
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {item.nextActionAt ? (
                        <span className={isFollowUpOverdue(item) ? 'text-ink-950' : undefined}>
                          {formatDate(item.nextActionAt, locale)}
                          {item.nextAction ? ` · ${item.nextAction}` : ''}
                        </span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-faint">{formatDate(item.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="border border-ink-950/10 bg-paper px-5 py-4">
      <p className="mono-label text-faint">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent ? 'text-accent' : 'text-ink-950'}`}>
        {value}
      </p>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] ${
        active ? 'bg-ink-950 text-paper' : 'bg-surface text-fg hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  );
}

function BoardRow({
  columns,
  applications,
  dragging,
  setDragging,
  onDrop,
  locale,
  t,
  muted,
}: {
  columns: ApplicationStatus[];
  applications: Application[];
  dragging: string | null;
  setDragging: (id: string | null) => void;
  onDrop: (id: string, status: ApplicationStatus) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  muted?: boolean;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-0 sm:px-0">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
      >
        {columns.map((column) => {
          const cards = applications.filter((item) => item.status === column);
          return (
            <div
              key={column}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData('text/plain') || dragging;
                if (id) onDrop(id, column);
                setDragging(null);
              }}
              className={`min-h-[12rem] border bg-paper p-3 ${
                muted ? 'border-ink-950/8' : 'border-ink-950/10'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="mono-label text-muted">{t(`status.${column}`)}</p>
                <span className="font-mono text-[11px] text-faint">{cards.length}</span>
              </div>
              <ul className="space-y-2">
                {cards.map((item) => (
                  <li key={item.id}>
                    <article
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', item.id);
                        setDragging(item.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                      className={`border border-ink-950/10 bg-paper p-3 ${
                        dragging === item.id ? 'opacity-50' : ''
                      } ${isFollowUpOverdue(item) ? 'border-accent' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-8 w-8 items-center justify-center bg-ink-950 font-display text-xs text-paper">
                          {initials(item.name)}
                        </span>
                        <RatingStars value={item.rating} size={12} />
                      </div>
                      <Link
                        href={`/postulaciones/${item.id}`}
                        className="mt-3 block font-display text-sm font-semibold uppercase text-ink-950 hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-ink-700">
                        {item.country} · USD {item.salaryUsd}
                      </p>
                      {item.tags.length > 0 ? (
                        <p className="mt-2 truncate text-[11px] text-faint">{item.tags.join(' · ')}</p>
                      ) : null}
                      {item.nextActionAt ? (
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted">
                          <Icon name="calendar" size={12} />
                          {formatDate(item.nextActionAt, locale)}
                        </p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
