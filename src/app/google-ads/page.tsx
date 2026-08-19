import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { GoogleAdsHeroGraphic } from '@/components/google-ads/GoogleAdsHeroGraphic';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList, PillList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Gestión de Google Ads para negocios hispanos',
  description:
    'Gestionamos campañas mensuales de Google Ads para negocios hispanos que quieren aparecer cuando sus clientes buscan servicios en internet.',
  alternates: { canonical: '/google-ads' },
};

const forWhom = [
  'Construcción',
  'Roofing',
  'Limpieza',
  'Restaurantes',
  'Clínicas',
  'Abogados',
  'Servicios profesionales',
  'Tiendas',
  'Negocios locales',
];

const includes = [
  'Revisión inicial de cuenta',
  'Configuración o ajuste de campañas',
  'Selección de palabras clave',
  'Estructura de anuncios',
  'Segmentación geográfica',
  'Optimización mensual',
  'Reporte básico de desempeño',
];

const faqs = [
  {
    q: '¿La inversión publicitaria está incluida en el precio?',
    a: 'No. El precio desde USD 150/mes corresponde a la gestión profesional de tus campañas. La inversión publicitaria (lo que pagas a Google) se define según tu presupuesto y objetivos.',
  },
  {
    q: '¿Por qué Google Ads se paga mes a mes?',
    a: 'Porque no es algo que se configura una sola vez. Cada mes revisamos datos, ajustamos anuncios y optimizamos presupuesto para mejorar resultados y ventas.',
  },
  {
    q: '¿Cuánto debo invertir en pauta?',
    a: 'Depende de tu industria y zona. En la llamada de diagnóstico revisamos tu mercado y te recomendamos un presupuesto realista para empezar a generar prospectos.',
  },
];

export default function GoogleAdsPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Gestión de Google Ads',
          description: metadata.description as string,
          url: `${site.url}/google-ads`,
          price: '150',
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Google Ads', url: `${site.url}/google-ads` },
        ])}
      />

      <PageHero
        visual={<GoogleAdsHeroGraphic />}
        eyebrow="Google Ads / Performance"
        title="Aparece cuando tus clientes ya están buscando tus servicios."
        subtitle="Gestionamos campañas de Google Ads para negocios que quieren vender más con búsquedas reales."
        price={{
          now: 'Desde USD 150/mes',
          note: 'inversión no incluida',
        }}
        whatsappMessage="Hola, quiero información sobre Google Ads para mi negocio."
      />

      <div className="border-y border-line bg-ink-850 py-6 text-center text-white">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span className="text-white/60">
            <strong className="text-accent">Desde USD 150/mes</strong> ·
            gestión
          </span>
          <span className="text-white/60">
            Compromiso sugerido: <strong className="text-white">6 meses</strong>
          </span>
          <span className="text-white/60">
            Inversión publicitaria <strong className="text-white">no incluida</strong>
          </span>
        </div>
      </div>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Qué incluye"
            title="Gestión activa de Ads, mes a mes."
            description="Tu mercado cambia todo el tiempo. Por eso optimizamos cada mes para bajar costos y aumentar contactos de calidad."
          />
          <Reveal delay={120} className="rounded-3xl bg-surface p-8">
            <CheckList items={includes} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="Para quién es"
          title="Ideal para negocios de servicios con búsquedas activas."
          description="Si tus clientes te buscan en Google, ahí debes aparecer."
          className="mb-10"
        />
        <PillList items={forWhom} />
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="search" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            Google Ads funciona cuando se optimiza constantemente.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            En Google apareces frente a personas que ya buscan un servicio como
            el tuyo. Al trabajarlo mes a mes, afinamos palabras clave, anuncios
            y presupuesto para generar más oportunidades de venta.
          </p>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          align="center"
          title="Todo sobre nuestras campañas de Google Ads"
          className="mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      <CTASection
        title="Empieza a aparecer en Google."
        whatsappMessage="Hola, quiero empezar campañas de Google Ads."
      />
    </>
  );
}
