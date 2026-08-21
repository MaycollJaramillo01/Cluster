'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type AuditStatus = 'ok' | 'warning' | 'critical';

type AuditItem = {
  title: string;
  detail: string;
  impact?: string;
  effort?: string;
  status?: AuditStatus;
};

type AuditResponse = {
  score: number;
  summary: string;
  quickWins: string[];
  priorities: AuditItem[];
  technical: AuditItem[];
  content: AuditItem[];
  localSeo: AuditItem[];
  conversion: AuditItem[];
  nextSteps: string[];
  snapshot?: {
    url: string;
    finalUrl: string;
    status: number;
    loadTimeMs: number;
    title: string;
    metaDescription: string;
    h1Count: number;
    wordCount: number;
    images: number;
    imagesMissingAlt: number;
  };
};

const inputClass =
  'w-full bg-surface px-4 py-3.5 text-[16px] text-fg placeholder:text-faint transition-colors focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

const statusClass: Record<AuditStatus, string> = {
  ok: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700',
  critical: 'border-red-500/25 bg-red-500/10 text-red-700',
};

export function SeoAuditTool() {
  const t = useTranslations('SeoAuditTool');
  const tc = useTranslations('Common');
  const [url, setUrl] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audit, setAudit] = useState<AuditResponse | null>(null);

  const statusCopy: Record<AuditStatus, string> = {
    ok: tc('statusOk'),
    warning: tc('statusWarning'),
    critical: tc('statusCritical'),
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAudit(null);

    try {
      const response = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, businessType }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || tc('auditError'));
      }

      setAudit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('auditError'));
    } finally {
      setLoading(false);
    }
  }

  const sections = t.raw('sections') as Record<string, string>;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-6 sm:p-8"
        aria-label={tc('auditFormAria')}
      >
        <div className="flex h-12 w-12 items-center justify-center bg-surface-2 text-accent">
          <Icon name="search" size={24} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold text-fg sm:text-4xl">
          {t('formTitle')}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('formDescription')}</p>

        <div className="mt-7 space-y-5">
          <div>
            <label htmlFor="audit-url" className="mb-2 block text-sm font-medium text-muted">
              {tc('siteUrl')}
            </label>
            <input
              id="audit-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder={tc('urlPlaceholder')}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="business-type"
              className="mb-2 block text-sm font-medium text-muted"
            >
              {tc('businessType')}
            </label>
            <input
              id="business-type"
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value)}
              type="text"
              placeholder={tc('businessTypePlaceholder')}
              className={inputClass}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          iconRight="arrow-right"
          disabled={loading}
          className="mt-7 w-full"
        >
          {loading ? tc('analyzing') : tc('generateAudit')}
        </Button>

        {error && (
          <p
            className="mt-4 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>

      <div className="min-h-[28rem] bg-surface p-6 sm:p-8" aria-live="polite">
        {loading && <LoadingState title={t('loadingTitle')} text={t('loadingText')} />}
        {!loading && !audit && !error && (
          <EmptyState
            resultLabel={tc('result')}
            title={t('emptyTitle')}
            categories={t.raw('emptyCategories') as string[]}
          />
        )}
        {!loading && audit && (
          <AuditResults
            audit={audit}
            sections={sections}
            statusCopy={statusCopy}
            tc={tc}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({
  resultLabel,
  title,
  categories,
}: {
  resultLabel: string;
  title: string;
  categories: string[];
}) {
  return (
    <div className="flex h-full min-h-[24rem] flex-col justify-between">
      <div>
        <p className="mono-label text-accent">{resultLabel}</p>
        <h3 className="mt-5 font-display text-3xl font-semibold text-fg sm:text-4xl">
          {title}
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((item) => (
          <div key={item} className="border border-line p-4">
            <span className="mono-label text-faint">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex h-full min-h-[24rem] flex-col justify-center">
      <div className="h-2 w-full overflow-hidden bg-surface-2">
        <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent" />
      </div>
      <h3 className="mt-8 font-display text-3xl font-semibold text-fg">{title}</h3>
      <p className="mt-3 text-[15px] text-muted">{text}</p>
    </div>
  );
}

function AuditResults({
  audit,
  sections,
  statusCopy,
  tc,
  t,
}: {
  audit: AuditResponse;
  sections: Record<string, string>;
  statusCopy: Record<AuditStatus, string>;
  tc: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
}) {
  const scoreLabel =
    audit.score >= 80 ? tc('scoreSolid') : audit.score >= 60 ? tc('scoreImprove') : tc('scoreUrgent');

  const auditedUrl = audit.snapshot?.finalUrl || audit.snapshot?.url || '';
  const params = new URLSearchParams({
    servicio: 'SEO Audit',
    origen: 'seo-audit',
    score: String(audit.score),
  });
  if (auditedUrl) params.set('url', auditedUrl);
  const contactHref = `/contacto?${params.toString()}`;

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mono-label text-accent">{tc('seoScore')}</p>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{audit.summary}</p>
        </div>
        <div className="flex h-28 w-28 flex-none flex-col items-center justify-center border border-line bg-theme text-center">
          <span className="font-display text-5xl font-semibold leading-none text-fg">
            {audit.score}
          </span>
          <span className="mono-label mt-2 text-[9px] text-faint">{scoreLabel}</span>
        </div>
      </div>

      {audit.snapshot && (
        <dl className="grid gap-px border-b border-line bg-surface-2 py-px sm:grid-cols-3">
          <Metric label={tc('status')} value={String(audit.snapshot.status)} />
          <Metric label={tc('words')} value={String(audit.snapshot.wordCount)} />
          <Metric
            label={tc('imagesMissingAlt')}
            value={`${audit.snapshot.imagesMissingAlt}/${audit.snapshot.images}`}
          />
        </dl>
      )}

      <ResultSection title={sections.quickWins} items={audit.quickWins} />
      <ItemSection
        title={sections.priorities}
        items={audit.priorities}
        showImpact
        statusCopy={statusCopy}
        tc={tc}
      />
      <ItemSection title={sections.technical} items={audit.technical} statusCopy={statusCopy} tc={tc} />
      <ItemSection title={sections.content} items={audit.content} statusCopy={statusCopy} tc={tc} />
      <ItemSection title={sections.localSeo} items={audit.localSeo} statusCopy={statusCopy} tc={tc} />
      <ItemSection title={sections.conversion} items={audit.conversion} statusCopy={statusCopy} tc={tc} />
      <ResultSection title={sections.nextSteps} items={audit.nextSteps} />

      <div className="mt-8 border border-[color:rgba(2,195,154,0.35)] bg-theme p-6 sm:p-7">
        <p className="mono-label text-accent">{t('ctaEyebrow')}</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-fg sm:text-3xl">
          {t('ctaTitle')}
        </h3>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          {t('ctaText')}
        </p>
        <Button href={contactHref} size="lg" iconRight="arrow-right" className="mt-6">
          {t('ctaButton')}
        </Button>
        <p className="mt-3 text-xs text-faint">{t('ctaNote')}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-theme p-4">
      <dt className="mono-label text-[9px] text-faint">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold text-fg">{value}</dd>
    </div>
  );
}

function ResultSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="border-b border-line py-7">
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-muted">
            <Icon
              name="check"
              size={16}
              className="mt-1 flex-none text-accent"
              strokeWidth={2.4}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ItemSection({
  title,
  items,
  showImpact = false,
  statusCopy,
  tc,
}: {
  title: string;
  items: AuditItem[];
  showImpact?: boolean;
  statusCopy: Record<AuditStatus, string>;
  tc: ReturnType<typeof useTranslations>;
}) {
  if (!items.length) return null;

  return (
    <section className="border-b border-line py-7">
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      <div className="mt-4 divide-y divide-line border border-line">
        {items.map((item) => (
          <article key={`${item.title}-${item.detail}`} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-semibold normal-case text-fg">{item.title}</h4>
              {item.status && (
                <span
                  className={`border px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${statusClass[item.status]}`}
                >
                  {statusCopy[item.status]}
                </span>
              )}
              {showImpact && item.impact && (
                <span className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {tc('impact', { value: item.impact })}
                </span>
              )}
              {showImpact && item.effort && (
                <span className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {tc('effort', { value: item.effort })}
                </span>
              )}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
