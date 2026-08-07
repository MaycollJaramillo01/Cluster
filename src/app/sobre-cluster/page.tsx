import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { TeamCarousel } from '@/components/home/TeamCarousel';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sobre Cluster Media | Agencia digital para negocios hispanos',
  description:
    'Conoce a Cluster Media: branding, websites, campañas, redes, automatización e IA para hacer crecer negocios.',
  alternates: { canonical: '/sobre-cluster' },
};

const beliefs = [
  'Una marca clara es la base: si no se entiende quién eres, cuesta vender.',
  'El website y el SEO deben convertir atención en oportunidades reales.',
  'Las campañas rinden más cuando hay oferta, medición y seguimiento.',
  'El contenido acerca; la automatización responde a tiempo y no pierde leads.',
  'La tecnología (CRM, WhatsApp, IA) debe ordenar y vender mejor, no complicar.',
  'Todo el ecosistema digital debe trabajar junto, no en piezas sueltas.',
];

const values: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'shield',
    title: 'Marca con autoridad',
    text: 'Branding, identidad y posicionamiento para que tu negocio se vea profesional y genere confianza.',
  },
  {
    icon: 'target',
    title: 'Crecimiento medible',
    text: 'Campañas, redes y performance orientados a leads, ventas y resultados que se puedan seguir.',
  },
  {
    icon: 'bolt',
    title: 'Sistemas que responden',
    text: 'Websites, CRM, automatizaciones e IA para captar, atender y dar seguimiento sin perder oportunidades.',
  },
];

const capabilities: {
  icon: IconName;
  title: string;
  text: string;
  href: string;
}[] = [
  {
    icon: 'sparkles',
    title: 'Branding',
    text: 'Identidad visual, manual de marca y posicionamiento.',
    href: '/branding',
  },
  {
    icon: 'globe',
    title: 'Websites / SEO',
    text: 'Sitios y landings pensados para convertir y posicionar.',
    href: '/websites-seo',
  },
  {
    icon: 'megaphone',
    title: 'Redes y contenido',
    text: 'Estrategia y piezas para conectar con tu audiencia.',
    href: '/redes-sociales',
  },
  {
    icon: 'target',
    title: 'Google Ads',
    text: 'Campañas de performance cuando tu cliente ya busca.',
    href: '/google-ads',
  },
  {
    icon: 'bolt',
    title: 'IA / Automatizaciones',
    text: 'WhatsApp, CRM y workflows para no perder leads.',
    href: '/automatizaciones-ia',
  },
  {
    icon: 'search',
    title: 'SEO Audit',
    text: 'Diagnóstico para saber qué frena tu website.',
    href: '/seo-audit',
  },
];

export default function SobrePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Sobre Cluster', url: `${site.url}/sobre-cluster` },
        ])}
      />

      <PageHero
        image={{
          src: '/assets/stock/team.jpg',
          alt: 'Equipo de Cluster Media',
          // Foto horizontal del equipo: ratio amplio para que se vean los tres
          aspectClassName: 'aspect-[3/2]',
          imageClassName: 'object-cover object-center grayscale',
        }}
        eyebrow="Sobre Cluster"
        title="Somos Cluster: la agencia digital que hace crecer tu negocio."
        subtitle="Integramos marca, website, campañas, redes y automatización para que tu negocio conecte, convierta y escale."
        whatsappMessage="Hola, quiero conocer más sobre Cluster Media."
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Un solo sistema"
            title="No vendemos piezas sueltas. Construimos un ecosistema."
            description="Branding, presencia digital, generación de clientes y automatización comercial trabajando juntos: para que tu marca se vea bien, atraiga prospectos y les dé seguimiento a tiempo."
          />
        </div>
      </Section>

      <Section tone="soft">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal
              key={v.title}
              delay={i * 80}
              className="card-dark p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-accent">
                <Icon name={v.icon} size={24} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {v.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {v.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          tone="light"
          eyebrow="Qué hacemos"
          title="Servicios para cada etapa de tu crecimiento."
          description="Desde la identidad de marca hasta campañas, websites y sistemas con IA: todo bajo un mismo equipo."
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <Link
                href={c.href}
                className="group flex h-full flex-col bg-surface p-7 transition-colors duration-300 hover:bg-surface-2"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                  <Icon name={c.icon} size={22} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                  {c.title}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
                  {c.text}
                </p>
                <span className="mono-label mt-5 inline-flex items-center gap-2 text-accent">
                  Ver servicio
                  <Icon name="arrow-right" size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="Qué creemos"
            title="El crecimiento exige marca, sistema y seguimiento."
            description="No creemos en marketing aislado. Construimos presencia digital con estrategia: para atraer, convertir y responder antes de que el lead se enfríe."
          />
          <Reveal delay={120} className="flex items-center">
            <CheckList items={beliefs} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Equipo"
            title="Un equipo para construir algo grande con tu marca."
            description="Estrategia, diseño, websites, SEO, campañas, redes, CRM, automatización e IA trabajando juntos para que tu negocio conecte mejor y crezca."
          />
        </div>
        <Reveal delay={120}>
          <TeamCarousel />
        </Reveal>
      </Section>

      <CTASection
        title="Hagamos crecer tu negocio juntos."
        whatsappMessage="Hola, quiero trabajar con Cluster Media."
      />
    </>
  );
}
