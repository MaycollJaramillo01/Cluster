'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';
import {
  CALCULATOR_STORAGE_KEY,
  type CalculatorSnapshot,
  type RemodelacionesMarket,
} from '@/lib/remodelaciones/markets';

type DiagnosticFormProps = {
  market: RemodelacionesMarket;
  id?: string;
};

const BUDGET_OPTS = ['lt5', '5to10', '11to20', '21to50', 'gt50'] as const;
const FOLLOW_OPTS = [
  'whatsapp',
  'calls',
  'crm',
  'email',
  'none',
  'other',
] as const;
const PROBLEM_OPTS = [
  'noReply',
  'budgetNoReply',
  'inconsistent',
  'disorganized',
  'lowClose',
  'other',
] as const;

export function DiagnosticForm({ market, id = 'diagnostico' }: DiagnosticFormProps) {
  const t = useTranslations('Remodelaciones');
  const tc = useTranslations('Common');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [started, setStarted] = useState(false);
  const [calculator, setCalculator] = useState<CalculatorSnapshot | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CALCULATOR_STORAGE_KEY);
      if (raw) setCalculator(JSON.parse(raw) as CalculatorSnapshot);
    } catch {
      /* ignore */
    }
  }, []);

  function onFocusField() {
    if (started) return;
    setStarted(true);
    trackEvent('formulario_iniciado', { market: market.id, form: 'diagnostico' });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('loading');

    const payload = {
      nombre: String(data.get('nombre') || ''),
      empresa: String(data.get('empresa') || ''),
      website: String(data.get('website') || ''),
      telefono: String(data.get('telefono') || ''),
      email: String(data.get('email') || ''),
      presupuestosMes: String(data.get('presupuestosMes') || ''),
      ticketPromedio: String(data.get('ticketPromedio') || ''),
      seguimiento: String(data.get('seguimiento') || ''),
      problema: String(data.get('problema') || ''),
      pais: market.country,
      origen: `remodelaciones-${market.id}`,
      servicio: 'Diagnóstico conversión presupuestos',
      mensaje: [
        `Mercado: ${market.country}`,
        `Presupuestos/mes: ${data.get('presupuestosMes')}`,
        `Ticket promedio: ${data.get('ticketPromedio')}`,
        `Seguimiento actual: ${data.get('seguimiento')}`,
        `Problema principal: ${data.get('problema')}`,
        calculator
          ? `Calculadora → presupuestado ${calculator.budgeted}, cerrado ${calculator.closed}, no convertido ${calculator.notConverted} (${calculator.closeRate}% cierre, ${calculator.budgetsPerMonth} presupuestos, ticket ${calculator.avgTicket})`
          : 'Calculadora: sin datos',
      ].join('\n'),
      calculator,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('submit_failed');
      trackEvent('formulario_completado', {
        market: market.id,
        form: 'diagnostico',
      });
      setStatus('done');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div
        id={id}
        className="scroll-mt-28 border border-line bg-surface p-8 text-center sm:p-12"
      >
        <p className="mono-label text-accent">{t('thanksEyebrow')}</p>
        <h3 className="mt-4 font-display text-3xl font-bold uppercase text-fg sm:text-4xl">
          {t('thanksTitle')}
        </h3>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
          {t('thanksText')}
        </p>
        <p className="mono-label mt-8 text-faint">{t('thanksNext')}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button
            href={site.calendarUrl}
            size="lg"
            iconRight="arrow-right"
            onClick={() =>
              trackEvent('agenda_iniciada', { market: market.id, source: 'thanks' })
            }
          >
            {t('thanksSchedule')}
          </Button>
          <Button
            href={whatsappLink(market.whatsappMessage)}
            external
            variant="whatsapp"
            size="lg"
            icon="whatsapp"
            onClick={() =>
              trackEvent('click_whatsapp', { market: market.id, source: 'thanks' })
            }
          >
            WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      onFocusCapture={onFocusField}
      className="scroll-mt-28 border border-line bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('fieldName')} name="nombre" required />
        <Field label={t('fieldCompany')} name="empresa" required />
        <Field
          label={t('fieldWeb')}
          name="website"
          placeholder="instagram.com/… o website"
          className="sm:col-span-2"
        />
        <Field label={t('fieldPhone')} name="telefono" type="tel" required />
        <Field label={t('fieldEmail')} name="email" type="email" required />

        <SelectField
          label={t('fieldBudgets')}
          name="presupuestosMes"
          required
          options={BUDGET_OPTS.map((key) => ({
            value: key,
            label: t(`budgetOpt.${key}`),
          }))}
        />
        <Field
          label={t('fieldTicket')}
          name="ticketPromedio"
          placeholder={t('fieldTicketPlaceholder')}
          required
        />

        <SelectField
          label={t('fieldFollow')}
          name="seguimiento"
          required
          className="sm:col-span-2"
          options={FOLLOW_OPTS.map((key) => ({
            value: key,
            label: t(`followOpt.${key}`),
          }))}
        />
        <SelectField
          label={t('fieldProblem')}
          name="problema"
          required
          className="sm:col-span-2"
          options={PROBLEM_OPTS.map((key) => ({
            value: key,
            label: t(`problemOpt.${key}`),
          }))}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-faint">{t('formMicro')}</p>
        <Button type="submit" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? tc('sending') : t('formCta')}
        </Button>
      </div>
      {status === 'error' && (
        <p className="mt-4 text-sm text-red-400">{tc('formError')}</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  className = '',
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mono-label text-faint">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-line bg-ink-950 px-4 py-3 text-[15px] text-fg outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  className = '',
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}) {
  const tc = useTranslations('Common');
  return (
    <label className={`block ${className}`}>
      <span className="mono-label text-faint">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full border border-line bg-ink-950 px-4 py-3 text-[15px] text-fg outline-none transition-colors focus:border-accent"
      >
        <option value="" disabled>
          {tc('selectOption')}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
