'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { whatsappLink } from '@/lib/site';

type Option = { id: string; label: string; icon: IconName };

const challenges: Option[] = [
  { id: 'redes', label: 'No tengo estrategia en redes sociales', icon: 'megaphone' },
  { id: 'web', label: 'Mi web está desactualizada o no tengo', icon: 'globe' },
  { id: 'ads', label: 'Invierto en publicidad pero no veo resultados', icon: 'chart' },
  { id: 'ventas', label: 'Me contactan pero no logro cerrar ventas', icon: 'target' },
  { id: 'marca', label: 'Mi marca no transmite profesionalismo', icon: 'sparkles' },
  { id: 'crecer', label: 'Quiero crecer pero no sé por dónde empezar', icon: 'rocket' },
];

const stages: Option[] = [
  { id: 'inicio', label: 'Estoy empezando, tengo menos de 1 año', icon: 'bolt' },
  { id: 'escalar', label: 'Llevo 1–3 años y quiero escalar', icon: 'chart' },
  { id: 'consolidada', label: 'Soy una empresa consolidada (3+ años)', icon: 'shield' },
  { id: 'freelance', label: 'Soy profesional independiente / freelance', icon: 'users' },
];

const TOTAL = 3;

const inputClass =
  'w-full bg-surface py-3.5 pl-11 pr-4 text-[15px] text-fg placeholder:text-faint transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent)]';

export function LeadQuiz() {
  const [step, setStep] = useState(0);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [redes, setRedes] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const chLabel = challenges.find((c) => c.id === challenge)?.label ?? '—';
    const stLabel = stages.find((s) => s.id === stage)?.label ?? '—';
    const message =
      `Quiero mi recomendación personalizada de Cluster Media:%0A` +
      `• Desafío: ${chLabel}%0A` +
      `• Etapa: ${stLabel}%0A` +
      `• Nombre: ${data.get('nombre')}%0A` +
      `• Negocio: ${data.get('negocio') || '—'}%0A` +
      `• WhatsApp: ${data.get('whatsapp')}%0A` +
      `• Redes: ${data.get('redes') || '—'}`;
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
            ¡Listo! Vamos a por tu plan.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            Preparamos tu recomendación con base en tus respuestas. Si WhatsApp no
            se abrió solo, escríbenos y te enviamos un plan adaptado a tu situación.
          </p>
          <Button
            href={whatsappLink('Hola, acabo de completar el diagnóstico en su website.')}
            external
            variant="accent"
            icon="whatsapp"
            size="lg"
            className="mt-7"
          >
            Abrir WhatsApp
          </Button>
        </div>
      </Card>
    );
  }

  const questions = [
    {
      paso: 'Paso 1 de 3',
      title: '¿Cuál es tu mayor desafío digital hoy?',
      sub: 'Seleccioná la opción que mejor describe tu situación.',
    },
    {
      paso: 'Paso 2 de 3',
      title: '¿En qué etapa está tu negocio?',
      sub: 'Esto nos ayuda a recomendarte el plan ideal.',
    },
    {
      paso: 'Paso 3 de 3',
      title: '¿A dónde te enviamos tu recomendación?',
      sub: 'Te contactamos con un plan adaptado a tu situación.',
    },
  ];
  const q = questions[step];

  return (
    <Card>
      {/* Progreso */}
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

      <span className="mono-label mt-7 block text-faint">{q.paso}</span>
      <h2 className="mt-3 font-display text-[1.7rem] font-bold uppercase leading-[1.05] tracking-tight text-fg sm:text-4xl">
        {q.title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{q.sub}</p>

      {/* Paso 1 — Desafío */}
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
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Paso 2 — Etapa */}
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
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3 — Datos */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <IconField
            icon="users"
            name="nombre"
            placeholder="Tu nombre"
            value={name}
            onChange={setName}
            required
          />
          <IconField icon="pin" name="negocio" placeholder="Nombre de tu negocio" />
          <IconField
            icon="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="WhatsApp (con código de país)"
            value={whatsapp}
            onChange={setWhatsapp}
            required
          />
          <IconField
            icon="instagram"
            name="redes"
            placeholder="@usuario en Instagram / TikTok (opcional)"
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
              disabled={!name.trim() || !whatsapp.trim()}
            >
              Recibir recomendación
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-xl border border-line bg-ink-900/70 p-7 backdrop-blur-md sm:p-10">
      {/* Marcas de esquina tipo visor */}
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
  required,
  value,
  onChange,
}: {
  icon: IconName;
  name: string;
  placeholder: string;
  type?: string;
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
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={inputClass}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Volver"
      className="flex-none border-0 bg-surface px-6 text-fg transition-colors duration-300 hover:bg-surface-2"
    >
      <Icon name="arrow-right" size={18} className="rotate-180" />
    </button>
  );
}
