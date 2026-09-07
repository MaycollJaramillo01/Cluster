import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import type { LandingProblem, LandingSectionCopy } from '@/lib/landings/types';

type Props = {
  copy: LandingSectionCopy['problem'];
  problems: readonly LandingProblem[];
};

export function LandingProblemSection({ copy, problems }: Props) {
  return (
    <Section tone="light" id="problema" density="compact">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        align="center"
        titleClass="text-4xl sm:text-5xl lg:text-6xl"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
        {problems.map((problem, i) => (
          <Reveal
            key={problem.title}
            delay={i * 70}
            className="flex h-full flex-col border border-line bg-paper p-5 shadow-glow-sm sm:p-6"
          >
            <span className="font-mono text-xs text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-4 font-display text-2xl normal-case tracking-normal text-ink">
              {problem.title}
            </h3>
            <p className="mt-3 flex-1 text-[16px] leading-relaxed text-ink/75">
              {problem.text}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
