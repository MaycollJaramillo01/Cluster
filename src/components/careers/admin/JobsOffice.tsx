'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { JobOpening } from '@/lib/careers/types';
import { btnQuiet, btnSolid, inputClass, paperCard } from './shared';
import { AdminHero } from './AdminHero';
import { LogoutButton } from './CareersAuthGate';
import { Button } from '@/components/ui/Button';

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  location: 'Remoto',
  employment: 'Tiempo completo',
};

export function JobsOffice() {
  const t = useTranslations('CareersAdmin');
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState('');

  async function load() {
    const response = await fetch('/api/careers/jobs', { cache: 'no-store' });
    if (!response.ok) return;
    const data = (await response.json()) as { jobs?: JobOpening[] };
    setJobs(data.jobs ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function field<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError('');
    setNotice('');
    const response = await fetch('/api/careers/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as { job?: JobOpening; error?: string };
    setSending(false);
    if (!response.ok || !data.job) {
      if (data.error === 'title_required') setError(t('jobTitleRequired'));
      else if (data.error === 'summary_required') setError(t('jobSummaryRequired'));
      else setError(t('jobCreateError'));
      return;
    }
    setForm(emptyForm);
    setNotice(t('jobCreated'));
    await load();
  }

  async function toggleOpen(job: JobOpening) {
    await fetch('/api/careers/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: job.slug, open: !job.open }),
    });
    await load();
  }

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/carreras/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    window.setTimeout(() => setCopied(''), 1600);
  }

  return (
    <>
      <AdminHero title={t('jobsHeading')} subtitle={t('jobsIntro')} />
      <section className="theme-light bg-paper py-16 text-fg sm:py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/postulaciones"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              ← {t('back')}
            </Link>
            <LogoutButton />
          </div>

          <form onSubmit={onCreate} className={`${paperCard} mt-10 max-w-3xl space-y-4`}>
            <p className="mono-label text-accent">{t('jobsFormEyebrow')}</p>
            <h2 className="font-display text-2xl font-semibold text-ink-950">{t('jobsFormTitle')}</h2>
            <label className="block text-sm text-muted">
              {t('jobTitle')}
              <input
                required
                value={form.title}
                onChange={(event) => field('title', event.target.value)}
                placeholder={t('jobTitlePlaceholder')}
                className={`${inputClass} mt-2`}
              />
            </label>
            <label className="block text-sm text-muted">
              {t('jobSummary')}
              <textarea
                required
                rows={3}
                value={form.summary}
                onChange={(event) => field('summary', event.target.value)}
                placeholder={t('jobSummaryPlaceholder')}
                className={`${inputClass} mt-2 resize-y`}
              />
            </label>
            <label className="block text-sm text-muted">
              {t('jobDescription')}
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => field('description', event.target.value)}
                placeholder={t('jobDescriptionPlaceholder')}
                className={`${inputClass} mt-2 resize-y`}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-muted">
                {t('jobLocation')}
                <input
                  value={form.location}
                  onChange={(event) => field('location', event.target.value)}
                  className={`${inputClass} mt-2`}
                />
              </label>
              <label className="block text-sm text-muted">
                {t('jobEmployment')}
                <input
                  value={form.employment}
                  onChange={(event) => field('employment', event.target.value)}
                  className={`${inputClass} mt-2`}
                />
              </label>
            </div>
            {error ? (
              <p className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-800">{error}</p>
            ) : null}
            {notice ? <p className="text-sm text-ink-700">{notice}</p> : null}
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? t('entering') : t('jobCreate')}
            </Button>
          </form>

          <div className="mt-12">
            <p className="mono-label text-accent">{t('jobsListEyebrow')}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink-950">{t('jobsListTitle')}</h2>
            {jobs.length === 0 ? (
              <p className="mt-6 text-muted">{t('jobsEmpty')}</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {jobs.map((job) => (
                  <li key={job.slug} className={`${paperCard} flex flex-col gap-4 sm:flex-row sm:items-start`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-semibold uppercase text-ink-950">{job.title}</p>
                      <p className="mt-2 text-sm text-muted">{job.summary}</p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                        {job.open ? t('jobOpen') : t('jobClosed')} · {job.location} · {job.employment}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/carreras/${job.slug}`} className={btnQuiet}>
                        {t('jobView')}
                      </Link>
                      <button type="button" className={btnQuiet} onClick={() => void copyLink(job.slug)}>
                        {copied === job.slug ? t('jobCopied') : t('jobCopyLink')}
                      </button>
                      <button
                        type="button"
                        className={job.open ? btnQuiet : btnSolid}
                        onClick={() => void toggleOpen(job)}
                      >
                        {job.open ? t('jobClose') : t('jobReopen')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
