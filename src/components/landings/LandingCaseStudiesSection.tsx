import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CaseCard } from '@/components/blocks/CaseCard';
import { caseStudies } from '@/lib/site';
import type { LandingSectionCopy } from '@/lib/landings/types';

type Props = {
  copy: LandingSectionCopy['cases'];
  slugs: readonly string[];
};

export function LandingCaseStudiesSection({ copy, slugs }: Props) {
  const studies = slugs
    .map((slug) => caseStudies.find((s) => s.slug === slug))
    .filter((s): s is (typeof caseStudies)[number] => Boolean(s));

  return (
    <Section tone="soft" id="resultados" density="compact">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        align="center"
        titleClass="text-4xl sm:text-5xl lg:text-6xl"
      />
      <div className="mt-8 grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
        {studies.map((study, i) => (
          <div key={study.slug} className="h-full">
            <CaseCard study={study} index={i} showCaseLink={false} />
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
        Resultados reales de clientes de Cluster. El sistema de conversión se adapta
        al proceso comercial de tu vertical.
      </p>
      <p className="mt-4 text-center">
        <Link
          href="/casos-de-exito"
          className="font-mono text-xs uppercase tracking-[0.14em] text-accent link-underline"
        >
          Ver todos los casos
        </Link>
      </p>
    </Section>
  );
}
