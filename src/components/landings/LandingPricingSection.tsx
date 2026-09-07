import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { DualCtas } from './DualCtas';
import type { LandingSectionCopy } from '@/lib/landings/types';

type Props = {
  copy: LandingSectionCopy['pricing'];
  bullets: readonly string[];
  whatsappMessage: string;
  onWhatsApp: () => void;
  onSchedule: () => void;
};

/** Sin precios públicos: vende el diagnóstico inicial. */
export function LandingPricingSection({
  copy,
  bullets,
  whatsappMessage,
  onWhatsApp,
  onSchedule,
}: Props) {
  return (
    <Section tone="dark" id="diagnostico" density="compact">
      <div className="grid gap-0 lg:grid-cols-2 lg:items-stretch">
        <Reveal className="flex flex-col justify-center border border-line bg-ink-950/40 p-6 sm:p-8 lg:border-r-0 lg:p-8">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            titleClass="text-3xl sm:text-4xl lg:text-5xl"
            className="max-w-none gap-3"
          />
        </Reveal>
        <Reveal
          delay={80}
          className="flex flex-col justify-center border border-line bg-surface p-6 sm:p-8"
        >
          <p className="mono-label text-accent">Empezamos aquí</p>
          <p className="mt-4 font-display text-3xl leading-tight text-fg sm:text-4xl">
            Diagnóstico inicial de tu proceso comercial
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Identificamos dónde se pierden consultas, citas y cierres. Luego
            diseñamos el sistema a la medida de tu operación — grande o pequeña.
          </p>
          <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm text-muted">
            {bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent" aria-hidden="true">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <DualCtas
            className="mt-8"
            whatsappMessage={whatsappMessage}
            onWhatsApp={onWhatsApp}
            onSchedule={onSchedule}
          />
        </Reveal>
      </div>
    </Section>
  );
}
