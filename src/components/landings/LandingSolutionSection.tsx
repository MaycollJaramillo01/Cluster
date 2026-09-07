import Image from 'next/image';
import { Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import type { LandingBenefit, LandingSectionCopy } from '@/lib/landings/types';

type Props = {
  copy: LandingSectionCopy['solution'];
  benefits: readonly LandingBenefit[];
  imageSrc: string;
  imageAlt: string;
};

export function LandingSolutionSection({
  copy,
  benefits,
  imageSrc,
  imageAlt,
}: Props) {
  return (
    <section
      id="solucion"
      className="theme-dark relative overflow-hidden bg-ink-900 py-14 text-fg grain sm:py-16 lg:py-20"
    >
      <div className="container-x relative z-[1]">
        <div className="grid gap-0 overflow-hidden border border-line lg:grid-cols-2 lg:items-stretch">
          <Reveal className="relative aspect-[4/3] lg:aspect-auto lg:min-h-full">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/60 via-transparent to-transparent" />
          </Reveal>

          <Reveal
            delay={60}
            className="flex flex-col border-t border-line bg-surface/40 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-8"
          >
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl leading-tight text-fg sm:text-4xl lg:text-[2.75rem]">
              {copy.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
              {copy.description}
            </p>
            <div className="mt-6 grid gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="border border-line bg-ink-950/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-display text-base normal-case tracking-normal text-fg sm:text-lg">
                      {benefit.title}
                    </h3>
                    {benefit.highlight && (
                      <span className="mono-label shrink-0 text-accent">
                        {benefit.highlight}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
