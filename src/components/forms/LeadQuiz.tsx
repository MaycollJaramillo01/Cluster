'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

type Option = { id: string; label: string; icon: IconName };

const challengeIcons: Record<string, IconName> = {
  redes: 'megaphone',
  web: 'globe',
  ads: 'chart',
  ventas: 'target',
  marca: 'sparkles',
  crecer: 'rocket',
  lt10: 'users',
  from10to30: 'target',
  from31to100: 'chart',
  gt100: 'rocket',
  unknown: 'sparkles',
};

const stageIcons: Record<string, IconName> = {
  inicio: 'bolt',
  escalar: 'chart',
  consolidada: 'shield',
  freelance: 'users',
  capacityYes: 'check',
  capacityAdjust: 'chart',
  capacityNo: 'clock',
};

const TOTAL = 3;

const inputClass =
  'w-full bg-surface py-3.5 pl-11 pr-4 text-[15px] text-fg placeholder:text-faint transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent)]';

const countries = [
  { value: 'HN|Honduras|+504', label: '🇭🇳 Honduras (+504)', placeholder: '9999-9999' },
  { value: 'NI|Nicaragua|+505', label: '🇳🇮 Nicaragua (+505)', placeholder: '8888-8888' },
  { value: 'CR|Costa Rica|+506', label: '🇨🇷 Costa Rica (+506)', placeholder: '8888-8888' },
  { value: 'GT|Guatemala|+502', label: '🇬🇹 Guatemala (+502)', placeholder: '5555-5555' },
  { value: 'SV|El Salvador|+503', label: '🇸🇻 El Salvador (+503)', placeholder: '7777-7777' },
  { value: 'PA|Panamá|+507', label: '🇵🇦 Panamá (+507)', placeholder: '6000-0000' },
  { value: 'MX|México|+52', label: '🇲🇽 México (+52)', placeholder: '55 1234 5678' },
  { value: 'CO|Colombia|+57', label: '🇨🇴 Colombia (+57)', placeholder: '300 123 4567' },
  { value: 'VE|Venezuela|+58', label: '🇻🇪 Venezuela (+58)', placeholder: '412 123 4567' },
  { value: 'EC|Ecuador|+593', label: '🇪🇨 Ecuador (+593)', placeholder: '99 123 4567' },
  { value: 'PE|Perú|+51', label: '🇵🇪 Perú (+51)', placeholder: '912 345 678' },
  { value: 'BO|Bolivia|+591', label: '🇧🇴 Bolivia (+591)', placeholder: '71234567' },
  { value: 'CL|Chile|+56', label: '🇨🇱 Chile (+56)', placeholder: '9 1234 5678' },
  { value: 'AR|Argentina|+54', label: '🇦🇷 Argentina (+54)', placeholder: '11 1234 5678' },
  { value: 'UY|Uruguay|+598', label: '🇺🇾 Uruguay (+598)', placeholder: '99 123 456' },
  { value: 'PY|Paraguay|+595', label: '🇵🇾 Paraguay (+595)', placeholder: '981 123456' },
  { value: 'DO|República Dominicana|+1', label: '🇩🇴 Rep. Dominicana (+1)', placeholder: '809 555 0123' },
  { value: 'PR|Puerto Rico|+1', label: '🇵🇷 Puerto Rico (+1)', placeholder: '787 555 0123' },
  { value: 'US|Estados Unidos|+1', label: '🇺🇸 Estados Unidos (+1)', placeholder: '305 555 0123' },
  { value: 'ES|España|+34', label: '🇪🇸 España (+34)', placeholder: '612 345 678' },
] as const;

type LeadQuizProps = {
  industry?: string;
  campaignId?: string;
  whatsappMessage?: string;
};

export function LeadQuiz(props: LeadQuizProps = {}) {
  if (props.campaignId) {
    return (
      <GrowthQualificationForm
        industry={props.industry}
        campaignId={props.campaignId}
        whatsappMessage={props.whatsappMessage}
      />
    );
  }

  return <StandardLeadQuiz />;
}

function GrowthQualificationForm({
  industry,
  campaignId,
  whatsappMessage,
}: Required<Pick<LeadQuizProps, 'campaignId'>> & Omit<LeadQuizProps, 'campaignId'>) {
  const t = useTranslations('LeadQuiz');
  const tc = useTranslations('Common');
  const [callWindow, setCallWindow] = useState('');
  const [countryValue, setCountryValue] = useState('');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const country = countries.find((item) => item.value === countryValue);
  const whatsappUrl = whatsappLink(
    `${whatsappMessage || 'Hola, quiero saber si mi negocio califica.'}\n\nRef: ${campaignId}`,
  );
  const callWindows = t.raw('callWindows') as { id: string; label: string }[];
  const prospectOptions = t.raw('prospectOptions') as { id: string; label: string }[];

  async function handleGrowthSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData(e.currentTarget);
    const [, countryName = '', dialCode = ''] = countryValue.split('|');
    const windowLabel = callWindows.find((item) => item.id === data.get('horario'))?.label || '';
    const prospectLabel = prospectOptions.find((item) => item.id === data.get('prospectos'))?.label || '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: String(data.get('nombre') || ''),
          empresa: String(data.get('negocio') || ''),
          pais: countryName,
          telefono: `${dialCode} ${String(data.get('telefono') || '')}`.trim(),
          servicio: 'Sistema de crecimiento con garantía',
          origen: 'crecimiento',
          mensaje: [
            `Industria: ${industry || 'Sin especificar'}`,
            `Campaña: ${campaignId}`,
            `Horario para llamar: ${windowLabel}`,
            `Hora ideal: ${String(data.get('horaIdeal') || '')}`,
            `Prospectos actuales: ${prospectLabel}`,
          ].join('\n'),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error('submit_failed');
      setSent(true);
    } catch {
      setStatus('error');
    }
  }

  if (sent) {
    return (
      <Card>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center bg-accent text-accent-fg">
            <Icon name="check" size={32} strokeWidth={2.5} />
          </span>
          <h2 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-fg sm:text-3xl">
            {t('growthDoneTitle')}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {t('growthDoneText')}
          </p>
          <Button href={whatsappUrl} external variant="outline-light" icon="whatsapp" size="lg" className="mt-7">
            {tc('openWhatsapp')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleGrowthSubmit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <LabeledField label={t('fullNameLabel')} name="nombre" autoComplete="name" required />
          <LabeledField label={t('businessNameLabel')} name="negocio" autoComplete="organization" required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-fg" htmlFor="telefono">
            {t('phoneLabel')}
          </label>
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-px bg-line focus-within:ring-2 focus-within:ring-[color:var(--accent)]">
            <select
              id="pais"
              name="pais"
              value={countryValue}
              onChange={(e) => setCountryValue(e.target.value)}
              required
              aria-label={t('countryCodeLabel')}
              className="min-w-0 bg-surface px-3 py-3.5 text-[15px] text-fg outline-none"
            >
              <option value="">{t('countryCodePlaceholder')}</option>
              {countries.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              required
              placeholder={country?.placeholder || t('phonePlaceholder')}
              className="min-w-0 bg-surface px-3 py-3.5 text-[15px] text-fg placeholder:text-faint outline-none"
            />
          </div>
        </div>

        <RadioGroup
          legend={t('callWindowLabel')}
          name="horario"
          options={callWindows}
          value={callWindow}
          onChange={setCallWindow}
        />

        {callWindow && (
          <div className="border-l-2 border-accent pl-4">
            <label className="mb-2 block text-sm font-semibold text-fg" htmlFor="horaIdeal">
              {t('idealTimeLabel')}
            </label>
            <input
              id="horaIdeal"
              name="horaIdeal"
              type="time"
              required
              className="w-full bg-surface px-4 py-3.5 text-[15px] text-fg outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent)]"
            />
          </div>
        )}

        <RadioGroup
          legend={t('prospectsLabel')}
          name="prospectos"
          options={prospectOptions}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            iconRight="arrow-right"
            className="w-full disabled:cursor-not-allowed disabled:opacity-50"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? tc('sending') : t('growthSubmit')}
          </Button>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted">{t('growthMicrocopy')}</p>
          {status === 'error' && <p className="mt-3 text-sm text-red-400" role="alert">{tc('formError')}</p>}
        </div>
      </form>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex min-h-11 items-center justify-center gap-2 border-t border-line pt-5 text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent"
      >
        <Icon name="whatsapp" size={18} fill="currentColor" strokeWidth={0} />
        {t('growthWhatsappOption')}
      </a>
    </Card>
  );
}

function StandardLeadQuiz({
  industry,
  campaignId,
  whatsappMessage,
}: LeadQuizProps = {}) {
  const t = useTranslations('LeadQuiz');
  const tc = useTranslations('Common');

  const challenges = (t.raw(campaignId ? 'growthChallenges' : 'challenges') as { id: string; label: string }[]).map(
    (item) => ({ ...item, icon: challengeIcons[item.id] ?? 'bolt' }),
  );
  const stages = (t.raw(campaignId ? 'growthStages' : 'stages') as { id: string; label: string }[]).map(
    (item) => ({ ...item, icon: stageIcons[item.id] ?? 'users' }),
  );
  const questions = t.raw(campaignId ? 'growthQuestions' : 'questions') as {
    step: string;
    title: string;
    sub: string;
  }[];

  const [step, setStep] = useState(0);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [redes, setRedes] = useState('');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const growthWhatsappUrl = campaignId
    ? whatsappLink(`${whatsappMessage || 'Hola, quiero saber si mi negocio califica.'}\n\nRef: ${campaignId}`)
    : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const chLabel = challenges.find((c) => c.id === challenge)?.label ?? '—';
    const stLabel = stages.find((s) => s.id === stage)?.label ?? '—';

    if (campaignId) {
      setStatus('loading');
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: String(data.get('nombre') || ''),
            empresa: String(data.get('negocio') || ''),
            pais: String(data.get('pais') || ''),
            email: String(data.get('email') || ''),
            telefono: String(data.get('whatsapp') || ''),
            website: String(data.get('website') || ''),
            servicio: 'Sistema de crecimiento con garantía',
            origen: 'crecimiento',
            mensaje: [
              `Industria: ${industry || '—'}`,
              `Campaña: ${campaignId}`,
              `Oportunidades nuevas al mes: ${chLabel}`,
              `Capacidad para nuevos clientes: ${stLabel}`,
              `Redes: ${data.get('redes') || '—'}`,
            ].join('\n'),
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error('submit_failed');
        setSent(true);
      } catch {
        setStatus('error');
      }
      return;
    }

    const message = t('whatsappTemplate', {
      challenge: chLabel,
      stage: stLabel,
      name: String(data.get('nombre') ?? ''),
      business: String(data.get('negocio') || '—'),
      whatsapp: String(data.get('whatsapp') ?? ''),
      website: String(data.get('website') || '—'),
      social: String(data.get('redes') || '—'),
    });
    setSent(true);
    window.open(whatsappLink(decodeURIComponent(message)), '_blank');
  }

  if (sent) {
    return (
      <Card>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center bg-accent text-accent-fg">
            <Icon name="check" size={32} strokeWidth={2.5} />
          </span>
          <h2 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-fg sm:text-3xl">
            {campaignId ? t('growthDoneTitle') : tc('quizDoneTitle')}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {campaignId ? t('growthDoneText') : tc('quizDoneText')}
          </p>
          <Button
            href={whatsappLink(
              campaignId
                ? `Hola, acabo de completar el formulario para ${industry}. Ref: ${campaignId}`
                : tc('quizDoneWhatsapp'),
            )}
            external
            variant={campaignId ? 'outline-light' : 'accent'}
            icon="whatsapp"
            size="lg"
            className="mt-7"
          >
            {tc('openWhatsapp')}
          </Button>
        </div>
      </Card>
    );
  }

  const q = questions[step];

  return (
    <Card>
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span
            key={i}
            className={`h-1 transition-all duration-500 ${
              i === step
                ? 'w-8 bg-accent'
                : i < step
                  ? 'w-2.5 bg-accent'
                  : 'w-2.5 bg-surface-2'
            }`}
          />
        ))}
      </div>

      <span className="mono-label mt-7 block text-faint">{q.step}</span>
      <h2 className="mt-3 font-display text-[1.7rem] font-bold uppercase leading-[1.05] tracking-tight text-fg sm:text-4xl">
        {q.title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{q.sub}</p>

      {step === 0 && (
        <div className="mt-8 space-y-2.5">
          {challenges.map((opt) => (
            <OptionRow
              key={opt.id}
              opt={opt}
              selected={challenge === opt.id}
              onSelect={() => setChallenge(opt.id)}
            />
          ))}
          <div className="pt-5">
            <Button
              variant="accent"
              size="lg"
              iconRight="arrow-right"
              className="w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              disabled={!challenge}
              onClick={() => setStep(1)}
            >
              {tc('next')}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 space-y-2.5">
          {stages.map((opt) => (
            <OptionRow
              key={opt.id}
              opt={opt}
              selected={stage === opt.id}
              onSelect={() => setStage(opt.id)}
            />
          ))}
          <div className="flex gap-3 pt-5">
            <BackButton onClick={() => setStep(0)} />
            <Button
              variant="accent"
              size="lg"
              iconRight="arrow-right"
              className="flex-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              disabled={!stage}
              onClick={() => setStep(2)}
            >
              {tc('next')}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <IconField
            icon="users"
            name="nombre"
            placeholder={tc('name')}
            value={name}
            onChange={setName}
            required
          />
          <IconField
            icon="pin"
            name="negocio"
            placeholder={t('businessField')}
            required={Boolean(campaignId)}
          />
          <IconField
            icon={campaignId ? 'phone' : 'whatsapp'}
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            placeholder={campaignId ? t('growthPhoneOptional') : tc('whatsappWithCountry')}
            value={whatsapp}
            onChange={(v) => setWhatsapp(v.replace(/\D/g, ''))}
            required={!campaignId}
          />
          {campaignId && (
            <>
              <IconField
                icon="mail"
                name="email"
                type="email"
                placeholder={tc('email')}
                required
              />
              <IconField
                icon="globe"
                name="pais"
                placeholder={tc('country')}
                required
              />
            </>
          )}
          <IconField
            icon="globe"
            name="website"
            placeholder={tc('websiteOptional')}
            value={website}
            onChange={setWebsite}
          />
          <IconField
            icon="instagram"
            name="redes"
            placeholder={tc('socialOptional')}
            value={redes}
            onChange={setRedes}
          />
          <div className="flex gap-3 pt-2">
            <BackButton onClick={() => setStep(1)} />
            <Button
              type="submit"
              variant="accent"
              size="lg"
              iconRight="arrow-right"
              className="flex-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              disabled={!name.trim() || (!campaignId && !whatsapp.trim()) || status === 'loading'}
            >
              {status === 'loading'
                ? tc('sending')
                : campaignId
                  ? t('growthSubmit')
                  : tc('receiveRecommendation')}
            </Button>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-400" role="alert">{tc('formError')}</p>
          )}
        </form>
      )}
      {growthWhatsappUrl && (
        <a
          href={growthWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent"
        >
          <Icon name="whatsapp" size={18} fill="currentColor" strokeWidth={0} />
          {t('growthWhatsappOption')}
        </a>
      )}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-xl border border-line bg-ink-900/70 p-7 backdrop-blur-md sm:p-10">
      {[
        '-top-px -left-px border-t border-l',
        '-top-px -right-px border-t border-r',
        '-bottom-px -left-px border-b border-l',
        '-bottom-px -right-px border-b border-r',
      ].map((pos) => (
        <span
          key={pos}
          className={`pointer-events-none absolute h-4 w-4 border-accent/60 ${pos}`}
          aria-hidden="true"
        />
      ))}
      {children}
    </div>
  );
}

function LabeledField({
  label,
  name,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-fg" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="text"
        autoComplete={autoComplete}
        required={required}
        className="w-full bg-surface px-4 py-3.5 text-[15px] text-fg outline-none transition-colors focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent)]"
      />
    </div>
  );
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { id: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold leading-snug text-fg">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex min-h-12 cursor-pointer items-center gap-3 border border-line bg-surface px-4 py-3 text-sm text-muted transition-colors hover:border-white/25 hover:text-fg has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-fg"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === undefined ? undefined : value === option.id}
              onChange={(event) => onChange?.(event.target.value)}
              required
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function OptionRow({
  opt,
  selected,
  onSelect,
}: {
  opt: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-3.5 border px-4 py-3.5 text-left transition-all duration-300 ${
        selected
          ? 'border-accent bg-accent/10 text-fg'
          : 'border-line bg-surface text-muted hover:border-white/25 hover:text-fg'
      }`}
    >
      <Icon
        name={opt.icon}
        size={18}
        className={`flex-none transition-colors duration-300 ${
          selected ? 'text-accent' : 'text-faint group-hover:text-fg'
        }`}
      />
      <span className="text-[15px] font-medium leading-snug">{opt.label}</span>
      <span
        className={`ml-auto flex-none transition-opacity duration-300 ${
          selected ? 'text-accent opacity-100' : 'opacity-0'
        }`}
      >
        <Icon name="check" size={16} strokeWidth={2.5} />
      </span>
    </button>
  );
}

function IconField({
  icon,
  name,
  placeholder,
  type = 'text',
  inputMode,
  required,
  value,
  onChange,
}: {
  icon: IconName;
  name: string;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
        <Icon name={icon} size={16} />
      </span>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-label={placeholder}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={inputClass}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  const tc = useTranslations('Common');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tc('backAria')}
      className="flex-none border-0 bg-surface px-6 text-fg transition-colors duration-300 hover:bg-surface-2"
    >
      <Icon name="arrow-right" size={18} className="rotate-180" />
    </button>
  );
}
