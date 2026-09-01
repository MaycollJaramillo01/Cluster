'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';
import {
  CALCULATOR_STORAGE_KEY,
  formatMoney,
  type CalculatorSnapshot,
  type RemodelacionesMarket,
} from '@/lib/remodelaciones/markets';
import { site, whatsappLink } from '@/lib/site';

type BudgetCalculatorProps = {
  market: RemodelacionesMarket;
};

export function BudgetCalculator({ market }: BudgetCalculatorProps) {
  const t = useTranslations('Remodelaciones');
  const [budgets, setBudgets] = useState(20);
  const [ticket, setTicket] = useState(4_000_000);
  const [rate, setRate] = useState(25);
  const [started, setStarted] = useState(false);

  const snapshot = useMemo<CalculatorSnapshot>(() => {
    const budgeted = budgets * ticket;
    const closed = Math.round(budgeted * (rate / 100));
    const notConverted = budgeted - closed;
    return {
      budgetsPerMonth: budgets,
      avgTicket: ticket,
      closeRate: rate,
      budgeted,
      closed,
      notConverted,
    };
  }, [budgets, ticket, rate]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  }, [snapshot]);

  function markStarted() {
    if (started) return;
    setStarted(true);
    trackEvent('CalculatorStart', {
      market: market.id,
      page: 'remodelaciones',
    });
  }

  function trackComplete(source: string) {
    trackEvent('CalculatorComplete', {
      market: market.id,
      page: 'remodelaciones',
      source,
      budgets: snapshot.budgetsPerMonth,
      ticket: snapshot.avgTicket,
      rate: snapshot.closeRate,
      notConverted: snapshot.notConverted,
    });
  }

  return (
    <div className="theme-dark overflow-hidden border border-line bg-ink-950 text-fg">
      <div className="grid lg:grid-cols-2">
        <div className="space-y-7 border-line p-6 sm:p-8 lg:border-r">
          <label className="block">
            <span className="mono-label text-faint">{t('calcQ1')}</span>
            <input
              type="number"
              min={1}
              max={500}
              value={budgets}
              onChange={(e) => {
                markStarted();
                setBudgets(Math.max(1, Number(e.target.value) || 1));
              }}
              className="mt-3 w-full border border-line bg-ink-900 px-4 py-3.5 text-lg text-fg outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mono-label text-faint">{t('calcQ2')}</span>
            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">
                {market.currency}
              </span>
              <input
                type="number"
                min={100000}
                step={100000}
                value={ticket}
                placeholder="4000000"
                onChange={(e) => {
                  markStarted();
                  setTicket(Math.max(0, Number(e.target.value) || 0));
                }}
                className="w-full border border-line bg-ink-900 py-3.5 pl-16 pr-4 text-lg text-fg outline-none transition-colors focus:border-accent"
              />
            </div>
            <span className="mt-1.5 block font-mono text-[11px] text-faint">
              {t('calcTicketHint')}
            </span>
          </label>

          <label className="block">
            <span className="mono-label flex items-center justify-between text-faint">
              <span>{t('calcQ3')}</span>
              <span className="text-accent">{rate}%</span>
            </span>
            <input
              type="range"
              min={1}
              max={80}
              value={rate}
              onChange={(e) => {
                markStarted();
                setRate(Number(e.target.value));
              }}
              className="mt-5 w-full accent-[color:var(--accent)]"
            />
          </label>
        </div>

        <div className="relative flex flex-col justify-between bg-surface/30 p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="mono-label text-accent">{t('calcResultEyebrow')}</p>
            <dl className="mt-6 space-y-4">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-sm text-muted">{t('calcBudgeted')}</dt>
                <dd className="font-display text-xl font-semibold text-fg sm:text-2xl">
                  {formatMoney(snapshot.budgeted, market)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-sm text-muted">{t('calcClosed')}</dt>
                <dd className="font-display text-xl font-semibold text-fg sm:text-2xl">
                  {formatMoney(snapshot.closed, market)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 rounded-sm bg-accent/10 px-3 py-3">
                <dt className="text-sm text-muted">{t('calcNotConverted')}</dt>
                <dd className="font-display text-xl font-semibold text-accent sm:text-2xl">
                  {formatMoney(snapshot.notConverted, market)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mt-8 space-y-4">
            <p className="text-[15px] leading-relaxed text-muted">
              {t('calcInsight', {
                amount: formatMoney(snapshot.notConverted, market),
              })}
            </p>
            <p className="text-sm leading-relaxed text-faint">{t('calcCaveat')}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href={whatsappLink(market.whatsappMessage)}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
                onClick={() => trackComplete('whatsapp')}
              >
                {t('ctaWhatsapp')}
              </Button>
              <Button
                href={site.calendarUrl}
                size="lg"
                iconRight="arrow-right"
                onClick={() => trackComplete('agenda')}
              >
                {t('ctaSchedule')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
