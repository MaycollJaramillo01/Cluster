import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { site, whatsappLink } from '@/lib/site';

export function HomeHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-950">
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      >
        <source src="/assets/hero.webm" type="video/webm" />
        <source src="/assets/hero.mp4" type="video/mp4" />
      </video>

      {/* Capas de oscurecimiento para legibilidad */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/70"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_60%,rgba(46,125,50,0.22),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      {/* Etiqueta vertical lateral */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 lg:block">
        <span className="mono-label text-paper/40">
          Cluster Media — EST. Miami
        </span>
      </div>

      {/* Contenido */}
      <div className="container-x relative z-[1] flex flex-1 flex-col justify-end pb-12 pt-32 sm:pb-16">
        {/* H1 oculto: necesario para SEO aunque el hero sea solo video */}
        <h1 className="sr-only">
          Cluster Media — Agencia de marketing digital para negocios hispanos en
          Estados Unidos, Latinoamérica y España.
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={120}>
            <p className="max-w-xl text-lg leading-relaxed text-paper/65">
              Marcas, contenido, campañas, websites y automatizaciones con IA
              para conseguir más clientes y profesionalizar tu presencia
              digital.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex flex-wrap items-center gap-3">
              <Button href={site.calendarUrl} external size="lg" iconRight="arrow-right">
                Agendar llamada
              </Button>
              <Button
                href={whatsappLink('Hola Cluster Media, quiero hacer crecer mi negocio.')}
                external
                variant="ghost"
                size="lg"
                icon="whatsapp"
              >
                WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Barra de métricas */}
        <Reveal delay={300}>
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.05] backdrop-blur-sm sm:grid-cols-4">
            {[
              { value: '+50', label: 'negocios atendidos' },
              { value: '~20', label: 'leads/día en campañas' },
              { value: '3', label: 'mercados: EE.UU · LATAM · ES' },
              { value: '6', label: 'servicios integrados' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-white/10 px-5 py-5 [&:not(:last-child)]:border-r"
              >
                <div className="font-display text-3xl font-semibold text-paper">
                  {stat.value}
                </div>
                <div className="mt-1 text-[13px] leading-tight text-paper/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Indicador de scroll */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1] hidden -translate-x-1/2 items-center gap-2 text-paper/40 sm:flex">
        <Icon name="chevron-down" size={16} className="animate-bounce" />
        <span className="mono-label">Scroll</span>
      </div>
    </section>
  );
}
