import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Websites y SEO para negocios hispanos',
  description:
    'Diseñamos websites, landing pages y estructuras SEO para negocios hispanos que quieren verse profesionales y generar contactos online.',
  alternates: { canonical: '/websites-seo' },
};

const servicesList = [
  'Website informativo',
  'Landing page',
  'SEO básico',
  'Formularios',
  'Integración con WhatsApp',
  'Integración con CRM',
  'Estructura de conversión',
  'Actualización de website',
];

export default function WebsitesSeoPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Websites y SEO',
          description: metadata.description as string,
          url: `${site.url}/websites-seo`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Websites / SEO', url: `${site.url}/websites-seo` },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/laptop.jpg", alt: "Desarrollo de websites y SEO" }}
        eyebrow="Websites / SEO"
        title="Websites pensados para convertir visitas en clientes."
        subtitle="Creamos sitios web claros, modernos y enfocados en que tu negocio se vea profesional y genere contactos."
        whatsappMessage="Hola, quiero información sobre un website para mi negocio."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Servicios"
            title="Sitios que se ven bien y trabajan por ti."
            description="Cada website lo construimos con una estructura pensada para guiar al visitante hacia el contacto, no solo para informar."
          />
          <Reveal delay={120} className="rounded-3xl bg-surface p-8">
            <CheckList items={servicesList} columns={2} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      {/* Conexión con Paquete Inicial */}
      <Section tone="dark">
        <Reveal className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-surface p-8 text-center sm:flex-row sm:text-left lg:p-10">
          <div className="flex items-center gap-5">
            <span className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-surface text-accent sm:flex">
              <Icon name="rocket" size={28} />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                ¿Necesitas empezar rápido?
              </h3>
              <p className="mt-1.5 text-white/65">
                Conoce nuestro Paquete Digital Inicial por USD 590.
              </p>
            </div>
          </div>
          <Button
            href="/paquete-inicial-digital"
            size="lg"
            className="flex-none"
            iconRight="arrow-right"
          >
            Ver paquete
          </Button>
        </Reveal>
      </Section>

      <CTASection
        title="Construyamos un website que genere contactos."
        whatsappMessage="Hola, quiero cotizar un website para mi negocio."
      />
    </>
  );
}
