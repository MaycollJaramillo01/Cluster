import type { Metadata } from 'next';
import Image from 'next/image';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LeadForm } from '@/components/ruta-local/LeadForm';
import { HondurasMap } from '@/components/ruta-local/HondurasMap';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site, whatsappLink } from '@/lib/site';
import {
  totalReach,
  reachMetrics,
  newFollowers,
  municipios,
  packages,
  idealFor,
  benefits,
  rutaLocalWhatsApp,
} from '@/lib/ruta-local';

export const metadata: Metadata = {
  title: 'Ruta Local by Cluster | Promoción territorial y audiovisual para municipios',
  description:
    'Promovemos municipios, turismo, cultura y desarrollo local a través de podcast, reels, vlogs y transmisiones en vivo.',
  alternates: { canonical: '/ruta-local' },
};

export default function RutaLocalPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Ruta Local by Cluster',
          description: metadata.description as string,
          url: `${site.url}/ruta-local`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Ruta Local', url: `${site.url}/ruta-local` },
        ])}
      />

      <Hero />
      <QueEsSection />
      <AlcanceSection />
      <CasosSection />
      <PaquetesSection />
      <IdealParaSection />
      <BeneficiosSection />
      <FormularioSection />
    </>
  );
}

// ── 1. HERO ──────────────────────────────────────────────────
function Hero() {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 pt-36 pb-20 text-fg sm:pt-44 sm:pb-24">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(70%_60%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full bg-surface blur-[130px]"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="container-x relative z-[1]">
        <div className="grid min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Texto */}
          <div className="min-w-0">
            <Reveal>
              <Eyebrow>Ruta Local by Cluster</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 max-w-full break-words font-semibold leading-[0.98] text-fg text-[2.4rem] sm:text-6xl lg:text-7xl">
                Llevamos la conversación nacional a tu municipio.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Producción audiovisual territorial para municipios, turismo,
                cultura y desarrollo local. Convertimos municipios en historias
                que la gente quiere ver, visitar y compartir.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-9 inline-flex items-end gap-3 bg-surface px-6 py-4 backdrop-blur-sm">
                <span className="font-display text-4xl font-semibold text-accent">
                  {totalReach}
                </span>
                <span className="pb-1.5 font-mono text-sm text-faint">
                  visualizaciones
                </span>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button href="#solicitar" size="lg" iconRight="arrow-right">
                  Solicitar propuesta
                </Button>
                <Button href="#casos" variant="ghost" size="lg">
                  Ver casos reales
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Collage visual */}
          <Reveal delay={160} className="relative min-w-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/assets/stock/creative.jpg"
                  alt="Producción audiovisual y podcast en locación"
                  fill
                  priority
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover grayscale transition duration-700 hover:grayscale-0"
                />
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden">
                <Image
                  src="/assets/stock/collaboration.jpg"
                  alt="Cobertura de cultura y comunidad en el municipio"
                  fill
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="object-cover grayscale transition duration-700 hover:grayscale-0"
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
              aria-hidden="true"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── 2. QUÉ ES RUTA LOCAL ─────────────────────────────────────
function QueEsSection() {
  return (
    <Section tone="light">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          eyebrow="Qué es Ruta Local"
          title="Tu municipio, contado como merece."
          description="Ruta Local es la vertical de Cluster dedicada a la producción audiovisual territorial. Viajamos a tu municipio y creamos podcast, reels, vlogs y transmisiones en vivo que muestran su gente, su cultura, su gastronomía y sus paisajes; y los llevamos a audiencias de todo el país."
        />
        <Reveal delay={120}>
          <TerritoryMap />
        </Reveal>
      </div>
    </Section>
  );
}

// Mapa real de Honduras con los departamentos ejecutados resaltados.
function TerritoryMap() {
  const legend = [
    { name: 'Santa Rosa', dept: 'Copán' },
    { name: 'San Juan', dept: 'Intibucá' },
    { name: 'San Marcos', dept: 'Ocotepeque' },
  ];
  return (
    <div className="theme-dark relative overflow-hidden bg-ink-900 p-6 sm:p-8">
      <div
        className="absolute inset-0 bg-grid-fade [background-size:40px_40px] opacity-50"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1]">
        <span className="mono-label text-faint">
          Honduras · Municipios ejecutados
        </span>
        <div className="mt-4">
          <HondurasMap />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5">
          {legend.map((l) => (
            <li key={l.name} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 flex-none bg-accent" />
              <span className="font-display text-base font-semibold uppercase text-fg">
                {l.name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                {l.dept}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── 3. ALCANCE Y MÉTRICAS ────────────────────────────────────
function AlcanceSection() {
  return (
    <Section tone="dark">
      <SectionHeading
        eyebrow="Alcance y métricas"
        align="center"
        title="Más de 20 millones de visualizaciones."
        description="Los contenidos de Ruta Local llegan a audiencias reales en todas las plataformas."
        className="mb-14"
      />

      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-4">
        {reachMetrics.map((m, i) => (
          <Reveal
            key={m.platform}
            delay={i * 60}
            className="group bg-theme p-8 transition-colors duration-500 hover:bg-surface"
          >
            <span className="flex h-12 w-12 items-center justify-center bg-surface text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-fg">
              <Icon name={m.icon} size={24} />
            </span>
            <p className="mt-6 font-display text-5xl font-semibold text-fg">
              {m.value}
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-wider text-muted">
              {m.platform}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal
        delay={120}
        className="mt-px flex flex-col items-center justify-between gap-4 bg-accent px-8 py-7 text-center text-accent-fg sm:flex-row sm:text-left"
      >
        <p className="font-display text-3xl font-semibold sm:text-4xl">
          {newFollowers} seguidores nuevos
        </p>
        <p className="max-w-md font-mono text-sm uppercase tracking-wider opacity-80">
          Comunidad creciente que sigue las historias de cada municipio.
        </p>
      </Reveal>
    </Section>
  );
}

// ── 4. CASOS REALES ──────────────────────────────────────────
function CasosSection() {
  return (
    <Section tone="light" id="casos">
      <SectionHeading
        eyebrow="Casos reales"
        title="Municipios que ya viven Ruta Local."
        description="Producciones completas con podcast, reels, vlogs y tomas aéreas para mostrar lo mejor de cada territorio."
        className="mb-12"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {municipios.map((m, i) => (
          <Reveal
            key={m.name}
            delay={i * 80}
            as="article"
            className="group flex flex-col overflow-hidden bg-surface transition-colors duration-500 hover:bg-surface-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={m.image}
                alt={`Producción de Ruta Local en ${m.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center bg-ink-950/70 text-accent backdrop-blur-sm">
                <Icon name="pin" size={20} />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-7">
              <span className="mono-label text-faint">{m.region}</span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-fg">
                {m.name}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
                {m.blurb}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {m.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-surface-2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ── 5. PAQUETES ──────────────────────────────────────────────
function PaquetesSection() {
  return (
    <Section tone="dark" id="paquetes">
      <SectionHeading
        eyebrow="Paquetes"
        align="center"
        title="Elige cómo contar tu municipio."
        description="Tres formas de empezar. Cada paquete se adapta al tamaño y a los objetivos de tu territorio."
        className="mb-14"
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        {packages.map((p, i) => (
          <Reveal
            key={p.name}
            delay={i * 80}
            className={`group relative flex flex-col p-8 transition-all duration-500 hover:-translate-y-1.5 ${
              p.highlight
                ? 'bg-surface-2 shadow-glow ring-1 ring-inset ring-[color:var(--accent)] lg:-mt-4 lg:pb-12'
                : 'bg-surface hover:bg-surface-2'
            }`}
          >
            {p.badge && (
              <span className="mono-label absolute -top-3 left-8 whitespace-nowrap bg-accent px-4 py-1.5 text-accent-fg">
                {p.badge}
              </span>
            )}
            <span className="mono-label text-faint">{p.kicker}</span>
            <h3 className="mt-2 font-display text-3xl font-semibold text-fg">
              {p.name}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {p.tagline}
            </p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-muted">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-surface text-accent">
                    <Icon name="check" size={13} strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              href="#solicitar"
              variant={p.highlight ? 'accent' : 'ghost'}
              size="lg"
              className="mt-8 w-full"
              iconRight="arrow-right"
            >
              Quiero este paquete
            </Button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ── 6. IDEAL PARA ────────────────────────────────────────────
function IdealParaSection() {
  return (
    <Section tone="light">
      <SectionHeading
        eyebrow="Ideal para"
        title="Pensado para quienes construyen territorio."
        description="Si representas a tu comunidad, Ruta Local es para ti."
        className="mb-12"
      />
      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-4">
        {idealFor.map((a, i) => (
          <Reveal
            key={a.label}
            delay={i * 50}
            className="group flex items-center gap-4 bg-theme p-6 transition-colors duration-500 hover:bg-surface"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center bg-surface text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-fg">
              <Icon name={a.icon} size={22} />
            </span>
            <span className="font-display text-lg font-semibold uppercase text-fg">
              {a.label}
            </span>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ── 7. BENEFICIOS ────────────────────────────────────────────
function BeneficiosSection() {
  return (
    <Section tone="dark">
      <SectionHeading
        eyebrow="Beneficios"
        title="Lo que gana tu municipio."
        className="mb-12"
      />
      <div className="grid gap-px overflow-hidden bg-surface-2 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <Reveal
            key={b.title}
            delay={i * 50}
            className="group relative bg-theme p-8 transition-colors duration-500 hover:bg-surface"
          >
            <span className="mono-label absolute right-6 top-6 text-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex h-12 w-12 items-center justify-center bg-surface text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-fg">
              <Icon name={b.icon} size={24} />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-fg">
              {b.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {b.text}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ── 8. FORMULARIO ────────────────────────────────────────────
function FormularioSection() {
  return (
    <Section tone="light" id="solicitar">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Solicita tu propuesta"
            title="Solicita tu propuesta"
            description="Cuéntanos sobre tu municipio, evento o iniciativa y conversemos sobre cómo llevar Ruta Local a tu ciudad."
          />
          <div className="mt-8 flex flex-col gap-4">
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-3 text-muted transition-colors hover:text-fg"
            >
              <Icon name="mail" size={18} className="text-accent" />
              {site.email}
            </a>
            <Button
              href={whatsappLink(rutaLocalWhatsApp)}
              external
              variant="whatsapp"
              icon="whatsapp"
              size="lg"
              className="self-start"
            >
              Agendar llamada por WhatsApp
            </Button>
          </div>
        </div>
        <LeadForm />
      </div>
    </Section>
  );
}
