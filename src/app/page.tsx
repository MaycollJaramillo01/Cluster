import { HomeHero } from '@/components/home/HomeHero';
import { SolutionCard, type SolutionVideo } from '@/components/home/SolutionCard';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ServicesBento } from '@/components/home/ServicesBento';
import { EcosystemDiagram } from '@/components/home/EcosystemDiagram';
import { CaseCard } from '@/components/blocks/CaseCard';
import Image from 'next/image';
import { LogoWall } from '@/components/blocks/LogoWall';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { caseStudies, site, whatsappLink } from '@/lib/site';

const solutions: { title: string; text: string; video?: SolutionVideo }[] = [
  {
    title: 'Marca profesional',
    text: 'Branding, diseño visual y comunicación clara para verte confiable.',
    video: {
      mp4: '/assets/videos/services/marca-profesional.mp4',
      poster: '/assets/videos/services/marca-profesional-poster.jpg',
    },
  },
  {
    title: 'Presencia digital',
    text: 'Website, Google Business Profile, landing pages y SEO básico.',
    video: {
      mp4: '/assets/videos/services/presencia-digital.mp4',
      poster: '/assets/videos/services/presencia-digital-poster.jpg',
    },
  },
  {
    title: 'Generación de clientes',
    text: 'Redes sociales, Meta Ads, Google Ads y contenido estratégico.',
    video: {
      mp4: '/assets/videos/services/generacion-clientes.mp4',
      poster: '/assets/videos/services/generacion-clientes-poster.jpg',
    },
  },
  {
    title: 'Automatización comercial',
    text: 'WhatsApp, CRM, agentes IA, workflows y seguimiento automático.',
    video: {
      mp4: '/assets/videos/services/automatizacion.mp4',
      poster: '/assets/videos/services/automatizacion-poster.jpg',
    },
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


export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* Prueba social — muro de marcas */}
      <div className="border-y border-line bg-ink-950 py-14">
        <div className="container-x">
          <p className="mono-label mb-10 text-center text-faint">
            Marcas que confían en Cluster Media
          </p>
          <LogoWall />
        </div>
      </div>

      {/* Solución */}
      <Section tone="dark">
        <SectionHeading
          eyebrow="La solución Cluster"
          tone="light"
          title="Contenido, campañas y automatización trabajando juntos."
          description="No vemos el marketing como piezas aisladas. Diseñamos un ecosistema donde tu marca se ve mejor, tus campañas atraen más prospectos y tus automatizaciones ayudan a responder y dar seguimiento."
          titleClass="text-fg text-3xl sm:text-4xl lg:text-4xl xl:text-5xl"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s, i) => (
            <SolutionCard
              key={s.title}
              title={s.title}
              text={s.text}
              video={s.video}
              index={i}
            />
          ))}
        </div>
      </Section>

      {/* Enfoque — sección editorial con imagen real */}
      <Section tone="light">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/assets/stock/strategy2.jpg"
              alt="Equipo de Cluster Media trabajando en estrategia de marketing"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale transition duration-700 hover:grayscale-0"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent"
              aria-hidden="true"
            />
            <span className="mono-label absolute bottom-5 left-5 bg-ink-950/70 px-3 py-1.5 text-muted backdrop-blur-sm">
              Estrategia · Contenido · Performance
            </span>
          </Reveal>
          <SectionHeading
            eyebrow="Cómo trabajamos"
            title={
              <>
                Una agencia, un solo{' '}
                <span className="text-accent">sistema de crecimiento</span>.
              </>
            }
            description="No entregamos piezas sueltas. Conectamos marca, contenido, campañas, web y automatización en un mismo sistema que atrae, convierte y da seguimiento — para que cada acción de marketing empuje hacia el mismo objetivo: más clientes reales."
          />
        </div>
      </Section>

      {/* Ecosistema — un solo sistema */}
      <Section tone="brand">
        <SectionHeading
          align="center"
          eyebrow="El ecosistema Cluster"
          tone="light"
          title={
            <>
              Cuatro pilares, <span className="text-accent">un solo sistema</span>.
            </>
          }
          description="No entregamos piezas sueltas. Marca, contenido, campañas y automatización giran alrededor de un mismo núcleo que atrae, convierte y da seguimiento."
          titleClass="text-fg text-3xl sm:text-4xl lg:text-5xl"
        />
        <EcosystemDiagram />
      </Section>

      {/* Problema */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="El problema"
            title={
              <>
                Tu negocio puede ser bueno, pero si no se ve profesional en
                internet, estás{' '}
                <span className="text-accent">perdiendo clientes</span>.
              </>
            }
            description="Muchos negocios hispanos siguen dependiendo solo de referidos, publicaciones improvisadas o respuestas manuales por WhatsApp. El problema no es la falta de esfuerzo: es no tener un sistema digital que genere confianza, atraiga clientes y dé seguimiento."
          />
          <Reveal delay={120} className="flex flex-col justify-center">
            <p className="mono-label text-faint">Señales de alerta</p>
            <ul className="mt-7 border-t border-line">
              {problems.map((p, i) => (
                <li
                  key={p}
                  className="group flex items-baseline gap-6 border-b border-line py-4"
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-base font-medium uppercase tracking-tight text-muted transition-colors duration-300 group-hover:text-fg sm:text-lg">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={whatsappLink('Quiero mejorar mi presencia digital.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 self-start font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent"
            >
              <span className="link-underline">
                Quiero mejorar mi presencia digital
              </span>
              <Icon name="arrow-right" size={16} />
            </a>
          </Reveal>
        </div>
      </Section>

      {/* Servicios */}
      <Section tone="dark">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Servicios"
            tone="light"
            title="Servicios diseñados para hacer crecer tu negocio."
            description="Desde branding y websites hasta campañas, contenido y automatizaciones con IA."
          />
          <Button href="/servicios" variant="ghost" iconRight="arrow-right">
            Ver todos los servicios
          </Button>
        </div>
        <ServicesBento />
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
