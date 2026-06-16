import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { PricingCard } from '@/components/blocks/PricingCard';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { socialPlans, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Manejo de redes sociales para negocios hispanos',
  description:
    'Creamos contenido, reels, artes, campañas Meta y estrategias digitales para negocios hispanos que quieren crecer y conseguir más clientes.',
  alternates: { canonical: '/redes-sociales' },
};

export default function RedesSocialesPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Manejo de redes sociales',
          description: metadata.description as string,
          url: `${site.url}/redes-sociales`,
          price: '480',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Redes Sociales', url: `${site.url}/redes-sociales` },
        ])}
      />

      <PageHero
        image={{ src: "/assets/stock/social.jpg", alt: "Creación de contenido para redes sociales" }}
        eyebrow="Redes Sociales / Crecimiento"
        title="Redes sociales para negocios que quieren vender más, no solo publicar más."
        subtitle="Creamos contenido, campañas y estrategia mensual para que tu negocio se vea activo, profesional y genere más oportunidades."
        whatsappMessage="Hola, quiero información sobre el manejo de redes sociales."
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="megaphone" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
            Publicar no es una estrategia.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Muchas empresas publican en redes sin una dirección clara. Nosotros
            creamos contenido alineado a objetivos comerciales: atraer clientes,
            generar confianza y mantener tu negocio presente en la mente de tu
            audiencia.
          </p>
        </div>
      </Section>

      <Section tone="soft" id="paquetes">
        <SectionHeading
          eyebrow="Paquetes"
          align="center"
          title="Elige el plan que mejor se adapta a tu negocio."
          description="Todos incluyen contenido, campañas y estrategia. Crecen contigo a medida que tu negocio avanza."
          className="mb-16"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {socialPlans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <Reveal className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl bg-surface p-5 text-sm text-muted">
          <Icon name="shield" size={20} className="mt-0.5 flex-none text-accent" />
          <p>
            <strong className="text-fg">Importante:</strong> los precios no
            incluyen inversión publicitaria. La pauta se define según el
            presupuesto y objetivos de cada negocio.
          </p>
        </Reveal>
      </Section>

      <CTASection
        title="Convirtamos tus redes en un canal de clientes."
        whatsappMessage="Hola, quiero un plan de redes sociales para mi negocio."
      />
    </>
  );
}
