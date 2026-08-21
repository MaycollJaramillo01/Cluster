'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

const inputClass =
  'w-full bg-surface px-4 py-3 text-[15px] text-fg placeholder:text-faint transition-colors focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]';

const labelClass = 'mb-1.5 block text-sm font-medium text-muted';

export function LeadForm() {
  const t = useTranslations('RutaLocal');
  const tc = useTranslations('Common');
  const [sent, setSent] = useState(false);

  const promoteOptions = t.raw('promoteOptions') as string[];
  const packageOptions = t.raw('packageOptions') as string[];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      await fetch('/api/ruta-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silencioso: el respaldo por WhatsApp asegura que el lead no se pierda.
    }

    const message = t('leadWhatsappTemplate', {
      name: String(data.get('nombre') ?? ''),
      role: String(data.get('cargo') ?? ''),
      municipality: String(data.get('municipio') ?? ''),
      phone: String(data.get('telefono') ?? ''),
      email: String(data.get('email') ?? ''),
      social: String(data.get('redes') ?? ''),
      promote: String(data.get('promover') ?? ''),
      package: String(data.get('paquete') ?? ''),
      message: String(data.get('mensaje') ?? ''),
    });

    setSent(true);
    window.open(whatsappLink(message.replace(/%0A/g, '\n')), '_blank');
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center bg-surface p-10 text-center sm:p-14">
        <span className="flex h-16 w-16 items-center justify-center bg-accent text-accent-fg">
          <Icon name="check" size={32} strokeWidth={2.5} />
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold uppercase text-fg sm:text-3xl">
          {tc('thankYouRutaLocal')}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          {tc('thankYouRutaLocalText')}
        </p>
        <Button
          href={whatsappLink(t('whatsappLead'))}
          external
          variant="whatsapp"
          icon="whatsapp"
          size="lg"
          className="mt-7"
        >
          {tc('whatsapp')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-7 sm:p-9">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t('formName')}
          name="nombre"
          placeholder={t('formNamePlaceholder')}
          required
        />
        <Field
          label={t('formRole')}
          name="cargo"
          placeholder={t('formRolePlaceholder')}
        />
        <Field
          label={t('formMunicipality')}
          name="municipio"
          placeholder={t('formMunicipalityPlaceholder')}
          required
        />
        <Field
          label={t('formPhone')}
          name="telefono"
          type="tel"
          placeholder={t('formPhonePlaceholder')}
          required
        />
        <Field
          label={t('formEmail')}
          name="email"
          type="email"
          placeholder={t('formEmailPlaceholder')}
          required
        />
        <Field
          label={t('formSocial')}
          name="redes"
          placeholder={t('formSocialPlaceholder')}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t('formPromote')}
          name="promover"
          placeholder={t('formPromotePlaceholder')}
          options={promoteOptions}
        />
        <SelectField
          label={t('formPackage')}
          name="paquete"
          placeholder={t('formPackagePlaceholder')}
          options={packageOptions}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="mensaje" className={labelClass}>
          {t('formMessage')}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder={t('formMessagePlaceholder')}
          className={inputClass}
        />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" iconRight="arrow-right">
        {t('formSubmit')}
      </Button>
      <p className="mt-3 text-center text-xs text-faint">{t('formConsent')}</p>
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
      <label htmlFor={name} className={labelClass}>
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

function SelectField({
  label,
  name,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`${inputClass} [&>option]:bg-ink-850`}
        defaultValue=""
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
