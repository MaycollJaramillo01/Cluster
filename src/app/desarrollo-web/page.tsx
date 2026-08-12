import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { WebsitePlansCarousel } from '@/components/home/WebsitePlansCarousel';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';
import {
  websitePlans,
  websitePlansBasic,
  websitePlansComplete,
  websitePlanBenefits,
  websitePlanFaqs,
} from '@/lib/website-plans';

export const metadata: Metadata = {
  title: 'Desarrollo y mantenimiento web | Soluciones integrales Cluster Media',
  description:
    'Desarrollo, mantenimiento, acompañamiento y crecimiento web: planes básicos y completos con SEO, leads y monetización de punta a punta.',
  alternates: { canonical: '/desarrollo-web' },
};

const journey = [
  { n: '01', title: 'Crear', text: 'Website profesional listo para representar tu negocio.' },
  { n: '02', title: 'Mantener', text: 'Hosting, SSL, backups y monitoreo continuo.' },
  { n: '03', title: 'Crecer', text: 'SEO y leads para atraer demanda real.' },
  { n: '04', title: 'Monetizar', text: 'Acompañamiento para convertir visitas en clientes.' },
];

export default function DesarrolloWebPage() {
  return (
    <div className="theme-desarrollo-web">
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
          imageClassName:
            'object-cover object-center grayscale-[0.35] transition duration-700 hover:grayscale-0',
        }}
        eyebrow="Desarrollo y mantenimiento web"
        title={
          <>
            Soluciones integrales para crear, mantener y{' '}
            <span className="text-accent">monetizar</span> tu website.
          </>
        }
        subtitle="Acompañamiento de punta a punta: desarrollo, mantenimiento continuo y crecimiento con SEO y leads, para que tu web no solo exista, sino que genere resultados."
        whatsappMessage="Hola, quiero información sobre soluciones integrales de desarrollo y mantenimiento web."
      />

      <Section tone="light">
        <SectionHeading
          align="center"
          eyebrow="Valor agregado"
          title={
            <>
              Mantenimiento, acompañamiento y{' '}
              <span className="text-accent">crecimiento</span>.
            </>
          }
          description="No entregamos una web y desaparecemos. Operamos contigo: cuidamos la plataforma, te guiamos y activamos canales para atraer y convertir clientes."
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {websitePlanBenefits.map((b, i) => (
            <Reveal
              key={b.title}
              delay={i * 60}
              className="group border border-ink-950/10 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:rgba(2,195,154,0.35)] hover:shadow-[0_20px_40px_-24px_rgba(2,195,154,0.45)]"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center transition-transform duration-300 group-hover:scale-105 web-accent-${i}`}
              >
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

      <Section tone="dark">
        <div className="web-glow pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full blur-[90px]" />
        <div className="web-glow pointer-events-none absolute -left-8 bottom-8 h-52 w-52 rounded-full blur-[80px] opacity-70" />
        <div className="relative mx-auto max-w-5xl">
          <SectionHeading
            tone="light"
            align="center"
            eyebrow="De punta a punta"
            title={
              <>
                Tu web trabajando por el negocio,{' '}
                <span className="text-accent">no solo como vitrina</span>.
              </>
            }
            description="Desde la publicación hasta la monetización: presencia profesional, operación estable y estrategias de crecimiento integradas en un solo acompañamiento."
            className="mb-12"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((step, i) => (
              <Reveal
                key={step.n}
                delay={i * 70}
                className="web-panel relative overflow-hidden p-6"
              >
                <span className="mono-label text-accent">{step.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold uppercase text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal
            delay={120}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="#planes" size="lg" iconRight="arrow-right">
              Ver planes
            </Button>
            <Button
              href={whatsappLink(
                'Hola, quiero acompañamiento integral para monetizar mi website.'
              )}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              WhatsApp
            </Button>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft" id="planes">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Planes"
            title={
              <>
                Elige el nivel según tu{' '}
                <span className="text-accent">etapa</span>.
              </>
            }
            description="Separados en básicos (presencia y mantenimiento) y completos (crecimiento con SEO y leads). Mismo acompañamiento; distinto alcance."
          />
          <Reveal
            delay={100}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="#faq" size="lg" variant="ghost" iconRight="arrow-right">
              Ver preguntas frecuentes
            </Button>
            <Button
              href={whatsappLink(
                'Hola, quiero ayuda para elegir entre planes básicos y completos de website.'
              )}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              WhatsApp
            </Button>
          </Reveal>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#planes-basicos"
              className="mono-label inline-flex items-center gap-2 border border-[color:rgba(2,195,154,0.35)] bg-[color:rgba(2,195,154,0.1)] px-4 py-2 text-accent transition-colors hover:bg-[color:rgba(2,195,154,0.18)]"
            >
              Básicos
            </a>
            <a
              href="#planes-completos"
              className="mono-label inline-flex items-center gap-2 border border-[color:rgba(56,189,248,0.4)] bg-[color:rgba(56,189,248,0.12)] px-4 py-2 text-[color:#0284c7] transition-colors hover:bg-[color:rgba(56,189,248,0.2)]"
            >
              Completos
            </a>
          </div>
        </div>
      </Section>

      <Section tone="dark" id="planes-basicos">
        <div className="web-glow pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full blur-[100px] opacity-60" />
        <SectionHeading
          tone="light"
          eyebrow="Planes básicos"
          title={
            <>
              Presencia web +{' '}
              <span className="text-accent">mantenimiento</span>.
            </>
          }
          description="Ideal para arrancar o estabilizar: website profesional, hosting y acompañamiento operativo."
          className="mb-10"
        />
        <WebsitePlansCarousel plans={websitePlansBasic} />
      </Section>

      <Section tone="brand" id="planes-completos">
        <div className="web-glow pointer-events-none absolute right-10 top-16 h-64 w-64 rounded-full blur-[100px]" />
        <SectionHeading
          tone="light"
          eyebrow="Planes completos"
          title={
            <>
              Crecimiento y{' '}
              <span className="text-accent">monetización</span>.
            </>
          }
          description="Para negocios listos a atraer demanda: SEO, Google Ads y seguimiento, sobre una web administrada."
          className="mb-10"
        />
        <WebsitePlansCarousel plans={websitePlansComplete} />
      </Section>

      <Section tone="light" id="faq">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title={
                <>
                  SEO, valor agregado y cómo{' '}
                  <span className="text-accent">elegir</span>.
                </>
              }
              description="Resolvemos dudas sobre acompañamiento, planes básicos vs completos, SEO y monetización de tu website."
            />
            <div className="web-stat mt-8 p-5">
              <p className="font-display text-lg font-semibold uppercase text-ink-950">
                Tip rápido
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Si necesitas presencia estable, empieza por un plan básico. Si
                ya quieres demanda activa, ve a un plan completo con SEO o
                leads.
              </p>
            </div>
          </div>
          <FAQ items={websitePlanFaqs} />
        </div>
      </Section>

      <CTASection
        title="Hablemos de tu website y cómo monetizarlo."
        text="Agenda una llamada o escríbenos: te ayudamos a elegir entre un plan básico de mantenimiento o una solución completa de crecimiento."
        whatsappMessage="Hola, quiero asesoría para una solución integral de desarrollo, mantenimiento y crecimiento web."
      />
    </div>
  );
}
