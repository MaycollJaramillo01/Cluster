'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon, type IconName } from '@/components/ui/Icon';

const PAIR_ICONS: IconName[] = [
  'megaphone',
  'bolt',
  'users',
  'chart',
  'calendar',
  'bot',
  'target',
];

type ChallengeSolutionMapProps = {
  problems: string[];
  solutions: string[];
};

export function ChallengeSolutionMap({
  problems,
  solutions,
}: ChallengeSolutionMapProps) {
  const tc = useTranslations('Common');
  const t = useTranslations('Automation');
  const pairCount = Math.min(problems.length, solutions.length, PAIR_ICONS.length);
  const pairs = Array.from({ length: pairCount }, (_, index) => ({
    problem: problems[index],
    solution: solutions[index],
    icon: PAIR_ICONS[index],
  }));

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || pairCount < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % pairCount);
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused, pairCount]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-faint">{t('mapEyebrow')}</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {t('mapTitle')}
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{t('mapHint')}</p>
      </div>

      <div className="mb-5 hidden grid-cols-[1fr_auto_1fr] gap-4 px-1 lg:grid">
        <p className="mono-label text-faint">{tc('theChallenge')}</p>
        <span className="w-14" aria-hidden="true" />
        <p className="mono-label text-accent">{tc('theSolution')}</p>
      </div>

      <div className="space-y-3" role="list">
        {pairs.map((pair, index) => {
          const isActive = active === index;
          return (
            <button
              key={`${pair.problem}-${pair.solution}`}
              type="button"
              role="listitem"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              aria-pressed={isActive}
              className={`group relative w-full overflow-hidden border text-left transition-all duration-500 ${
                isActive
                  ? 'border-[color:rgba(2,195,154,0.45)] bg-surface shadow-[0_20px_50px_-28px_rgba(2,195,154,0.55)]'
                  : 'border-line bg-theme hover:border-[color:rgba(2,195,154,0.25)] hover:bg-surface'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 transition-colors duration-500 ${
                  isActive ? 'bg-accent' : 'bg-transparent'
                }`}
                aria-hidden="true"
              />

              <div className="grid items-stretch lg:grid-cols-[1fr_auto_1fr]">
                {/* Challenge */}
                <div
                  className={`flex items-center gap-4 px-5 py-5 transition-colors duration-500 sm:px-6 ${
                    isActive ? 'bg-[color:rgba(14,14,14,0.03)]' : ''
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 flex-none items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-ink-900 text-accent'
                        : 'bg-surface-2 text-faint group-hover:text-muted'
                    }`}
                  >
                    <Icon name={pair.icon} size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="mono-label mb-1 text-[10px] text-faint lg:hidden">
                      {tc('theChallenge')}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`font-mono text-[11px] tracking-[0.14em] transition-colors duration-500 ${
                          isActive ? 'text-faint' : 'text-faint/80'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[15px] font-medium leading-snug tracking-[-0.01em] transition-colors duration-500 sm:text-[17px] ${
                          isActive ? 'text-fg' : 'text-muted'
                        }`}
                      >
                        {pair.problem}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="relative hidden items-center justify-center lg:flex">
                  <div
                    className={`flex h-full w-14 items-center justify-center transition-all duration-500 ${
                      isActive ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center border transition-all duration-500 ${
                        isActive
                          ? 'scale-110 border-accent bg-accent text-accent-fg'
                          : 'border-line bg-theme'
                      }`}
                    >
                      <Icon
                        name="arrow-right"
                        size={16}
                        className={isActive ? 'translate-x-0.5' : ''}
                      />
                    </span>
                  </div>
                </div>

                {/* Solution */}
                <div
                  className={`flex items-center gap-4 border-t border-line px-5 py-5 transition-all duration-500 sm:px-6 lg:border-t-0 ${
                    isActive
                      ? 'bg-[color:rgba(2,195,154,0.08)]'
                      : 'bg-transparent'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 flex-none items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-accent text-accent-fg'
                        : 'bg-surface-2 text-faint'
                    }`}
                  >
                    <Icon name="check" size={18} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="mono-label mb-1 text-[10px] text-accent lg:hidden">
                      {tc('theSolution')}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`font-mono text-[11px] tracking-[0.14em] transition-colors duration-500 ${
                          isActive ? 'text-accent' : 'text-faint'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[15px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-500 sm:text-[17px] ${
                          isActive ? 'text-fg' : 'text-muted'
                        }`}
                      >
                        {pair.solution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile connector cue when active */}
              <div
                className={`overflow-hidden transition-all duration-500 lg:hidden ${
                  isActive ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-2 border-t border-line px-5 py-2 text-accent">
                  <Icon name="arrow-right" size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
                    {t('mapResolved')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {pairs.map((pair, index) => (
          <button
            key={`dot-${pair.solution}`}
            type="button"
            aria-label={`${pair.problem} → ${pair.solution}`}
            onClick={() => setActive(index)}
            className={`h-2.5 transition-all duration-300 ${
              active === index
                ? 'w-8 bg-accent'
                : 'w-2.5 bg-surface-2 hover:bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
