import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { SocialHeroGraphic } from '@/components/redes-sociales/SocialHeroGraphic';
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
        visual={<SocialHeroGraphic />}
        eyebrow="Redes Sociales / Crecimiento"
        title="Redes sociales para negocios que quieren vender más."
        subtitle="Creamos contenido, campañas y estrategia mensual para que tu negocio se vea activo, profesional y venda más."
        whatsappMessage="Hola, quiero información sobre el manejo de redes sociales."
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="megaphone" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
            Más que publicar, se trata de convertir
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Muchas empresas publican sin un plan claro. Nosotros conectamos
            contenido y campañas con un objetivo simple: atraer clientes,
            generar confianza y convertir más.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Contenido', tint: 'bg-[color:rgba(2,195,154,0.12)] text-accent' },
              { label: 'Reels', tint: 'bg-[color:rgba(56,189,248,0.16)] text-[color:#0369a1]' },
              { label: 'Campañas', tint: 'bg-[color:rgba(236,72,153,0.14)] text-[color:#be185d]' },
              { label: 'Ventas', tint: 'bg-[color:rgba(234,179,8,0.16)] text-[color:#a16207]' },
            ].map((pill, i) => (
              <span
                key={pill.label}
                className={`mono-label rise-in px-3 py-1.5 ${pill.tint}`}
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft" id="paquetes">
        <SectionHeading
          eyebrow="Paquetes"
          align="center"
          title="Elige el plan que mejor se adapta a tu negocio."
          description="Todos incluyen contenido, campañas y estrategia. Tú eliges el nivel según tu etapa."
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
