import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CaseCard } from '@/components/blocks/CaseCard';
import { LogoMarquee } from '@/components/blocks/LogoMarquee';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { caseStudies, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Casos de éxito de marketing digital',
  description:
    'Conoce casos de éxito de Cluster Media en generación de leads, automatización, redes sociales, branding y crecimiento digital para negocios hispanos.',
  alternates: { canonical: '/casos-de-exito' },
};

export default function CasosPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Casos de Éxito', url: `${site.url}/casos-de-exito` },
        ])}
      />

      <PageHero
        eyebrow="Casos de éxito"
        title="Resultados reales para negocios que decidieron crecer."
        subtitle="Estos son algunos negocios que han confiado en Cluster Media para mejorar su presencia digital, generar prospectos y ordenar su crecimiento."
        whatsappMessage="Hola, quiero resultados como los de sus casos de éxito."
      />

      <Section tone="light">
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((study, i) => (
            <CaseCard key={study.slug} study={study} index={i} />
          ))}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="Prueba social"
          align="center"
          title="Marcas locales, regionales e internacionales."
          description="Hemos trabajado con negocios familiares hasta empresas con mayor estructura comercial."
          className="mb-12"
        />
        <LogoMarquee />
      </Section>

      <CTASection
        title="¿Quieres ser el próximo caso de éxito?"
        whatsappMessage="Hola, quiero ser el próximo caso de éxito de Cluster Media."
      />
    </>
  );
}
