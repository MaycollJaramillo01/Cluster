import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { LandingTrackingBadges } from './LandingTrackingBadges';
import type { LandingSectionCopy, LandingStep } from '@/lib/landings/types';

type Props = {
  copy: LandingSectionCopy['steps'];
  steps: readonly LandingStep[];
  showTrackingBadges?: boolean;
};

export function LandingHowItWorks({
  copy,
  steps,
  showTrackingBadges = true,
}: Props) {
  return (
    <Section tone="light" id="como-funciona" density="compact">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        align="center"
        titleClass="text-4xl sm:text-5xl lg:text-6xl"
      />
      <div className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal
            key={step.n}
            delay={i * 60}
            className="flex h-full min-h-[180px] flex-col border border-line bg-paper p-5"
          >
            <span className="font-mono text-sm text-accent">{step.n}</span>
            <h3 className="mt-4 font-display text-2xl normal-case tracking-normal text-ink">
              {step.title}
            </h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
              {step.text}
            </p>
          </Reveal>
        ))}
      </div>
      {showTrackingBadges && <LandingTrackingBadges />}
    </Section>
  );
}
