import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Branding y diseño de marca para negocios',
  description:
    'Creamos logotipos, manuales de marca e identidad visual para negocios que quieren verse profesionales, confiables y listos para crecer.',
  alternates: { canonical: '/branding' },
};

const includes = [
  'Logotipo y versiones',
  'Paleta de colores',
  'Tipografías',
  'Línea gráfica',
  'Manual básico de marca',
  'Aplicaciones visuales según paquete',
];

const faqs = [
  {
    q: '¿Cuánto tarda el proceso de branding?',
    a: 'Depende del alcance, pero un proyecto de identidad visual suele tomar entre 2 y 4 semanas, considerando rondas de revisión y aprobación.',
  },
  {
    q: '¿El branding incluye el diseño de mi website?',
    a: 'El branding define la identidad visual. El website se cotiza por separado o se incluye dentro del Paquete Digital Inicial y de los paquetes recurrentes.',
  },
  {
    q: '¿Entregan los archivos editables?',
    a: 'Sí. Entregamos el logotipo en formatos vectoriales y de uso común, junto con el manual de marca para que apliques tu identidad de forma consistente.',
  },
];

export default function BrandingPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Branding y diseño de marca',
          description: metadata.description as string,
          url: `${site.url}/branding`,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Branding', url: `${site.url}/branding` },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/creative.jpg", alt: "Diseño y dirección de arte de marca" }}
        eyebrow="Branding"
        title="Haz que tu negocio se vea como una marca seria."
        subtitle="Diseñamos logotipos, manuales de marca e identidad visual para que tu negocio proyecte confianza desde el primer contacto."
        whatsappMessage="Hola, quiero información sobre branding para mi negocio."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Qué incluye"
            title="Una identidad completa, lista para aplicar."
            description="Construimos los elementos esenciales para que tu marca se vea coherente en cada punto de contacto con tus clientes."
          />
          <Reveal delay={120} className="flex flex-col justify-center rounded-3xl bg-surface p-8">
            <CheckList items={includes} columns={1} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="sparkles" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            Una marca improvisada puede hacerte perder clientes.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Si tu logo, colores y comunicación no se ven profesionales, muchas
            personas pueden desconfiar antes de hablar contigo. El branding
            ayuda a que tu negocio se perciba más serio, más claro y más
            preparado para competir.
          </p>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          align="center"
          title="Resolvemos tus dudas sobre branding"
          className="mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      <CTASection
        title="Construyamos una marca que genere confianza."
        whatsappMessage="Hola, quiero cotizar un proyecto de branding."
      />
    </>
  );
}
