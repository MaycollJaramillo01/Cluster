import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { WebsitePlansCarousel } from '@/components/home/WebsitePlansCarousel';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';
import {
  websitePlans,
  websitePlanBenefits,
  websitePlanFaqs,
} from '@/lib/website-plans';

export const metadata: Metadata = {
  title: 'Desarrollo y mantenimiento web | Planes Website Cluster Media',
  description:
    'Planes mensuales de website, mantenimiento, SEO y generación de leads: desde USD 99/mes hasta Website + SEO + Leads por USD 499/mes.',
  alternates: { canonical: '/desarrollo-web' },
};

export default function DesarrolloWebPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Desarrollo y mantenimiento web',
          description: metadata.description as string,
          url: `${site.url}/desarrollo-web`,
        })}
      />
      <JsonLd data={faqSchema(websitePlanFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Desarrollo web', url: `${site.url}/desarrollo-web` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Planes de desarrollo y mantenimiento web',
          itemListElement: websitePlans.map((plan, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: plan.nameAccent
                ? `${plan.name} ${plan.nameAccent}`
                : plan.name,
              description: plan.tagline,
              offers: {
                '@type': 'Offer',
                price: String(plan.price),
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: `${site.url}/desarrollo-web#${plan.slug}`,
              },
            },
          })),
        }}
      />

      <PageHero
        image={{
          src: '/assets/stock/laptop.jpg',
          alt: 'Desarrollo y mantenimiento web Cluster Media',
          aspectClassName: 'aspect-[4/3]',
          imageClassName: 'object-cover object-center grayscale',
        }}
        eyebrow="Desarrollo y mantenimiento web"
        title="Tu website profesional, activo y listo para generar clientes."
        subtitle="Planes mensuales claros: desde presencia web hasta SEO y leads. Desarrollo, hosting, mantenimiento y crecimiento en un solo sistema."
        whatsappMessage="Hola, quiero información sobre los planes de desarrollo y mantenimiento web."
      />

      <Section tone="light">
        <SectionHeading
          align="center"
          eyebrow="Qué incluye el ecosistema"
          title="Web, mantenimiento, SEO y leads."
          description="Elige el nivel según tu etapa: presencia digital, operación sin preocupaciones, o crecimiento con tráfico y oportunidades."
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {websitePlanBenefits.map((b, i) => (
            <Reveal
              key={b.title}
              delay={i * 60}
              className="border border-ink-950/10 bg-paper p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-ink-950 text-accent">
                <Icon name={b.icon} size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold uppercase text-ink-950">
                {b.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">
                {b.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark" id="planes">
        <SectionHeading
          tone="light"
          align="center"
          eyebrow="Planes"
          title="Elige cómo quieres que trabaje tu website."
          description="Cinco niveles mensuales. Empieza simple o suma SEO y generación de leads cuando tu negocio lo necesite."
          className="mb-10"
        />
        <WebsitePlansCarousel />
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Antes de elegir tu plan."
            description="Resolvemos las dudas más comunes sobre dominio, Ads y cómo subir de nivel."
          />
          <FAQ items={websitePlanFaqs} />
        </div>
      </Section>

      <CTASection
        title="Hablemos de tu website y el plan ideal."
        whatsappMessage="Hola, quiero asesoría para elegir un plan de desarrollo y mantenimiento web."
      />
    </>
  );
}
