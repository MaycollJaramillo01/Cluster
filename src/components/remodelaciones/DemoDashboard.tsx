'use client';

import { useTranslations } from 'next-intl';
import { formatMoney, type RemodelacionesMarket } from '@/lib/remodelaciones/markets';

const DEMO_ROWS = [
  { nameKey: 'dashRow1', value: 6_800_000, statusKey: 'dashStatusFollow', whenKey: 'dashWhenToday' },
  { nameKey: 'dashRow2', value: 18_500_000, statusKey: 'dashStatusSent', whenKey: 'dashWhenYesterday' },
  { nameKey: 'dashRow3', value: 9_200_000, statusKey: 'dashStatusVisit', whenKey: 'dashWhenToday' },
] as const;

export function DemoDashboard({ market }: { market: RemodelacionesMarket }) {
  const t = useTranslations('Remodelaciones');

  return (
    <div className="border border-line bg-ink-950 p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono-label text-accent">{t('dashEyebrow')}</p>
          <p className="mt-1 text-sm text-muted">{t('dashNote')}</p>
        </div>
        <span className="border border-accent/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          {t('dashDemoBadge')}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('dashBudgeted'), value: formatMoney(94_500_000, market) },
          { label: t('dashWon'), value: formatMoney(31_200_000, market) },
          { label: t('dashPending'), value: formatMoney(48_800_000, market) },
          { label: t('dashLost'), value: formatMoney(14_500_000, market) },
        ].map((card) => (
          <div key={card.label} className="border border-line bg-surface p-4">
            <p className="mono-label text-faint">{card.label}</p>
            <p className="mt-3 font-display text-xl font-semibold text-fg sm:text-2xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 font-mono text-sm text-muted">
        {t('dashConversion')}: <span className="text-accent">33%</span>
      </p>

      <div className="mt-5 overflow-x-auto border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">{t('dashColOpp')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColValue')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColStatus')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColContact')}</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => (
              <tr key={row.nameKey} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-fg">{t(row.nameKey)}</td>
                <td className="px-4 py-3 text-muted">
                  {formatMoney(row.value, market)}
                </td>
                <td className="px-4 py-3 text-muted">{t(row.statusKey)}</td>
                <td className="px-4 py-3 text-faint">{t(row.whenKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
