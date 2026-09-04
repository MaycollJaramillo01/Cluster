'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationStatus, JobOpening } from '@/lib/careers/types';
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
  patchApplications,
  readActor,
  writeActor,
} from './shared';
import { LogoutButton } from './CareersAuthGate';
import { AdminHero } from './AdminHero';

type SalaryBand = 'all' | '0-800' | '800-1500' | '1500-2500' | '2500plus';

const SALARY_BANDS: { id: SalaryBand; min: string; max: string }[] = [
  { id: 'all', min: '', max: '' },
  { id: '0-800', min: '', max: '800' },
  { id: '800-1500', min: '800', max: '1500' },
  { id: '1500-2500', min: '1500', max: '2500' },
  { id: '2500plus', min: '2500', max: '' },
];
type ViewMode = 'people' | 'board';
type QuickFilter = 'all' | 'new' | 'process' | 'offer' | 'hired' | 'due';
type SortKey =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'salary-asc'
  | 'salary-desc'
  | 'rating-desc';

function salaryNumber(value: string) {
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function ApplicationsOffice() {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState<QuickFilter>('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [country, setCountry] = useState('all');
  const [salaryBand, setSalaryBand] = useState<SalaryBand>('all');
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState<ApplicationStatus | ''>('');
  const [batching, setBatching] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>('people');
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<{ ok?: boolean } | null>(null);
  const [actor, setActor] = useState('');
  const [me, setMe] = useState<{
    email?: string;
    name?: string;
    role?: string;
    pendingCount?: number;
  } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    const stored = readActor();
    setActor(stored);
    let cancelled = false;
    (async () => {
      const [listRes, meRes, jobsRes] = await Promise.all([
        fetch('/api/careers/applications', { cache: 'no-store' }),
        fetch('/api/careers/auth', { cache: 'no-store' }),
        fetch('/api/careers/jobs', { cache: 'no-store' }),
      ]);
      const data = (await listRes.json()) as {
        applications?: Application[];
        blob?: { ok?: boolean };
      };
      const me = (await meRes.json()) as {
        email?: string;
        name?: string;
        role?: string;
        pendingCount?: number;
      };
      const jobsData = (await jobsRes.json()) as { jobs?: JobOpening[] };
      if (cancelled) return;
      setApplications(data.applications ?? []);
      setStorage(data.blob ?? null);
      setJobs(jobsData.jobs ?? []);
      setMe(me);
      const display = me.name || stored || me.email || '';
      if (display) {
        writeActor(display);
        setActor(display);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const countries = useMemo(() => {
    return [...new Set(applications.map((item) => item.country).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [applications]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const band = SALARY_BANDS.find((item) => item.id === salaryBand) ?? SALARY_BANDS[0];
    const min = Number(band.min);
    const max = Number(band.max);
    const hasMin = band.min !== '' && Number.isFinite(min);
    const hasMax = band.max !== '' && Number.isFinite(max);
    const list = applications.filter((item) => {
      if (jobFilter !== 'all' && item.jobSlug !== jobFilter) return false;
      if (country !== 'all' && item.country !== country) return false;
      if (hasMin || hasMax) {
        const amount = salaryNumber(item.salaryUsd);
        if (!String(item.salaryUsd).replace(/[^\d.]/g, '')) return false;
        if (hasMin && amount < min) return false;
        if (hasMax && amount > max) return false;
      }
      if (quick === 'new' && item.status !== 'new') return false;
      if (quick === 'process' && !['screening', 'interview', 'test'].includes(item.status)) {
        return false;
      }
      if (quick === 'offer' && item.status !== 'offer') return false;
      if (quick === 'hired' && item.status !== 'hired') return false;
      if (quick === 'due' && !isFollowUpDue(item)) return false;
      if (!needle) return true;
      const hay = `${item.name} ${item.email} ${item.country} ${item.whatsapp} ${item.tags.join(' ')}`.toLowerCase();
      return hay.includes(needle);
    });

    const ranked = [...list];
    ranked.sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'name-asc') return a.name.localeCompare(b.name, locale, { sensitivity: 'base' });
      if (sort === 'name-desc') return b.name.localeCompare(a.name, locale, { sensitivity: 'base' });
      if (sort === 'salary-asc') return salaryNumber(a.salaryUsd) - salaryNumber(b.salaryUsd);
      if (sort === 'salary-desc') return salaryNumber(b.salaryUsd) - salaryNumber(a.salaryUsd);
      if (sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return ranked;
  }, [applications, query, quick, country, jobFilter, salaryBand, sort, locale]);

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
      setApplications((list) => list.map((item) => (item.id === id ? current : item)));
    }
  }

  function onActor(value: string) {
    setActor(value);
    writeActor(value);
  }

  async function saveOwnName() {
    const name = actor.trim();
    if (name.length < 2) return;
    await fetch('/api/careers/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((item) => selected.has(item.id));

  function toggleSelectAll() {
    setSelected((current) => {
      if (allVisibleSelected) {
        const next = new Set(current);
        for (const item of filtered) next.delete(item.id);
        return next;
      }
      const next = new Set(current);
      for (const item of filtered) next.add(item.id);
      return next;
    });
  }

  async function runBatch(patch: Parameters<typeof patchApplications>[1]) {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBatching(true);
    try {
      const saved = await patchApplications(ids, { ...patch, actor });
      const byId = new Map(saved.map((item) => [item.id, item]));
      setApplications((list) => list.map((item) => byId.get(item.id) ?? item));
      setSelected(new Set());
      setBatchStatus('');
    } finally {
      setBatching(false);
    }
  }

  const jobLabel = (slug: string) =>
    jobs.find((job) => job.slug === slug)?.title || t('jobEditor');

  const jobOptions = useMemo(() => {
    const fromApps = applications.map((item) => item.jobSlug).filter(Boolean);
    const fromJobs = jobs.map((job) => job.slug);
    return [...new Set([...fromJobs, ...fromApps])];
  }, [applications, jobs]);

  const chips: { id: QuickFilter; label: string; count: number }[] = [
    { id: 'all', label: t('statusAll'), count: applications.length },
    { id: 'new', label: t('statInbox'), count: stats.inbox },
    { id: 'process', label: t('statProcess'), count: stats.process },
    { id: 'offer', label: t('statOffer'), count: stats.offer },
    { id: 'hired', label: t('statHired'), count: stats.hired },
    { id: 'due', label: t('statDue'), count: stats.due },
  ];

  return (
    <>
      <AdminHero title={t('heroTitle')} subtitle={t('heroSubtitle')}>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {t('count', { count: applications.length })}
        </p>
      </AdminHero>

      <section className="theme-light bg-paper py-16 text-fg sm:py-20">
        <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mono-label text-accent">{t('eyebrow')}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
              {t('title')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {me?.role === 'owner' ? (
              <Link
                href="/postulaciones/equipo"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
              >
                {t('teamLink')}
                {me.pendingCount ? ` · ${me.pendingCount}` : ''}
              </Link>
            ) : null}
            <Link
              href="/postulaciones/puestos"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              {t('jobsLink')}
            </Link>
            <label className="text-sm text-muted">
              {t('actor')}
              <input
                value={actor}
                onChange={(event) => onActor(event.target.value)}
                onBlur={() => void saveOwnName()}
                placeholder={t('actorPlaceholder')}
                className={`${inputClass} mt-1 sm:w-44`}
              />
            </label>
            <LogoutButton />
          </div>
        </div>

        {storage && !storage.ok ? (
          <p className="mt-4 text-sm text-ink-700">{t('blobOff')}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border border-ink-950/10 bg-paper p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search')}
            className={`${inputClass} sm:max-w-sm`}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="min-w-[10rem] flex-1 text-sm text-muted">
              {t('statusLabel')}
              <select
                value={quick}
                onChange={(event) => setQuick(event.target.value as QuickFilter)}
                className={`${inputClass} mt-1`}
              >
                {chips.map((chip) => (
                  <option key={chip.id} value={chip.id}>
                    {chip.label} ({chip.count})
                  </option>
                ))}
              </select>
            </label>
            {jobOptions.length > 0 ? (
              <label className="min-w-[10rem] flex-1 text-sm text-muted">
                {t('segmentJob')}
                <select
                  value={jobFilter}
                  onChange={(event) => setJobFilter(event.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="all">
                    {t('jobAll')} ({applications.length})
                  </option>
                  {jobOptions.map((slug) => (
                    <option key={slug} value={slug}>
                      {jobLabel(slug)} ({applications.filter((item) => item.jobSlug === slug).length})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {countries.length > 0 ? (
              <label className="min-w-[10rem] flex-1 text-sm text-muted">
                {t('segmentCountry')}
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="all">
                    {t('countryAll')} ({applications.length})
                  </option>
                  {countries.map((value) => (
                    <option key={value} value={value}>
                      {value} ({applications.filter((item) => item.country === value).length})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="min-w-[10rem] flex-1 text-sm text-muted">
              {t('filterSalary')}
              <select
                value={salaryBand}
                onChange={(event) => setSalaryBand(event.target.value as SalaryBand)}
                className={`${inputClass} mt-1`}
              >
                {SALARY_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {t(`salaryBand.${band.id}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[10rem] flex-1 text-sm text-muted">
              {t('sortLabel')}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className={`${inputClass} mt-1`}
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="oldest">{t('sortOldest')}</option>
                <option value="name-asc">{t('sortNameAsc')}</option>
                <option value="name-desc">{t('sortNameDesc')}</option>
                <option value="salary-asc">{t('sortSalaryAsc')}</option>
                <option value="salary-desc">{t('sortSalaryDesc')}</option>
                <option value="rating-desc">{t('sortRating')}</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <ViewButton active={view === 'people'} onClick={() => setView('people')}>
              {t('viewList')}
            </ViewButton>
            <ViewButton active={view === 'board'} onClick={() => setView('board')}>
              {t('viewBoard')}
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

        {selected.size > 0 ? (
          <div className="sticky bottom-4 z-10 mt-5 flex flex-col gap-3 border border-ink-950 bg-paper p-4 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg">
              {t('selectedCount', { count: selected.size })}
            </p>
            <select
              value={batchStatus}
              onChange={(event) => setBatchStatus(event.target.value as ApplicationStatus | '')}
              className={`${inputClass} sm:max-w-xs`}
              aria-label={t('batchStatus')}
            >
              <option value="">{t('batchStatus')}</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={batching || !batchStatus}
              onClick={() => {
                if (!batchStatus) return;
                void runBatch({ status: batchStatus });
              }}
              className="bg-ink-950 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper disabled:opacity-40"
            >
              {batching ? t('batchWorking') : t('batchApply')}
            </button>
            <button
              type="button"
              disabled={batching}
              onClick={() => exportCsv(applications.filter((item) => selected.has(item.id)))}
              className="bg-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-fg hover:bg-surface-2"
            >
              {t('batchExport')}
            </button>
            <button
              type="button"
              disabled={batching}
              onClick={() => setSelected(new Set())}
              className="sm:ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              {t('batchClear')}
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-16 mono-label text-faint">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-16 text-muted">
            {applications.length === 0 ? t('emptyNone') : t('empty')}
          </p>
        ) : view === 'people' ? (
          <div className="mt-10">
            <label className="mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t('selectAll')}
            </label>
            <ul className="grid gap-4">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-stretch gap-3">
                <label className="flex items-center border border-ink-950/10 bg-paper px-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    aria-label={item.name}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
                <Link
                  href={`/postulaciones/${item.id}`}
                  className={`flex min-w-0 flex-1 items-center gap-4 border border-ink-950/10 bg-paper p-5 transition-colors hover:border-accent ${
                    isFollowUpOverdue(item) ? 'border-accent' : ''
                  } ${selected.has(item.id) ? 'border-ink-950' : ''}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink-950 font-display text-lg text-paper">
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display text-xl font-semibold uppercase text-ink-950">
                        {item.name}
                      </p>
                      <StatusBadge status={item.status} label={t(`status.${item.status}`)} />
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-700">
                      {jobLabel(item.jobSlug)} · {item.country} · USD {item.salaryUsd}
                      {item.nextActionAt ? ` · ${formatDate(item.nextActionAt, locale)}` : ''}
                    </p>
                  </div>
                  <RatingStars value={item.rating} />
                </Link>
              </li>
            ))}
            </ul>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <BoardRow
              columns={[...PIPELINE_STATUSES]}
              applications={filtered}
              dragging={dragging}
              setDragging={setDragging}
              onDrop={moveTo}
              selected={selected}
              onToggle={toggleSelected}
              jobLabel={jobLabel}
              locale={locale}
              t={t}
            />
            <BoardRow
              columns={[...PARKED_STATUSES]}
              applications={filtered}
              dragging={dragging}
              setDragging={setDragging}
              onDrop={moveTo}
              selected={selected}
              onToggle={toggleSelected}
              jobLabel={jobLabel}
              locale={locale}
              t={t}
            />
          </div>
        )}
        </div>
      </section>
    </>
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
  selected,
  onToggle,
  jobLabel,
  locale,
  t,
}: {
  columns: ApplicationStatus[];
  applications: Application[];
  dragging: string | null;
  setDragging: (id: string | null) => void;
  onDrop: (id: string, status: ApplicationStatus) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  jobLabel: (slug: string) => string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
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
              className="min-h-[12rem] border border-ink-950/10 bg-paper p-3"
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
                      } ${selected.has(item.id) ? 'border-ink-950' : ''}`}
                    >
                      <label
                        className="mb-2 inline-flex items-center gap-2 text-[11px] text-muted"
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => onToggle(item.id)}
                          className="h-3.5 w-3.5 accent-[var(--accent)]"
                        />
                      </label>
                      <Link
                        href={`/postulaciones/${item.id}`}
                        className="block font-display text-sm font-semibold uppercase text-ink-950 hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-ink-700">
                        {jobLabel(item.jobSlug)} · {item.country} · USD {item.salaryUsd}
                      </p>
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
