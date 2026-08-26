'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CountryConfig } from '@/lib/clinicas-esteticas/types';
import { formatMoney } from '@/lib/clinicas-esteticas/countries';
import { trackEvent } from '@/lib/clinicas-esteticas/tracking';
import { saveClinicasCalculatorSnapshot } from '@/lib/clinicas-esteticas/calculatorStore';
import { DualCtas } from '@/components/landings/DualCtas';

type Props = {
  country: CountryConfig;
};

const defaultTicket: Record<CountryConfig['currency'], number> = {
  USD: 1500,
  CLP: 450000,
  EUR: 450,
  MXN: 12000,
};

export function ConversionCalculator({ country }: Props) {
  const t = useTranslations('ClinicasEsteticas');
  const [consultations, setConsultations] = useState(120);
  const [ticket, setTicket] = useState(defaultTicket[country.currency]);
  const [bookRate, setBookRate] = useState(45);
  const [showRate, setShowRate] = useState(80);
  const [buyRate, setBuyRate] = useState(55);
  const started = useRef(false);

  useEffect(() => {
    setTicket(defaultTicket[country.currency]);
  }, [country.currency]);

  const funnel = useMemo(() => {
    const appointments = Math.round(consultations * (bookRate / 100));
    const attended = Math.round(appointments * (showRate / 100));
    const treatments = Math.round(attended * (buyRate / 100));
    const revenue = treatments * ticket;
    return { appointments, attended, treatments, revenue };
  }, [consultations, ticket, bookRate, showRate, buyRate]);

  const improved = useMemo(() => {
    const lift = 5;
    const appointments = Math.round(consultations * ((bookRate + lift) / 100));
    const attended = Math.round(appointments * ((showRate + lift) / 100));
    const treatments = Math.round(attended * ((buyRate + lift) / 100));
    const revenue = treatments * ticket;
    return {
      appointments,
      attended,
      treatments,
      revenue,
      extraTreatments: Math.max(0, treatments - funnel.treatments),
      extraRevenue: Math.max(0, revenue - funnel.revenue),
    };
  }, [
    consultations,
    ticket,
    bookRate,
    showRate,
    buyRate,
    funnel.treatments,
    funnel.revenue,
  ]);

  function markStart() {
    if (started.current) return;
    started.current = true;
    trackEvent('CalculatorStart', { country: country.code });
  }

  useEffect(() => {
    if (!started.current) return;
    const timer = window.setTimeout(() => {
      const snapshot = {
        consultations,
        ticket,
        bookRate,
        showRate,
        buyRate,
        revenue: funnel.revenue,
        treatments: funnel.treatments,
      };
      saveClinicasCalculatorSnapshot(snapshot);
      trackEvent('CalculatorComplete', {
        country: country.code,
        ...snapshot,
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [
    consultations,
    ticket,
    bookRate,
    showRate,
    buyRate,
    funnel.revenue,
    funnel.treatments,
    country.code,
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="border border-line bg-surface p-6 sm:p-8">
        <Field
          label={t('calcQ1')}
          value={consultations}
          onChange={(v) => {
            markStart();
            setConsultations(v);
          }}
          min={10}
          max={500}
          step={5}
        />
        <Field
          label={t('calcQ2', { currency: country.currencySymbol })}
          value={ticket}
          onChange={(v) => {
            markStart();
            setTicket(v);
          }}
          min={country.currency === 'CLP' ? 50000 : 50}
          max={country.currency === 'CLP' ? 5000000 : 20000}
          step={country.currency === 'CLP' ? 10000 : 50}
        />
        <Field
          label={t('calcQ3')}
          value={bookRate}
          onChange={(v) => {
            markStart();
            setBookRate(v);
          }}
          min={5}
          max={95}
          suffix="%"
        />
        <Field
          label={t('calcQ4')}
          value={showRate}
          onChange={(v) => {
            markStart();
            setShowRate(v);
          }}
          min={5}
          max={100}
          suffix="%"
        />
        <Field
          label={t('calcQ5')}
          value={buyRate}
          onChange={(v) => {
            markStart();
            setBuyRate(v);
          }}
          min={5}
          max={100}
          suffix="%"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="border border-line bg-ink-950 p-6 text-fg sm:p-8">
          <p className="mono-label text-accent">{t('calcCurrentEyebrow')}</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            <Row label={t('calcConsultations')} value={String(consultations)} />
            <Row
              label={t('calcAppointments')}
              value={String(funnel.appointments)}
            />
            <Row label={t('calcAttended')} value={String(funnel.attended)} />
            <Row label={t('calcTreatments')} value={String(funnel.treatments)} />
            <Row
              label={t('calcRevenue')}
              value={formatMoney(funnel.revenue, country)}
              accent
            />
          </ul>
        </div>

        <div className="border border-accent/30 bg-surface p-6 sm:p-8">
          <p className="mono-label text-accent">{t('calcLiftEyebrow')}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {t('calcLiftText', {
              treatments: improved.extraTreatments,
              revenue: formatMoney(improved.extraRevenue, country),
            })}
          </p>
          <DualCtas
            className="mt-6"
            size="md"
            whatsappMessage={t('waCalc', { country: country.name })}
            onWhatsApp={() =>
              trackEvent('WhatsAppClick', {
                country: country.code,
                source: 'calculator',
              })
            }
            onSchedule={() =>
              trackEvent('ScheduleStart', {
                country: country.code,
                source: 'calculator',
              })
            }
          />
          <p className="mt-3 text-xs text-faint">{t('calcOptionalNote')}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="mb-6 block last:mb-0">
      <span className="text-sm text-muted">{label}</span>
      <div className="mt-3 flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none bg-line accent-[var(--accent)]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 border border-line bg-ink-900 px-2 py-2 text-right font-mono text-sm text-paper [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        />
        {suffix && <span className="text-sm text-faint">{suffix}</span>}
      </div>
    </label>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3 last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`font-mono text-sm ${accent ? 'text-accent' : 'text-fg'}`}>
        {value}
      </span>
    </li>
  );
}
