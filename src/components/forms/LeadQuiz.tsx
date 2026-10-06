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

export function LeadQuiz({
  industry,
  campaignId,
  whatsappMessage,
}: {
  industry?: string;
  campaignId?: string;
  whatsappMessage?: string;
} = {}) {
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
