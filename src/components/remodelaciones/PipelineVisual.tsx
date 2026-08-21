'use client';

import { useTranslations } from 'next-intl';

const STEPS = [
  'pipelineNew',
  'pipelineQualified',
  'pipelineVisit',
  'pipelineBudget',
  'pipelineFollow',
  'pipelineWon',
] as const;

export function PipelineVisual({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('Remodelaciones');

  return (
    <div
      className={`border border-line bg-ink-950 ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
      aria-label={t('pipelineAria')}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="mono-label text-accent">{t('pipelineLabel')}</p>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          live
        </span>
      </div>

      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-1.5">
        {STEPS.map((key, index) => (
          <li
            key={key}
            className="relative flex flex-1 flex-col border border-line bg-surface px-3 py-3 md:min-h-[7.5rem]"
          >
            <span className="font-mono text-[10px] text-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={`mt-2 font-medium leading-snug text-fg ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {t(key)}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className="pointer-events-none absolute -bottom-2 left-1/2 hidden h-px w-3 -translate-x-1/2 bg-accent md:left-auto md:right-[-5px] md:top-1/2 md:bottom-auto md:block md:translate-x-0 md:-translate-y-1/2"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
