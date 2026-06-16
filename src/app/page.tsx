import { HomeHero } from '@/components/home/HomeHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/blocks/ServiceCard';
import { CaseCard } from '@/components/blocks/CaseCard';
import { LogoMarquee } from '@/components/blocks/LogoMarquee';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { services, caseStudies, site, whatsappLink } from '@/lib/site';

const solutions: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'sparkles',
    title: 'Marca profesional',
    text: 'Branding, diseño visual y comunicación clara para verte confiable.',
  },
  {
    icon: 'globe',
    title: 'Presencia digital',
    text: 'Website, Google Business Profile, landing pages y SEO básico.',
  },
  {
    icon: 'target',
    title: 'Generación de clientes',
    text: 'Redes sociales, Meta Ads, Google Ads y contenido estratégico.',
  },
  {
    icon: 'bot',
    title: 'Automatización comercial',
    text: 'WhatsApp, CRM, agentes IA, workflows y seguimiento automático.',
  },
];

const problems = [
  'Redes sociales sin estrategia',
  'Website desactualizado o inexistente',
  'Campañas mal configuradas',
  'Leads que escriben y nadie responde a tiempo',
  'Marca poco profesional',
  'Dependencia total de referidos',
];

const whyCluster = [
  'Comunicación cercana y real',
  'Experiencia con negocios hispanos',
  'Servicios integrados',
  'Enfoque en generación de clientes',
  'Automatización comercial',
  'Atendemos negocios pequeños, medianos y empresas en crecimiento',
];

const packageIncludes = [
  'Website profesional',
  'Landing page',
  'Perfil de Google Business',
  'Certificado SSL',
  '1 campaña de Google Ads',
  'Guía para generar clientes online',
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* Prueba social — marquee */}
      <div className="border-y border-white/10 bg-ink-950 py-12">
        <div className="container-x">
          <p className="mono-label mb-8 text-center text-paper/40">
            Negocios que ya confiaron en Cluster Media
          </p>
          <LogoMarquee />
        </div>
      </div>

      {/* Problema */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="El problema"
            title={
              <>
                Tu negocio puede ser bueno, pero si no se ve profesional en
                internet, estás{' '}
                <span className="text-brand">perdiendo clientes</span>.
              </>
            }
            description="Muchos negocios hispanos siguen dependiendo solo de referidos, publicaciones improvisadas o respuestas manuales por WhatsApp. El problema no es la falta de esfuerzo: es no tener un sistema digital que genere confianza, atraiga clientes y dé seguimiento."
          />
          <Reveal delay={120} className="flex flex-col justify-center">
            <div className="rounded-3xl bg-white/[0.05] p-8">
              <h3 className="font-display text-lg font-semibold text-paper">
                Señales de que estás perdiendo oportunidades:
              </h3>
              <ul className="mt-5 space-y-3.5">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/15 text-red-400">
                      <Icon name="close" size={12} strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] text-paper/70">{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                href={whatsappLink('Quiero mejorar mi presencia digital.')}
                external
                variant="ghost"
                className="mt-7 w-full"
                iconRight="arrow-right"
              >
                Quiero mejorar mi presencia digital
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Solución */}
      <Section tone="dark">
        <SectionHeading
          eyebrow="La solución Cluster"
          tone="light"
          align="center"
          title="Contenido, campañas y automatización trabajando juntos."
          description="No vemos el marketing como piezas aisladas. Diseñamos un ecosistema donde tu marca se ve mejor, tus campañas atraen más prospectos y tus automatizaciones ayudan a responder y dar seguimiento."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 70}
              className="group rounded-3xl bg-white/[0.06] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/[0.07]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/20 text-brand-300 transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon name={s.icon} size={24} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                {s.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Servicios */}
      <Section tone="soft">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Servicios"
            title="Servicios diseñados para hacer crecer tu negocio."
            description="Desde branding y websites hasta campañas, contenido y automatizaciones con IA."
          />
          <Button href="/servicios" variant="ghost" iconRight="arrow-right">
            Ver todos los servicios
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </Section>

      {/* Paquete Digital Inicial destacado */}
      <Section tone="light">
        <Reveal className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-glow">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Icon name="rocket" size={14} /> Oferta de lanzamiento
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Tu negocio listo para vender en internet por USD 590.
              </h2>
              <p className="mt-4 max-w-md text-lg text-white/80">
                Un paquete pensado para negocios que necesitan una presencia
                digital profesional sin pagar miles de dólares desde el inicio.
              </p>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-xl text-white/50 line-through">
                  USD 870
                </span>
                <span className="font-display text-4xl font-bold">USD 590</span>
                <span className="pb-1.5 text-sm text-white/70">pago único</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  href="/paquete-inicial-digital"
                  variant="white"
                  size="lg"
                  iconRight="arrow-right"
                >
                  Ver detalles del paquete
                </Button>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-7 backdrop-blur-sm">
              <h3 className="font-display text-lg font-semibold">Incluye:</h3>
              <CheckList
                items={packageIncludes}
                tone="light"
                className="mt-4"
              />
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Casos de éxito */}
      <Section tone="soft">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Casos de éxito"
            title="Resultados reales para negocios reales."
            description="Algunos negocios que confiaron en Cluster Media para crecer."
          />
          <Button href="/casos-de-exito" variant="ghost" iconRight="arrow-right">
            Ver todos los casos
          </Button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {caseStudies.map((study, i) => (
            <CaseCard key={study.slug} study={study} index={i} />
          ))}
        </div>
      </Section>

      {/* Por qué Cluster */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Por qué Cluster"
              title="No somos solo una agencia de redes sociales."
              description="Somos un equipo que entiende estrategia, contenido, campañas, websites, automatización y ventas. Nuestro enfoque es ayudar a negocios hispanos a competir mejor en mercados cada vez más digitales."
            />
            <div className="mt-8">
              <Button href="/sobre-cluster" iconRight="arrow-right">
                Conoce a Cluster Media
              </Button>
            </div>
          </div>
          <Reveal delay={120} className="flex flex-col justify-center">
            <CheckList items={whyCluster} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <CTASection whatsappMessage="Hola, quiero hacer crecer mi negocio con Cluster Media." />
    </>
  );
}
