'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';
import {
  formatAttributionBlock,
  readLandingAttribution,
  type LandingAttribution,
} from '@/lib/attribution';
import { site, whatsappLink } from '@/lib/site';

type MinimalLeadFormProps = {
  /** Namespace de next-intl (Remodelaciones | ClinicasDentales) */
  i18nNamespace: 'Remodelaciones' | 'ClinicasDentales';
  vertical: string;
  country: string;
  landingPath: string;
  origen: string;
  servicio: string;
  whatsappMessage: string;
  calculatorStorageKey: string;
  id?: string;
};

export function MinimalLeadForm({
  i18nNamespace,
  vertical,
  country,
  landingPath,
  origen,
  servicio,
  whatsappMessage,
  calculatorStorageKey,
  id = 'contacto',
}: MinimalLeadFormProps) {
  const t = useTranslations(i18nNamespace);
  const tc = useTranslations('Common');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  );
  const [started, setStarted] = useState(false);
  const [calculatorRaw, setCalculatorRaw] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<LandingAttribution | null>(
    null,
  );

  useEffect(() => {
    setAttribution(
      readLandingAttribution({
        vertical,
        country,
        landing: landingPath,
      }),
    );
    try {
      setCalculatorRaw(sessionStorage.getItem(calculatorStorageKey));
    } catch {
      setCalculatorRaw(null);
    }
  }, [vertical, country, landingPath, calculatorStorageKey]);

  function onFocusField() {
    if (started) return;
    setStarted(true);
    trackEvent('FormStart', { vertical, origen, page: landingPath });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('loading');

    const attr =
      attribution ??
      readLandingAttribution({
        vertical,
        country,
        landing: landingPath,
      });

    let calculatorNote = 'Calculadora: no utilizada';
    try {
      const raw =
        calculatorRaw ?? sessionStorage.getItem(calculatorStorageKey);
      if (raw) {
        calculatorNote = `Calculadora (voluntaria): ${raw}`;
      }
    } catch {
      /* ignore */
    }

    const payload = {
      nombre: String(data.get('nombre') || ''),
      empresa: String(data.get('empresa') || ''),
      telefono: String(data.get('telefono') || ''),
      email: String(data.get('email') || ''),
      website: String(data.get('website') || ''),
      pais: country,
      origen,
      servicio,
      mensaje: [
        formatAttributionBlock(attr),
        `Website/IG: ${data.get('website') || '—'}`,
        calculatorNote,
      ].join('\n'),
      attribution: attr,
      calculator: calculatorRaw ? safeJson(calculatorRaw) : null,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('submit_failed');
      trackEvent('Lead', { vertical, origen, page: landingPath });
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            href={whatsappLink(whatsappMessage)}
            external
            variant="whatsapp"
            size="lg"
            icon="whatsapp"
            onClick={() =>
              trackEvent('WhatsAppClick', { source: 'thanks', vertical })
            }
          >
            {t('ctaWhatsapp')}
          </Button>
          <Button
            href={site.calendarUrl}
            size="lg"
            iconRight="arrow-right"
            onClick={() =>
              trackEvent('AppointmentStart', { source: 'thanks', vertical })
            }
          >
            {t('ctaSchedule')}
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
          label={t('fieldPhone')}
          name="telefono"
          type="tel"
          required
        />
        <Field label={t('fieldEmail')} name="email" type="email" required />
        <Field
          label={t('fieldWeb')}
          name="website"
          placeholder={t('fieldWebPlaceholder')}
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-8 flex justify-end">
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

function safeJson(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
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
