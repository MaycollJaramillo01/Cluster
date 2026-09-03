'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationEvent, ApplicationStatus } from '@/lib/careers/types';
import { APPLICATION_STATUSES, publicAssetUrl } from '@/lib/careers/types';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import {
  RatingStars,
  StatusBadge,
  formatDateTime,
  inputClass,
  patchApplication,
  readActor,
  whatsappHref,
  writeActor,
} from './shared';
import { LogoutButton } from './CareersAuthGate';

export function ApplicationProfile({ id }: { id: string }) {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [application, setApplication] = useState<Application | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actor, setActor] = useState('');
  const [note, setNote] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionAt, setNextActionAt] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const rawTags = t.raw('tagSuggestions');
  const suggestions = Array.isArray(rawTags) ? (rawTags as string[]) : [];

  useEffect(() => {
    setActor(readActor());
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/careers/applications/${id}`, { cache: 'no-store' });
      if (cancelled) return;
      if (!response.ok) {
        setMissing(true);
        return;
      }
      const data = (await response.json()) as { application?: Application };
      const profile = data.application ?? null;
      setApplication(profile);
      setNextAction(profile?.nextAction ?? '');
      setNextActionAt(profile?.nextActionAt ?? '');
      setRejectionReason(profile?.rejectionReason ?? '');
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save(patch: Parameters<typeof patchApplication>[1]) {
    if (!application) return;
    setSaving(true);
    try {
      const saved = await patchApplication(application.id, { ...patch, actor });
      setApplication(saved);
      setNextAction(saved.nextAction);
      setNextActionAt(saved.nextActionAt);
      setRejectionReason(saved.rejectionReason);
    } finally {
      setSaving(false);
    }
  }

  function onActor(value: string) {
    setActor(value);
    writeActor(value);
  }

  const wa = application ? whatsappHref(application.whatsapp) : '';
  const waInterview = application
    ? whatsappHref(application.whatsapp, t('waInterview', { name: application.name }))
    : '';

  if (missing) {
    return (
      <section className="theme-light bg-paper px-5 pt-36 pb-20 text-fg">
        <div className="container-x">
          <p className="text-muted">{t('notFound')}</p>
          <Link href="/postulaciones" className="mt-4 inline-block text-accent">
            {t('back')}
          </Link>
        </div>
      </section>
    );
  }

  if (!application) {
    return (
      <section className="theme-light flex min-h-[60vh] items-center justify-center bg-paper">
        <p className="mono-label text-faint">{t('loading')}</p>
      </section>
    );
  }

  const portfolioFiles = application.files.filter((file) => file.field === 'portfolio');
  const cv = application.files.find((file) => file.field === 'cv');

  return (
    <section className="theme-light bg-paper pt-32 pb-20 text-fg">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/postulaciones"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
          >
            {t('back')}
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted">
            {t('actor')}
            <input
              value={actor}
              onChange={(event) => onActor(event.target.value)}
              placeholder={t('actorPlaceholder')}
              className="bg-surface px-3 py-2 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
            </label>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono-label text-accent">{t('profileLabel')}</p>
            <h1 className="mt-2 text-4xl text-fg">{application.name}</h1>
            <p className="mt-3 text-[15px] text-muted">
              {t('jobEditor')} · {formatDateTime(application.createdAt, locale)}
            </p>
          </div>
          <StatusBadge status={application.status} label={t(`status.${application.status}`)} />
        </div>

        <div className="mt-8 -mx-5 overflow-x-auto px-5">
          <div className="flex min-w-max gap-1">
            {APPLICATION_STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={saving || application.status === value}
                onClick={() => save({ status: value })}
                className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  application.status === value
                    ? 'bg-ink-950 text-paper'
                    : 'bg-surface text-muted hover:bg-surface-2 hover:text-fg'
                }`}
              >
                {t(`status.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <aside className="space-y-6">
            <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
              <dl className="space-y-4 text-[15px]">
                <Row label={t('email')} value={application.email} href={`mailto:${application.email}`} />
                <Row label={t('whatsapp')} value={application.whatsapp} href={wa || undefined} />
                <Row label={t('country')} value={application.country} />
                <Row label={t('salary')} value={`USD ${application.salaryUsd}`} />
                {application.linkedin ? (
                  <Row label={t('linkedin')} value={application.linkedin} href={application.linkedin} />
                ) : null}
                {application.portfolioUrl ? (
                  <Row
                    label={t('portfolioUrl')}
                    value={application.portfolioUrl}
                    href={application.portfolioUrl}
                  />
                ) : null}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button href={`mailto:${application.email}`} external size="sm" icon="mail">
                  {t('emailCta')}
                </Button>
                {wa ? (
                  <Button href={wa} external size="sm" variant="whatsapp" icon="whatsapp">
                    {t('whatsappCta')}
                  </Button>
                ) : null}
                {waInterview ? (
                  <Button href={waInterview} external size="sm" variant="secondary">
                    {t('whatsappInterview')}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
              <p className="mono-label text-accent">{t('evaluation')}</p>
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted">{t('ratingLabel')}</p>
                <RatingStars value={application.rating} onChange={(rating) => save({ rating })} size={22} />
              </div>

              <div className="mt-6">
                <p className="mb-2 text-sm text-muted">{t('tagsLabel')}</p>
                <div className="flex flex-wrap gap-2">
                  {application.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        save({ tags: application.tags.filter((item) => item !== tag) })
                      }
                      className="bg-ink-950 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const tag = tagDraft.trim();
                    if (!tag) return;
                    save({ tags: [...application.tags, tag] });
                    setTagDraft('');
                  }}
                >
                  <input
                    value={tagDraft}
                    onChange={(event) => setTagDraft(event.target.value)}
                    placeholder={t('tagPlaceholder')}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    className="bg-ink-950 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper"
                  >
                    {t('addTag')}
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions
                    .filter((tag) => !application.tags.some((item) => item.toLowerCase() === tag.toLowerCase()))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => save({ tags: [...application.tags, tag] })}
                        className="bg-surface px-2 py-1 text-xs text-muted hover:text-fg"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
              <p className="mono-label text-accent">{t('followupTitle')}</p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event: FormEvent) => {
                  event.preventDefault();
                  save({ nextAction, nextActionAt });
                }}
              >
                <input
                  value={nextAction}
                  onChange={(event) => setNextAction(event.target.value)}
                  placeholder={t('nextActionPlaceholder')}
                  className={inputClass}
                />
                <input
                  type="date"
                  value={nextActionAt}
                  onChange={(event) => setNextActionAt(event.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-ink-950 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper disabled:opacity-50"
                >
                  {t('saveFollowup')}
                </button>
              </form>
              {(application.status === 'rejected' || rejectionReason) && (
                <div className="mt-6">
                  <p className="mb-2 text-sm text-muted">{t('rejectionLabel')}</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    onBlur={() => {
                      if (rejectionReason !== application.rejectionReason) {
                        save({ rejectionReason });
                      }
                    }}
                    rows={3}
                    className={`${inputClass} resize-y`}
                    placeholder={t('rejectionPlaceholder')}
                  />
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
              <p className="mono-label text-accent">{t('portfolioLabel')}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold uppercase text-ink-950">
                {t('portfolioTitle')}
              </h2>
              {portfolioFiles.length === 0 && !application.portfolioUrl ? (
                <p className="mt-5 text-muted">{t('noMedia')}</p>
              ) : (
                <ul className="mt-6 grid gap-4">
                  {portfolioFiles.map((file) => {
                    const src = publicAssetUrl(application.id, file.id);
                    return (
                      <li key={file.id} className="overflow-hidden bg-ink-950">
                        {file.mimeType.startsWith('video/') ? (
                          <video src={src} controls className="aspect-video w-full bg-black" />
                        ) : file.mimeType.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={file.originalName}
                            className="max-h-[28rem] w-full object-contain"
                          />
                        ) : (
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-5 text-sm text-paper"
                          >
                            <Icon name="link" size={16} />
                            {file.originalName}
                          </a>
                        )}
                        <p className="bg-ink-900 px-4 py-2 text-xs text-white/55">{file.originalName}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {cv ? (
              <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
                <p className="mono-label text-accent">{t('cvLabel')}</p>
                <a
                  href={publicAssetUrl(application.id, cv.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[15px] text-ink-950 hover:text-accent"
                >
                  <Icon name="link" size={16} />
                  {cv.originalName}
                </a>
              </div>
            ) : null}

            <NotesPanel
              application={application}
              note={note}
              setNote={setNote}
              saving={saving}
              locale={locale}
              t={t}
              onSubmit={() => {
                const text = note.trim();
                if (!text) return;
                save({ note: { author: actor, text } });
                setNote('');
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NotesPanel({
  application,
  note,
  setNote,
  saving,
  locale,
  t,
  onSubmit,
}: {
  application: Application;
  note: string;
  setNote: (value: string) => void;
  saving: boolean;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onSubmit: () => void;
}) {
  const timeline = useMemo(() => {
    const notes = application.notes.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      kind: 'note' as const,
      actor: item.author,
      text: item.text,
    }));
    const events = application.events
      .filter((event) => event.type !== 'note')
      .map((event) => ({
        id: event.id,
        createdAt: event.createdAt,
        kind: 'event' as const,
        actor: event.actor,
        event,
      }));
    return [...notes, ...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [application.events, application.notes]);

  return (
    <div className="border border-ink-950/10 bg-paper p-6 sm:p-8">
      <p className="mono-label text-accent">{t('notesTitle')}</p>
      <p className="mt-2 text-sm text-muted">{t('notesIntro')}</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder={t('notePlaceholder')}
          className={`${inputClass} resize-y`}
        />
        <button
          type="submit"
          disabled={saving || !note.trim()}
          className="bg-ink-950 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper disabled:opacity-50"
        >
          {t('addNote')}
        </button>
      </form>

      {timeline.length === 0 ? (
        <p className="mt-6 text-sm text-faint">{t('notesEmpty')}</p>
      ) : (
        <ol className="mt-8 space-y-5">
          {timeline.map((item) => (
            <li key={item.id} className="border-t border-ink-950/10 pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {formatDateTime(item.createdAt, locale)} · {item.actor || t('actorFallback')}
              </p>
              {item.kind === 'note' ? (
                <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink-950">{item.text}</p>
              ) : (
                <p className="mt-2 text-sm text-muted">{eventCopy(item.event, t)}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function eventCopy(event: ApplicationEvent, t: ReturnType<typeof useTranslations>) {
  if (event.type === 'status' && event.from && event.to) {
    return t('eventStatus', {
      from: t(`status.${event.from}`),
      to: t(`status.${event.to}`),
    });
  }
  if (event.type === 'rating') {
    return t('eventRating', { rating: event.to || '0' });
  }
  if (event.type === 'followup') {
    return t('eventFollowup', { text: event.text });
  }
  if (event.type === 'tag') {
    return t('eventTags', { text: event.text });
  }
  return event.text;
}

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = href ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="break-all text-ink-950 hover:text-accent"
    >
      {value}
    </a>
  ) : (
    <span className="break-all text-ink-950">{value}</span>
  );

  return (
    <div>
      <dt className="mono-label text-faint">{label}</dt>
      <dd className="mt-1">{content}</dd>
    </div>
  );
}
