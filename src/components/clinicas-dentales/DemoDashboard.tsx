'use client';

import { useTranslations } from 'next-intl';
import type { ClinicasDentalesMarket } from '@/lib/clinicas-dentales/markets';

/** Montos demo ilustrativos en USD (ejemplo demostrativo, no caso real). */
function formatDemoUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const DEMO = {
  presupuestado: 185_000,
  aceptado: 79_000,
  pendiente: 68_000,
  perdido: 38_000,
  tasa: '42.7%',
  rows: [
    { key: 'implantes', p: 72_000, a: 31_000, pend: 27_000 },
    { key: 'invisalign', p: 48_000, a: 22_000, pend: 18_000 },
    { key: 'rehab', p: 45_000, a: 17_000, pend: 16_000 },
    { key: 'estetica', p: 20_000, a: 9_000, pend: 7_000 },
  ],
} as const;

export function DemoDashboard({ market }: { market: ClinicasDentalesMarket }) {
  const t = useTranslations('ClinicasDentales');
  void market;

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
          { label: t('dashBudgeted'), value: formatDemoUsd(DEMO.presupuestado) },
          { label: t('dashAccepted'), value: formatDemoUsd(DEMO.aceptado) },
          { label: t('dashPending'), value: formatDemoUsd(DEMO.pendiente) },
          { label: t('dashLost'), value: formatDemoUsd(DEMO.perdido) },
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
        {t('dashConversion')}: <span className="text-accent">{DEMO.tasa}</span>
      </p>

      <div className="mt-5 overflow-x-auto border border-line">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line bg-surface font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">{t('dashColTreatment')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColBudgeted')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColAccepted')}</th>
              <th className="px-4 py-3 font-medium">{t('dashColPending')}</th>
            </tr>
          </thead>
          <tbody>
            {DEMO.rows.map((row) => (
              <tr key={row.key} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-fg">{t(`dashRow.${row.key}`)}</td>
                <td className="px-4 py-3 text-muted">{formatDemoUsd(row.p)}</td>
                <td className="px-4 py-3 text-muted">{formatDemoUsd(row.a)}</td>
                <td className="px-4 py-3 text-muted">{formatDemoUsd(row.pend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
