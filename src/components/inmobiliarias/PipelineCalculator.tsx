'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CountryConfig } from '@/lib/inmobiliarias/types';
import { formatMoney } from '@/lib/inmobiliarias/countries';
import { trackEvent } from '@/lib/inmobiliarias/tracking';
import { saveInmobiliariasCalculatorSnapshot } from '@/lib/inmobiliarias/calculatorStore';
import { DualCtas } from '@/components/landings/DualCtas';

type Props = {
  country: CountryConfig;
};

const defaultProperty: Record<CountryConfig['currency'], number> = {
  USD: 350000,
  DOP: 20000000,
  CLP: 180000000,
  EUR: 280000,
  MXN: 4500000,
};

const defaultCommission: Record<CountryConfig['currency'], number> = {
  USD: 7000,
  DOP: 400000,
  CLP: 3500000,
  EUR: 5500,
  MXN: 90000,
};

export function PipelineCalculator({ country }: Props) {
  const [leads, setLeads] = useState(250);
  const [propertyValue, setPropertyValue] = useState(
    defaultProperty[country.currency]
  );
  const [visitRate, setVisitRate] = useState(18);
  const [closeRate, setCloseRate] = useState(9);
  const [commission, setCommission] = useState(
    defaultCommission[country.currency]
  );
  const [useCommission, setUseCommission] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    setPropertyValue(defaultProperty[country.currency]);
    setCommission(defaultCommission[country.currency]);
  }, [country.currency]);

  const funnel = useMemo(() => {
    const visits = Math.round(leads * (visitRate / 100));
    const operations = Math.round(visits * (closeRate / 100));
    return { visits, operations };
  }, [leads, visitRate, closeRate]);

  const extraValue = useCommission ? commission : null;

  function markStart() {
    if (started.current) return;
    started.current = true;
    trackEvent('CalculatorStart', { country: country.code });
  }

  useEffect(() => {
    if (!started.current) return;
    const t = window.setTimeout(() => {
      const snapshot = {
        leads,
        propertyValue,
        visitRate,
        closeRate,
        commission: useCommission ? commission : null,
        visits: funnel.visits,
        operations: funnel.operations,
      };
      saveInmobiliariasCalculatorSnapshot(snapshot);
      trackEvent('CalculatorComplete', {
        country: country.code,
        ...snapshot,
      });
    }, 800);
    return () => window.clearTimeout(t);
  }, [
    leads,
    propertyValue,
    visitRate,
    closeRate,
    commission,
    useCommission,
    funnel.visits,
    funnel.operations,
    country.code,
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="border border-line bg-surface p-6 sm:p-8">
        <Field
          label="¿Cuántos leads reciben aproximadamente al mes?"
          value={leads}
          onChange={(v) => {
            markStart();
            setLeads(v);
          }}
          min={10}
          max={2000}
          step={10}
        />
        <Field
          label={`Valor promedio de las propiedades (${country.currencySymbol})`}
          value={propertyValue}
          onChange={(v) => {
            markStart();
            setPropertyValue(v);
          }}
          min={country.currency === 'CLP' ? 20000000 : 50000}
          max={country.currency === 'CLP' ? 800000000 : 5000000}
          step={country.currency === 'CLP' ? 1000000 : 10000}
        />
        <Field
          label="¿Qué porcentaje aproximadamente logra agendar una visita?"
          value={visitRate}
          onChange={(v) => {
            markStart();
            setVisitRate(v);
          }}
          min={1}
          max={80}
          suffix="%"
        />
        <Field
          label="¿Qué porcentaje de las visitas termina en reserva/venta?"
          value={closeRate}
          onChange={(v) => {
            markStart();
            setCloseRate(v);
          }}
          min={1}
          max={60}
          suffix="%"
        />

        <label className="mt-2 flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={useCommission}
            onChange={(e) => {
              markStart();
              setUseCommission(e.target.checked);
            }}
            className="mt-1 accent-[var(--accent)]"
          />
          <span>Incluir comisión promedio aproximada por operación</span>
        </label>
        {useCommission && (
          <div className="mt-4">
            <Field
              label={`Comisión promedio (${country.currencySymbol})`}
              value={commission}
              onChange={(v) => {
                markStart();
                setCommission(v);
              }}
              min={country.currency === 'CLP' ? 500000 : 500}
              max={country.currency === 'CLP' ? 20000000 : 100000}
              step={country.currency === 'CLP' ? 100000 : 100}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="border border-line bg-ink-950 p-6 text-fg sm:p-8">
          <p className="mono-label text-accent">Pipeline estimado</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            <Row label="Leads mensuales" value={String(leads)} />
            <Row label="Visitas estimadas" value={String(funnel.visits)} />
            <Row
              label="Operaciones estimadas"
              value={String(funnel.operations)}
              accent
            />
            <Row
              label="Ticket promedio inmueble"
              value={formatMoney(propertyValue, country)}
            />
          </ul>
          <p className="mt-4 text-xs text-faint">
            El valor del inmueble ilustra el volumen que atraviesa el pipeline. La
            comisión se usa solo si la activas.
          </p>
        </div>

        <div className="border border-accent/30 bg-surface p-6 sm:p-8">
          <p className="mono-label text-accent">Impacto de una mejora puntual</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Si una mejora en respuesta, calificación y seguimiento generara una
            visita o una operación adicional, el valor para tu empresa se mide
            en oportunidades reales — no en el precio completo del inmueble.
          </p>
          {extraValue !== null && (
            <p className="mt-4 text-[15px] text-fg">
              Una operación adicional a tu comisión media equivaldría a{' '}
              <span className="text-accent">
                {formatMoney(extraValue, country)}
              </span>
              .
            </p>
          )}
          <DualCtas
            className="mt-6"
            size="md"
            whatsappMessage={`Hola Cluster Media, usé la calculadora de inmobiliarias (${country.name}) y quiero hablar.`}
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
          <p className="mt-3 text-xs text-faint">
            La calculadora es opcional. Puedes contactarnos sin usarla.
          </p>
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
