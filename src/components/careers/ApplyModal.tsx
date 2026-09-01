'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { MAX_FILE_BYTES, MAX_PORTFOLIO_FILES } from '@/lib/careers/types';

const inputClass =
  'w-full bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint transition-colors focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  jobSlug?: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplyModal({ open, onClose, jobSlug = 'editor-de-video' }: ApplyModalProps) {
  const t = useTranslations('CareersApply');
  const tc = useTranslations('Common');
  const titleId = useId();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<File[]>([]);
  const [cv, setCv] = useState<File | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSent(false);
      setError('');
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('jobSlug', jobSlug);
    data.delete('portfolio');
    data.delete('cv');
    for (const file of portfolio) data.append('portfolio', file);
    if (cv) data.append('cv', cv);

    const portfolioUrl = String(data.get('portfolioUrl') ?? '').trim();
    const linkedin = String(data.get('linkedin') ?? '').trim();
    if (portfolioUrl) data.set('portfolioUrl', withHttps(portfolioUrl));
    if (linkedin) data.set('linkedin', withHttps(linkedin));

    if (!portfolio.length && !portfolioUrl) {
      setError(t('portfolioRequired'));
      setSending(false);
      return;
    }

    try {
      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: data,
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        const code = result.error || '';
        if (code === 'portfolio_required') throw new Error(t('portfolioRequired'));
        if (code === 'file_too_large' || code === 'payload_too_large') {
          throw new Error(t('fileTooLarge'));
        }
        if (code === 'invalid_file_type') throw new Error(t('invalidFileType'));
        throw new Error(tc('formError'));
      }
      setSent(true);
      form.reset();
      setPortfolio([]);
      setCv(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('formError'));
    } finally {
      setSending(false);
    }
  }

  function addPortfolio(files: FileList | null) {
    if (!files?.length) return;
    setPortfolio((current) => {
      const next = [...current];
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_BYTES) continue;
        if (next.length >= MAX_PORTFOLIO_FILES) break;
        if (next.some((item) => item.name === file.name && item.size === file.size)) continue;
        next.push(file);
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="theme-dark relative z-[1] flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-line bg-ink-900 text-fg shadow-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div>
            <p className="mono-label text-accent">{t('eyebrow')}</p>
            <h2 id={titleId} className="mt-2 font-display text-3xl font-semibold uppercase text-fg">
              {t('title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-10 w-10 items-center justify-center bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center bg-accent text-accent-fg">
                <Icon name="check" size={28} strokeWidth={2.5} />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold uppercase text-fg">
                {t('successTitle')}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                {t('successText')}
              </p>
              <Button className="mt-8" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <p className="text-[15px] leading-relaxed text-muted">{t('intro')}</p>
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="careers-gotcha">
                  {t('name')}
                  <input
                    id="careers-gotcha"
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('name')} name="name" required autoComplete="name" />
                <Field
                  label={t('email')}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                <Field
                  label={t('whatsapp')}
                  name="whatsapp"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder={t('whatsappPlaceholder')}
                />
                <Field
                  label={t('country')}
                  name="country"
                  required
                  autoComplete="country-name"
                  placeholder={t('countryPlaceholder')}
                />
              </div>

              <Field
                label={t('salary')}
                name="salaryUsd"
                type="number"
                required
                min="0"
                step="50"
                placeholder={t('salaryPlaceholder')}
              />

              <div>
                <p className="mb-1.5 text-sm font-medium text-muted">
                  {t('portfolio')}
                  <span className="text-accent"> *</span>
                </p>
                <label className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-line bg-surface px-4 py-8 text-center transition-colors hover:bg-surface-2">
                  <Icon name="upload" size={22} className="text-accent" />
                  <span className="text-sm text-fg">{t('portfolioDrop')}</span>
                  <span className="text-xs text-faint">{t('portfolioHint')}</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*,image/*,.pdf"
                    className="sr-only"
                    onChange={(event) => {
                      addPortfolio(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </label>
                {portfolio.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {portfolio.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="flex items-center justify-between gap-3 bg-surface px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate text-fg">
                          {file.name}{' '}
                          <span className="text-faint">· {formatSize(file.size)}</span>
                        </span>
                        <button
                          type="button"
                          className="text-faint hover:text-fg"
                          onClick={() =>
                            setPortfolio((current) =>
                              current.filter((item) => item !== file),
                            )
                          }
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  name="portfolioUrl"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder={t('portfolioUrlPlaceholder')}
                  className={`${inputClass} mt-3`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('linkedin')}
                  name="linkedin"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder={t('linkedinPlaceholder')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">
                    {t('cv')}
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 bg-surface px-4 py-3 text-sm text-muted hover:bg-surface-2">
                    <span className="truncate">
                      {cv ? cv.name : t('cvPlaceholder')}
                    </span>
                    <Icon name="upload" size={16} />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setCv(file && file.size <= MAX_FILE_BYTES ? file : null);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full"
                iconRight="arrow-right"
                disabled={sending}
              >
                {sending ? tc('sending') : t('submit')}
              </Button>
              <p className="text-center text-xs leading-relaxed text-faint">{t('footnote')}</p>

              {error && (
                <p
                  className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function withHttps(value: string) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  min,
  step,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  min?: string;
  step?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric';
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        step={step}
        className={inputClass}
      />
    </div>
  );
}
