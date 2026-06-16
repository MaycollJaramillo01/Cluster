import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ServiceCard } from '@/components/blocks/ServiceCard';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { services, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Servicios de marketing digital para negocios hispanos',
  description:
    'Conoce los servicios de Cluster Media: redes sociales, Google Ads, branding, websites, SEO, automatizaciones con IA y CRM para negocios hispanos.',
  alternates: { canonical: '/servicios' },
};

export default function ServiciosPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Servicios', url: `${site.url}/servicios` },
        ])}
      />
      <PageHero
        eyebrow="Servicios"
        title="Servicios digitales para negocios que quieren crecer."
        subtitle="Desde branding y websites hasta campañas, contenido y automatizaciones: diseñamos soluciones para que tu negocio se vea mejor, consiga más clientes y opere con mayor eficiencia."
        whatsappMessage="Hola, quiero conocer los servicios de Cluster Media."
      />

      <Section tone="light">
        <SectionHeading
          eyebrow="Categorías principales"
          align="center"
          title="Todo lo que tu negocio necesita, en un solo lugar."
          description="Cada servicio funciona por sí solo, pero juntos forman un ecosistema digital que genera clientes."
          className="mb-14"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </Section>

      <CTASection
        title="¿No sabes por dónde empezar?"
        text="Agenda una llamada de diagnóstico gratuita. Revisamos tu negocio y te recomendamos la ruta más efectiva para crecer."
        whatsappMessage="Hola, quiero una llamada de diagnóstico para mi negocio."
      />
    </>
  );
}
