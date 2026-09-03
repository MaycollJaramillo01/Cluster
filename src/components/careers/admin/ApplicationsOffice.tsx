'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationStatus } from '@/lib/careers/types';
import { PARKED_STATUSES, PIPELINE_STATUSES } from '@/lib/careers/types';
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

type ViewMode = 'people' | 'board';
type QuickFilter = 'all' | 'new' | 'process' | 'offer' | 'hired' | 'due';

export function ApplicationsOffice() {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState<QuickFilter>('all');
  const [view, setView] = useState<ViewMode>('people');
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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((item) => {
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
  }, [applications, query, quick]);

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

  const chips: { id: QuickFilter; label: string; count: number }[] = [
    { id: 'all', label: t('statusAll'), count: applications.length },
    { id: 'new', label: t('statInbox'), count: stats.inbox },
    { id: 'process', label: t('statProcess'), count: stats.process },
    { id: 'offer', label: t('statOffer'), count: stats.offer },
    { id: 'hired', label: t('statHired'), count: stats.hired },
    { id: 'due', label: t('statDue'), count: stats.due },
  ];

  return (
    <section className="crm-shell min-h-screen pt-28 pb-16">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#02C39A]">{t('eyebrow')}</p>
            <h1 className="mt-1 text-3xl text-[#17201d] sm:text-4xl">{t('title')}</h1>
            <p className="mt-2 text-[15px] text-[#5b6b66]">{t('count', { count: applications.length })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-[#5b6b66]">
              {t('actor')}
              <input
                value={actor}
                onChange={(event) => onActor(event.target.value)}
                placeholder={t('actorPlaceholder')}
                className={`${inputClass} mt-1 sm:w-44`}
              />
            </label>
            <LogoutButton />
          </div>
        </div>

        {storage && !storage.ok ? (
          <p className="mt-4 text-sm text-[#5b6b66]">{t('blobOff')}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setQuick(chip.id)}
              className={`rounded-[999px] px-3.5 py-2 text-sm ${
                quick === chip.id
                  ? 'bg-[#17201d] text-white'
                  : 'bg-white text-[#5b6b66] hover:text-[#17201d]'
              }`}
            >
              {chip.label} {chip.count}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search')}
            className={`${inputClass} bg-white sm:max-w-md`}
          />
          <div className="flex flex-wrap gap-2 sm:ml-auto">
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
              className="crm-btn crm-btn-quiet px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('exportCsv')}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-16 text-sm text-[#5b6b66]">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <div className="crm-card mt-10 px-6 py-12 text-center text-[#5b6b66]">
            {applications.length === 0 ? t('emptyNone') : t('empty')}
          </div>
        ) : view === 'people' ? (
          <ul className="mt-8 grid gap-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/postulaciones/${item.id}`}
                  className={`crm-card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 ${
                    isFollowUpOverdue(item) ? 'ring-2 ring-[#02C39A]' : ''
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[999px] bg-[#02C39A] text-sm font-semibold text-[#111]">
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-[#17201d]">{item.name}</p>
                      <StatusBadge status={item.status} label={t(`status.${item.status}`)} />
                    </div>
                    <p className="mt-1 truncate text-sm text-[#5b6b66]">
                      {item.country} · USD {item.salaryUsd}
                      {item.nextActionAt ? ` · ${formatDate(item.nextActionAt, locale)}` : ''}
                    </p>
                  </div>
                  <RatingStars value={item.rating} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
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
            />
          </div>
        )}
      </div>
    </section>
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
      className={`rounded-[999px] px-4 py-2 text-sm ${
        active ? 'bg-[#17201d] text-white' : 'bg-white text-[#5b6b66]'
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
}: {
  columns: ApplicationStatus[];
  applications: Application[];
  dragging: string | null;
  setDragging: (id: string | null) => void;
  onDrop: (id: string, status: ApplicationStatus) => void;
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
              className="crm-card min-h-[12rem] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#5b6b66]">{t(`status.${column}`)}</p>
                <span className="text-xs text-[#8a9b95]">{cards.length}</span>
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
                      className={`rounded-[1rem] bg-[#eef3f1] p-3 ${
                        dragging === item.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link
                        href={`/postulaciones/${item.id}`}
                        className="block text-sm font-semibold text-[#17201d] hover:text-[#08604c]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#5b6b66]">
                        {item.country} · USD {item.salaryUsd}
                      </p>
                      {item.nextActionAt ? (
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#5b6b66]">
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
