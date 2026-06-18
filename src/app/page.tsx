import Link from 'next/link';
import { HomeHero } from '@/components/home/HomeHero';
import { SolutionCard, type SolutionVideo } from '@/components/home/SolutionCard';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ServicesBento } from '@/components/home/ServicesBento';
import { EcosystemDiagram } from '@/components/home/EcosystemDiagram';
import { PricingPlans } from '@/components/home/PricingPlans';
import { CaseCard } from '@/components/blocks/CaseCard';
import { LogoWall } from '@/components/blocks/LogoWall';
import { LeadQuiz } from '@/components/forms/LeadQuiz';
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

      {/* Ecosistema — un solo sistema (cierre) */}
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

      {/* Planes */}
      <Section tone="light">
        <SectionHeading
          align="center"
          eyebrow="Planes"
          title="Elegí el plan para vos."
          description="Desde tu primera presencia digital hasta un sistema de crecimiento mensual. Empieza donde estás y escala cuando lo necesites."
        />
        <PricingPlans />
        <Reveal className="mt-12 text-center">
          <Link
            href="#diagnostico"
            className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent"
          >
            <span className="link-underline">
              ¿No sabes cuál elegir? Hacé el diagnóstico
            </span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </Reveal>
      </Section>

      {/* Diagnóstico — cierre de conversión con quiz */}
      <section
        id="diagnostico"
        className="theme-dark relative overflow-hidden bg-ink-950 py-24 text-fg sm:py-32"
      >
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-40 top-1/2 h-[44rem] w-[44rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(2,195,154,0.16),transparent_70%)] blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-25 [mask-image:radial-gradient(55%_55%_at_50%_50%,black,transparent)]"
          aria-hidden="true"
        />

        <div className="container-x relative z-[1] grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="mono-label inline-flex items-center gap-3 text-accent">
              <span className="inline-block h-px w-8 bg-accent" />
              Diagnóstico gratis
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-fg sm:text-5xl lg:text-6xl">
              ¿Listo para hacer crecer tu negocio?
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Respondé 3 preguntas y te enviamos una recomendación real, sin
              compromiso — el plan ideal para tu etapa y tu mayor desafío digital.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={site.calendarUrl} external size="lg" iconRight="arrow-right">
                Agendar llamada
              </Button>
              <Button
                href={whatsappLink('Hola, quiero hacer crecer mi negocio con Cluster Media.')}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
              >
                WhatsApp
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <LeadQuiz />
          </Reveal>
        </div>
      </section>
    </>
  );
}
