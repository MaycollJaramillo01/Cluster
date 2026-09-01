'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Application, ApplicationStatus } from '@/lib/careers/types';
import { APPLICATION_STATUSES, publicAssetUrl } from '@/lib/careers/types';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isVideo(mime: string) {
  return mime.startsWith('video/');
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

export function ApplicationProfile({ id }: { id: string }) {
  const t = useTranslations('CareersAdmin');
  const locale = useLocale();
  const [application, setApplication] = useState<Application | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/careers/applications/${id}`, { cache: 'no-store' });
      if (cancelled) return;
      if (!response.ok) {
        setMissing(true);
        return;
      }
      const data = (await response.json()) as { application?: Application };
      setApplication(data.application ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function changeStatus(status: ApplicationStatus) {
    if (!application) return;
    setSaving(true);
    const response = await fetch(`/api/careers/applications/${application.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as { application?: Application };
    if (data.application) setApplication(data.application);
    setSaving(false);
  }

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

  const wa = whatsappHref(application.whatsapp);
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
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <aside className="border border-ink-950/10 bg-paper p-6 sm:p-8">
            <span className="flex h-16 w-16 items-center justify-center bg-ink-950 font-display text-2xl text-paper">
              {application.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('')}
            </span>
            <p className="mt-6 mono-label text-accent">{t('profileLabel')}</p>
            <h1 className="mt-2 text-4xl text-fg">{application.name}</h1>
            <p className="mt-3 text-[15px] text-muted">
              {t('jobEditor')} · {formatDate(application.createdAt, locale)}
            </p>

            <dl className="mt-8 space-y-4 text-[15px]">
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

            <div className="mt-8">
              <label className="mb-2 block text-sm font-medium text-muted" htmlFor="status">
                {t('statusLabel')}
              </label>
              <select
                id="status"
                value={application.status}
                disabled={saving}
                onChange={(event) => changeStatus(event.target.value as ApplicationStatus)}
                className="w-full bg-surface px-4 py-3 text-[15px] text-fg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] [&>option]:bg-paper"
              >
                {APPLICATION_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t(`status.${value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button href={`mailto:${application.email}`} external size="sm" icon="mail">
                {t('emailCta')}
              </Button>
              {wa ? (
                <Button href={wa} external size="sm" variant="whatsapp" icon="whatsapp">
                  {t('whatsappCta')}
                </Button>
              ) : null}
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
                    const src = file.url || publicAssetUrl(application.id, file.id);
                    return (
                      <li key={file.id} className="overflow-hidden bg-ink-950">
                        {isVideo(file.mimeType) ? (
                          <video src={src} controls className="aspect-video w-full bg-black" />
                        ) : isImage(file.mimeType) ? (
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
                        <p className="bg-ink-900 px-4 py-2 text-xs text-white/55">
                          {file.originalName}
                        </p>
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
                  href={cv.url || publicAssetUrl(application.id, cv.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[15px] text-ink-950 hover:text-accent"
                >
                  <Icon name="link" size={16} />
                  {cv.originalName}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
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
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-all text-ink-950 hover:text-accent">
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
