import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import {
  IncludeGrid,
  PillList,
  ProcessSteps,
  type IncludeItem,
  type Step,
} from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Paquete Digital Inicial | Website + Google por USD 590',
  description:
    'Lanza la presencia digital de tu negocio con website profesional, landing page, perfil de Google, SSL, campaña de Google Ads y guía para generar clientes por USD 590.',
  alternates: { canonical: '/paquete-inicial-digital' },
};

const includes: IncludeItem[] = [
  {
    icon: 'globe',
    title: 'Website profesional',
    text: 'Una página clara, moderna y enfocada en presentar tu negocio.',
  },
  {
    icon: 'target',
    title: 'Landing page',
    text: 'Una página enfocada en captar prospectos o dirigir una campaña.',
  },
  {
    icon: 'pin',
    title: 'Perfil de Google Business',
    text: 'Para que tu negocio tenga presencia en Google y Maps.',
  },
  {
    icon: 'shield',
    title: 'Certificado SSL',
    text: 'Seguridad básica para que tu sitio se vea confiable.',
  },
  {
    icon: 'bolt',
    title: '1 campaña de Google Ads',
    text: 'Configuración inicial para comenzar a atraer prospectos.',
  },
  {
    icon: 'pen',
    title: 'Guía para generar clientes',
    text: 'Recomendaciones prácticas para usar tu presencia digital de forma comercial.',
  },
];

const forWhom = [
  'Empresas de servicios',
  'Construcción',
  'Restaurantes',
  'Tiendas',
  'Clínicas',
  'Profesionales independientes',
  'Negocios familiares',
  'Negocios que dependen de referidos',
];

const steps: Step[] = [
  {
    title: 'Agendas una llamada',
    text: 'Entendemos tu negocio y confirmamos si el paquete aplica para ti.',
  },
  {
    title: 'Recibimos tu información',
    text: 'Logo, textos, fotos, servicios, ubicación y datos principales.',
  },
  {
    title: 'Creamos tu presencia',
    text: 'Website, landing, perfil de Google y campaña inicial.',
  },
  {
    title: 'Lanzamos y te guiamos',
    text: 'Dejamos la base lista y te explicamos cómo usarla para generar oportunidades.',
  },
];

const faqs = [
  {
    q: '¿El precio incluye la inversión publicitaria de Google Ads?',
    a: 'No. El paquete incluye la configuración inicial de una campaña. La inversión publicitaria (lo que pagas a Google) no está incluida en el precio del paquete.',
  },
  {
    q: '¿Qué necesito proporcionar?',
    a: 'El cliente debe proporcionar logo, textos, fotografías, información del negocio y los accesos necesarios. Mientras más completo sea el material, más rápido entregamos.',
  },
  {
    q: '¿Es un pago único?',
    a: 'Sí, el Paquete Digital Inicial es un pago único de USD 590. El hosting, dominio y servicios recurrentes se definen según las condiciones acordadas.',
  },
  {
    q: '¿Cuánto tarda la entrega?',
    a: 'El tiempo de entrega estimado depende de qué tan completo esté tu material. Una vez recibimos todo, avanzamos con la creación de tu presencia digital.',
  },
];

export default function PaquetePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Paquete Digital Inicial',
          description: metadata.description as string,
          brand: { '@type': 'Brand', name: site.name },
          offers: {
            '@type': 'Offer',
            price: '590',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${site.url}/paquete-inicial-digital`,
          },
        }}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          {
            name: 'Paquete Digital Inicial',
            url: `${site.url}/paquete-inicial-digital`,
          },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/office.jpg", alt: "Negocio hispano listo para vender en internet" }}
        eyebrow="Paquete Digital Inicial"
        title="Tu negocio listo para vender en internet por USD 590."
        subtitle="Creamos la base digital que tu negocio necesita para verse profesional, aparecer en Google y empezar a recibir clientes online."
        price={{ before: 'USD 870', now: 'USD 590', note: 'pago único' }}
        whatsappMessage="Hola, quiero información sobre el Paquete Digital Inicial de USD 590."
      />

      <Section tone="light">
        <SectionHeading
          eyebrow="Qué incluye"
          align="center"
          title="Todo lo básico para comenzar con una presencia digital profesional."
          className="mb-14"
        />
        <IncludeGrid items={includes} />
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            tone="light"
            eyebrow="Para quién es"
            title="Ideal para negocios que quieren dejar de verse improvisados."
            description="Este paquete es perfecto para negocios hispanos que necesitan formalizar su presencia digital, aparecer mejor en internet y tener una base profesional para empezar a captar clientes."
          />
          <Reveal delay={120} className="flex items-center">
            <PillList items={forWhom} />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="El problema"
            title="Si tu negocio no aparece bien en internet, muchos clientes ni siquiera te consideran."
            description="Hoy las personas buscan en Google, revisan redes, comparan opciones y deciden rápido. Si tu negocio no tiene una presencia profesional, puedes estar perdiendo oportunidades aunque tu servicio sea bueno."
          />
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Cómo trabajamos"
          align="center"
          title="Cómo trabajamos tu paquete"
          className="mb-14"
        />
        <ProcessSteps steps={steps} />
      </Section>

      {/* Condiciones importantes */}
      <Section tone="soft">
        <Reveal className="mx-auto max-w-3xl rounded-3xl bg-surface p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
              <Icon name="shield" size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                Información importante
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                El paquete incluye una estructura digital inicial. El cliente
                debe proporcionar logo, textos, fotografías, información del
                negocio y accesos necesarios. La inversión publicitaria de
                Google Ads no está incluida en el precio del paquete.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-faint">
                <li>· Pago único de USD 590.</li>
                <li>· Tiempo de entrega estimado según materiales.</li>
                <li>· Cambios limitados según política interna.</li>
                <li>· Hosting/dominio según condiciones acordadas.</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          align="center"
          title="Resolvemos tus dudas sobre el paquete"
          className="mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      <CTASection
        title="Empieza con una presencia digital profesional."
        text="Agenda una llamada y te ayudamos a lanzar la base digital de tu negocio por USD 590."
        whatsappMessage="Hola, quiero contratar el Paquete Digital Inicial."
      />
    </>
  );
}
