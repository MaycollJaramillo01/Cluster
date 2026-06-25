import Link from 'next/link';
import { HomeHero } from '@/components/home/HomeHero';
import { SolutionCard, type SolutionVideo } from '@/components/home/SolutionCard';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
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
      webm: '/assets/videos/services/marca-profesional.webm',
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
      webm: '/assets/videos/services/generacion-clientes.webm',
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

const problems: { title: string; text: string; icon: IconName }[] = [
  {
    title: 'Redes sin dirección',
    text: 'Publicas contenido, pero no hay una ruta clara para convertir atención en oportunidades reales.',
    icon: 'megaphone',
  },
  {
    title: 'Website que no convence',
    text: 'Tu presencia digital no explica rápido qué haces, por qué confiar y cuál es el siguiente paso.',
    icon: 'globe',
  },
  {
    title: 'Campañas sin control',
    text: 'Los anuncios se activan sin estructura de oferta, medición y seguimiento comercial.',
    icon: 'target',
  },
  {
    title: 'Leads que se enfrían',
    text: 'Cuando alguien escribe y no recibe respuesta a tiempo, la confianza baja y el cliente se va.',
    icon: 'bolt',
  },
  {
    title: 'Marca que no transmite valor',
    text: 'El negocio puede ser bueno, pero si se ve improvisado, compite por precio en vez de autoridad.',
    icon: 'shield',
  },
  {
    title: 'Dependencia de referidos',
    text: 'Sin un sistema digital, el crecimiento depende demasiado de suerte, recomendaciones y temporadas.',
    icon: 'users',
  },
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
      <Section tone="light" className="paper-grain py-16 sm:py-18 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-12">
          <Reveal>
            <span className="mono-label inline-flex items-center gap-3 text-accent">
              <span className="h-px w-8 bg-accent" />
              El problema
            </span>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold uppercase leading-[0.98] text-ink-950 sm:text-4xl lg:text-5xl">
              No necesitas hacer más ruido. Necesitas convertir mejor.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-700 sm:text-lg">
              El negocio puede ser bueno y aun así perder clientes si la marca,
              el website, las campañas y las respuestas trabajan por separado.
            </p>
            <div className="mt-6 border-l-2 border-accent pl-4">
              <p className="font-display text-lg font-semibold uppercase leading-tight text-ink-950">
                El problema no es la falta de esfuerzo.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-[15px]">
                Es no tener una presencia digital que genere confianza, capture
                prospectos y les dé seguimiento antes de que se enfríen.
              </p>
            </div>
            <a
              href={whatsappLink('Quiero mejorar mi presencia digital.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-3 bg-ink-950 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-accent hover:text-ink-950"
            >
              Revisar mi sistema
              <Icon name="arrow-right" size={16} />
            </a>
          </Reveal>

          <Reveal delay={90}>
            <div>
              <div className="grid gap-2 bg-ink-950 px-4 py-4 text-white sm:grid-cols-[auto_1fr] sm:gap-4 sm:px-5">
                <span className="mono-label text-accent">Diagnóstico</span>
                <p className="text-sm leading-relaxed text-white/70">
                  Señales de que el marketing está trabajando, pero no está
                  empujando ventas con claridad.
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {problems.map((problem, i) => (
                  <article
                    key={problem.title}
                    className="group border border-ink-950/10 bg-paper px-4 py-4 transition-colors duration-300 hover:bg-paper-soft"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
                          i === 0
                            ? 'border-accent bg-accent text-ink-950'
                            : 'border-ink-950/15 bg-paper-soft text-ink-950'
                        }`}
                      >
                        <Icon name={problem.icon} size={18} />
                      </span>
                      <div className="min-w-0">
                        <span className="mono-label text-accent/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="mt-2 font-display text-lg font-semibold uppercase leading-tight text-ink-950">
                          {problem.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">
                          {problem.text}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
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
            description="Desde branding y websites hasta redes sociales, campañas, contenido y automatizaciones con IA."
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
      <Section id="planes" tone="light" className="paper-grain">
        <SectionHeading
          align="center"
          eyebrow="Planes"
          title="Planes claros. Ejecución mensual."
          description="Elige según la etapa de tu marca: contenido, campañas, asesoría, website y SEO cuando el sistema lo necesite."
          titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
        />
        <PricingPlans />
        <Reveal className="mt-12 text-center">
          <Link
            href="#diagnostico"
            className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent"
          >
            <span className="link-underline">
              ¿No sabes cuál elegir? Haz el diagnóstico
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
