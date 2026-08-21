'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import type { BrandManual } from '@/lib/brand-manuals';

type BrandManualsGalleryProps = {
  manuals: BrandManual[];
};

const MASONRY_ASPECTS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[5/6]',
  'aspect-[3/5]',
] as const;

export function BrandManualsGallery({ manuals }: BrandManualsGalleryProps) {
  const t = useTranslations('Branding');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!manuals.length) {
    return (
      <div className="border border-dashed border-line bg-surface px-6 py-14 text-center">
        <Icon name="pen" size={28} className="mx-auto text-accent" />
        <p className="mt-4 text-[15px] text-muted">{t('portfolioEmpty')}</p>
        <p className="mt-2 font-mono text-xs text-faint">{t('portfolioEmptyPath')}</p>
      </div>
    );
  }

  const openBySlug = (slug: string) => {
    const index = manuals.findIndex((item) => item.slug === slug);
    if (index >= 0) setOpenIndex(index);
  };

  // Pad the strip so the marquee stays dense with few manuals.
  const strip =
    manuals.length < 6
      ? [...manuals, ...manuals, ...manuals]
      : manuals.length < 12
        ? [...manuals, ...manuals]
        : manuals;

  const durationSec = Math.max(40, strip.length * 4);
  const openLabel = t('portfolioOpen');
  const categoryLabel = t('portfolioCardLabel');

  return (
    <div>
      {/* Mobile: masonry */}
      <ul
        className="columns-2 gap-3 md:hidden"
        role="list"
        aria-label={t('portfolioEyebrow')}
      >
        {manuals.map((manual, index) => (
          <li key={manual.slug} className="mb-3 break-inside-avoid">
            <ManualCard
              manual={manual}
              onOpen={openBySlug}
              openLabel={openLabel}
              categoryLabel={categoryLabel}
              aspectClass={MASONRY_ASPECTS[index % MASONRY_ASPECTS.length]}
              compact
            />
          </li>
        ))}
      </ul>

      {/* Desktop: infinite marquee */}
      <div
        className="relative hidden overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] md:block"
        role="region"
        aria-label={t('portfolioEyebrow')}
      >
        <div
          className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
        >
          <ManualStrip
            manuals={strip}
            onOpen={openBySlug}
            duplicate={false}
            openLabel={openLabel}
            categoryLabel={categoryLabel}
          />
          <div className="motion-reduce:hidden">
            <ManualStrip
              manuals={strip}
              onOpen={openBySlug}
              duplicate
              openLabel={openLabel}
              categoryLabel={categoryLabel}
            />
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <BrandManualViewer
          manuals={manuals}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onChange={setOpenIndex}
        />
      )}
    </div>
  );
}

function ManualCard({
  manual,
  onOpen,
  openLabel,
  categoryLabel,
  duplicate = false,
  aspectClass = 'aspect-[3/4]',
  compact = false,
}: {
  manual: BrandManual;
  onOpen: (slug: string) => void;
  openLabel: string;
  categoryLabel: string;
  duplicate?: boolean;
  aspectClass?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(manual.slug)}
      className="group block w-full overflow-hidden border border-line bg-surface text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-28px_rgba(2,195,154,0.45)]"
    >
      <div className={`relative overflow-hidden bg-ink-950 ${aspectClass}`}>
        {manual.coverHref ? (
          <Image
            src={manual.coverHref}
            alt={duplicate ? '' : manual.name}
            fill
            sizes={compact ? '50vw' : '280px'}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(80%_60%_at_20%_10%,rgba(2,195,154,0.28),transparent_55%),linear-gradient(160deg,#141414,#0E0E0E_55%,#1a1a1a)] p-3 sm:p-5">
            <span className="mono-label text-white/45">{categoryLabel}</span>
            <div>
              <Icon name="pen" size={compact ? 22 : 28} className="text-accent" />
              <p
                className={`mt-3 font-semibold leading-tight tracking-tight text-white ${
                  compact ? 'text-sm' : 'text-xl'
                }`}
              >
                {manual.name}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
                PDF
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent p-3 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-4 sm:pt-16">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            {openLabel}
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
      <div className={`flex items-center justify-between gap-2 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="min-w-0">
          <p
            className={`truncate font-semibold tracking-tight text-fg ${
              compact ? 'text-[13px]' : 'text-[15px]'
            }`}
          >
            {manual.name}
          </p>
          {!compact && (
            <p className="mono-label mt-1 text-faint">{categoryLabel}</p>
          )}
        </div>
        <Icon
          name="arrow-right"
          size={compact ? 14 : 16}
          className="shrink-0 text-accent transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}

function ManualStrip({
  manuals,
  onOpen,
  duplicate,
  openLabel,
  categoryLabel,
}: {
  manuals: BrandManual[];
  onOpen: (slug: string) => void;
  duplicate: boolean;
  openLabel: string;
  categoryLabel: string;
}) {
  return (
    <ul className="flex shrink-0 gap-5 pr-5" aria-hidden={duplicate}>
      {manuals.map((manual, index) => (
        <li
          key={`${manual.slug}-${duplicate ? 'b' : 'a'}-${index}`}
          className="w-[240px] shrink-0 sm:w-[280px]"
        >
          <ManualCard
            manual={manual}
            onOpen={onOpen}
            openLabel={openLabel}
            categoryLabel={categoryLabel}
            duplicate={duplicate}
          />
        </li>
      ))}
    </ul>
  );
}

function BrandManualViewer({
  manuals,
  index,
  onClose,
  onChange,
}: {
  manuals: BrandManual[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const t = useTranslations('Branding');
  const tc = useTranslations('Common');
  const manual = manuals[index];
  const hasPrev = index > 0;
  const hasNext = index < manuals.length - 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrev) onChange(index - 1);
      if (event.key === 'ArrowRight' && hasNext) onChange(index + 1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [hasNext, hasPrev, index, onChange, onClose]);

  if (!manual) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/90 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={manual.name}
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(92vh,920px)] w-full max-w-6xl flex-col overflow-hidden border border-line bg-ink-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="mono-label text-accent">{t('portfolioCardLabel')}</p>
            <h3 className="truncate text-lg font-semibold tracking-tight text-fg sm:text-xl">
              {manual.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => hasPrev && onChange(index - 1)}
              disabled={!hasPrev}
              aria-label={t('portfolioPrev')}
              className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Icon name="arrow-right" size={16} className="rotate-180" />
            </button>
            <span className="min-w-[4.5rem] text-center font-mono text-xs text-faint">
              {index + 1} / {manuals.length}
            </span>
            <button
              type="button"
              onClick={() => hasNext && onChange(index + 1)}
              disabled={!hasNext}
              aria-label={t('portfolioNext')}
              className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Icon name="arrow-right" size={16} />
            </button>
            <a
              href={manual.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 hidden items-center gap-2 border border-line bg-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:bg-surface-2 sm:inline-flex"
            >
              {t('portfolioOpenTab')}
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={tc('closeMenu')}
              className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-fg transition-colors hover:bg-surface-2"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#111]">
          <iframe
            key={manual.href}
            src={`${manual.href}#toolbar=1&navpanes=0&view=FitH`}
            title={manual.name}
            className="h-full w-full border-0"
          />
        </div>

        <p className="border-t border-line px-4 py-2 font-mono text-[11px] text-faint sm:px-5">
          {t('portfolioNavHint')}
        </p>
      </div>
    </div>
  );
}
