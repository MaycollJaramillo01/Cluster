import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ServiceCard } from '@/components/blocks/ServiceCard';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { services, site } from '@/lib/site';

const additionalServices = [
  'Edición de audiovisuales',
  'Videos',
  'Fotografía',
  'Podcast',
  'Agentes IA',
  'Dominios',
  'Email corporativo',
  'Email marketing',
  'Facebook Ads',
  'Funnels',
  'Consultorías',
  'Capacitaciones',
];

export const metadata: Metadata = {
  title: 'Servicios de comunicación digital para marcas',
  description:
    'Conoce los servicios de Cluster Media: redes sociales, Google Ads, branding, websites, SEO, edición audiovisual, automatizaciones, funnels, fotografía, podcast y consultorías.',
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
        image={{ src: "/assets/stock/strategy.jpg", alt: "Equipo de marketing trabajando en estrategia digital" }}
        eyebrow="Servicios"
        title="Servicios digitales para marcas que quieren conectar."
        subtitle="Redes sociales, contenido, edición audiovisual, branding, websites, campañas, CRM, automatizaciones, funnels y consultorías para construir una presencia digital completa."
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

      <Section tone="soft">
        <SectionHeading
          eyebrow="Otros servicios digitales"
          align="center"
          title="Más capacidades para completar tu ecosistema digital."
          description="Además de los servicios principales, podemos sumar producción, herramientas, consultoría y capacitación según la etapa de tu marca."
          className="mb-12"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {additionalServices.map((service) => (
            <div
              key={service}
              className="border border-line bg-paper px-5 py-4 font-display text-base font-semibold uppercase leading-tight text-ink-950"
            >
              {service}
            </div>
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
