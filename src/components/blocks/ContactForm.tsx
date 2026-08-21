'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

const inputClass =
  'w-full rounded-xl bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint transition-colors focus:bg-surface focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

type ContactFormProps = {
  defaultService?: string;
  defaultMessage?: string;
  source?: string;
  auditUrl?: string;
  auditScore?: string;
};

export function ContactForm({
  defaultService = '',
  defaultMessage = '',
  source = 'contacto',
  auditUrl = '',
  auditScore = '',
}: ContactFormProps) {
  const t = useTranslations('ContactForm');
  const tc = useTranslations('Common');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const serviceOptions = t.raw('serviceOptions') as string[];

  const matchedDefaultService =
    serviceOptions.find(
      (option) => option.toLowerCase() === defaultService.toLowerCase(),
    ) ||
    serviceOptions.find((option) =>
      option.toLowerCase().includes(defaultService.toLowerCase()),
    ) ||
    defaultService;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      nombre: String(data.get('nombre') ?? ''),
      empresa: String(data.get('empresa') ?? ''),
      pais: String(data.get('pais') ?? ''),
      ciudad: String(data.get('ciudad') ?? ''),
      email: String(data.get('email') ?? ''),
      telefono: String(data.get('telefono') ?? ''),
      servicio: String(data.get('servicio') ?? ''),
      mensaje: String(data.get('mensaje') ?? ''),
      origen: source,
      auditUrl,
      auditScore,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        mailto?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        if (result.mailto) {
          window.location.href = result.mailto;
          setSent(true);
          return;
        }
        throw new Error(result.error || tc('formError'));
      }

      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('formError'));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div
        id="contacto-form"
        className="flex flex-col items-center justify-center rounded-3xl bg-surface p-10 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold text-fg">
          {tc('thankYou')}
        </h3>
        <p className="mt-2 max-w-sm text-[15px] text-muted">{t('successText')}</p>
        <a
          href={`mailto:${site.email}`}
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent transition-colors hover:text-fg"
        >
          <Icon name="mail" size={16} />
          {site.email}
        </a>
      </div>
    );
  }

  return (
    <form
      id="contacto-form"
      onSubmit={handleSubmit}
      className="rounded-3xl bg-surface p-7 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tc('name')} name="nombre" placeholder={tc('name')} required />
        <Field label={tc('company')} name="empresa" placeholder={tc('businessName')} />
        <Field
          label={tc('country')}
          name="pais"
          placeholder={tc('countryExample')}
          required
        />
        <Field label={tc('city')} name="ciudad" placeholder={tc('cityExample')} />
        <Field
          label={tc('email')}
          name="email"
          type="email"
          placeholder={tc('contactPlaceholder')}
          required
        />
        <Field
          label={tc('phone')}
          name="telefono"
          type="tel"
          placeholder={tc('phoneExample')}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="servicio" className="mb-1.5 block text-sm font-medium text-muted">
          {tc('serviceInterest')}
        </label>
        <select
          id="servicio"
          name="servicio"
          className={`${inputClass} [&>option]:bg-ink-850`}
          defaultValue={matchedDefaultService || ''}
        >
          <option value="" disabled>
            {tc('selectService')}
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-muted">
          {tc('message')}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          defaultValue={defaultMessage}
          placeholder={tc('messagePlaceholder')}
          className={inputClass}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        iconRight="arrow-right"
        disabled={sending}
      >
        {sending ? tc('sending') : tc('sendMessage')}
      </Button>
      <p className="mt-3 text-center text-xs text-faint">{t('consentEmail')}</p>

      {error && (
        <p
          className="mt-4 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
