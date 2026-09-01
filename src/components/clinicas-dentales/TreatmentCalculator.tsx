'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';
import {
  CALCULATOR_STORAGE_KEY,
  formatMoney,
  type CalculatorSnapshot,
  type ClinicasDentalesMarket,
} from '@/lib/clinicas-dentales/markets';
import { site, whatsappLink } from '@/lib/site';

type TreatmentCalculatorProps = {
  market: ClinicasDentalesMarket;
};

export function TreatmentCalculator({ market }: TreatmentCalculatorProps) {
  const t = useTranslations('ClinicasDentales');
  const [valoraciones, setValoraciones] = useState(market.defaultValoraciones);
  const [pctPresupuesto, setPctPresupuesto] = useState(
    market.defaultPctPresupuesto,
  );
  const [ticket, setTicket] = useState(market.defaultTicket);
  const [pctAceptacion, setPctAceptacion] = useState(
    market.defaultPctAceptacion,
  );
  const [started, setStarted] = useState(false);

  const snapshot = useMemo<CalculatorSnapshot>(() => {
    const tratamientosPresupuestados = Math.round(
      valoraciones * (pctPresupuesto / 100),
    );
    const valorPresupuestado = tratamientosPresupuestados * ticket;
    const valorConvertido = Math.round(
      valorPresupuestado * (pctAceptacion / 100),
    );
    const valorNoConvertido = valorPresupuestado - valorConvertido;
    return {
      valoraciones,
      pctPresupuesto,
      avgTicket: ticket,
      pctAceptacion,
      tratamientosPresupuestados,
      valorPresupuestado,
      valorConvertido,
      valorNoConvertido,
    };
  }, [valoraciones, pctPresupuesto, ticket, pctAceptacion]);

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
      page: 'clinicas-dentales',
    });
  }

  function trackComplete(source: string) {
    trackEvent('CalculatorComplete', {
      market: market.id,
      page: 'clinicas-dentales',
      source,
      valoraciones: snapshot.valoraciones,
      ticket: snapshot.avgTicket,
      noConvertido: snapshot.valorNoConvertido,
    });
  }

  return (
    <div className="border border-line bg-surface p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <label className="block">
            <span className="mono-label text-faint">{t('calcQ1')}</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={valoraciones}
              onChange={(e) => {
                markStarted();
                setValoraciones(Math.max(1, Number(e.target.value) || 1));
              }}
              className="mt-2 w-full border border-line bg-ink-950 px-4 py-3 text-lg text-fg outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mono-label flex items-center justify-between text-faint">
              <span>{t('calcQ2')}</span>
              <span className="text-accent">{pctPresupuesto}%</span>
            </span>
            <input
              type="range"
              min={10}
              max={100}
              value={pctPresupuesto}
              onChange={(e) => {
                markStarted();
                setPctPresupuesto(Number(e.target.value));
              }}
              className="mt-4 w-full accent-[color:var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mono-label text-faint">{t('calcQ3')}</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">
                {market.currency}
              </span>
              <input
                type="number"
                min={0}
                step={market.currency === 'CLP' ? 100000 : 100}
                value={ticket}
                onChange={(e) => {
                  markStarted();
                  setTicket(Math.max(0, Number(e.target.value) || 0));
                }}
                className="w-full border border-line bg-ink-950 py-3 pl-16 pr-4 text-lg text-fg outline-none transition-colors focus:border-accent"
              />
            </div>
          </label>

          <label className="block">
            <span className="mono-label flex items-center justify-between text-faint">
              <span>{t('calcQ4')}</span>
              <span className="text-accent">{pctAceptacion}%</span>
            </span>
            <input
              type="range"
              min={1}
              max={80}
              value={pctAceptacion}
              onChange={(e) => {
                markStarted();
                setPctAceptacion(Number(e.target.value));
              }}
              className="mt-4 w-full accent-[color:var(--accent)]"
            />
          </label>
        </div>

        <div className="flex flex-col justify-between border border-line bg-ink-950 p-5 sm:p-6">
          <div>
            <p className="mono-label text-accent">{t('calcResultEyebrow')}</p>
            <dl className="mt-5 space-y-4">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-sm text-muted">{t('calcCount')}</dt>
                <dd className="font-display text-xl font-semibold text-fg sm:text-2xl">
                  {snapshot.tratamientosPresupuestados}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-sm text-muted">{t('calcBudgeted')}</dt>
                <dd className="font-display text-xl font-semibold text-fg sm:text-2xl">
                  {formatMoney(snapshot.valorPresupuestado, market)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-sm text-muted">{t('calcConverted')}</dt>
                <dd className="font-display text-xl font-semibold text-fg sm:text-2xl">
                  {formatMoney(snapshot.valorConvertido, market)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-muted">{t('calcNotConverted')}</dt>
                <dd className="font-display text-xl font-semibold text-accent sm:text-2xl">
                  {formatMoney(snapshot.valorNoConvertido, market)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-[15px] leading-relaxed text-muted">
              {t('calcInsight', {
                amount: formatMoney(snapshot.valorNoConvertido, market),
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
