'use client';

import Link from 'next/link';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ } from '@/components/blocks/FAQ';
import { ConversionCalculator } from './ConversionCalculator';
import { ContactBlock } from './ContactBlock';
import { LandingChrome } from './LandingChrome';
import { DualCtas } from '@/components/landings/DualCtas';
import type { CountryConfig } from '@/lib/clinicas-esteticas/types';
import { formatMoney, countryCodes, countries } from '@/lib/clinicas-esteticas/countries';
import {
  demoLeads,
  faqs,
  followUpExamples,
  followUpPipeline,
  handoffExamples,
  heroCopy,
  implementationSteps,
  integrations,
  landingMeta,
  pipelineStages,
  problemBlocks,
  responseTimePromise,
  sources,
  systemModules,
} from '@/lib/clinicas-esteticas/content';
import { site, whatsappLink } from '@/lib/site';
import { trackEvent } from '@/lib/clinicas-esteticas/tracking';

type Props = {
  country: CountryConfig;
};

export function ClinicasEsteticasLanding({ country }: Props) {
  const pct = (a: number, b: number) =>
    b === 0 ? '0%' : `${Math.round((a / b) * 100)}%`;

  const waMsg = `Hola Cluster Media, vi la landing de clínicas estéticas (${country.name}) y quiero hablar sobre el sistema de conversión.`;

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', { country: country.code, source });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', { country: country.code, source });

  return (
    <div className="clinicas-landing pt-[76px]">
      <LandingChrome country={country} />

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="theme-dark border-b border-line bg-ink-950"
      >
        <div className="container-x flex flex-wrap items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          <Link href="/" className="hover:text-accent">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/clinicas-esteticas" className="hover:text-accent">
            Clínicas estéticas
          </Link>
          <span>/</span>
          <span className="text-fg">{country.name}</span>
        </div>
      </nav>

      {/* Country switcher */}
      <div className="theme-dark border-b border-line bg-ink-900">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <span className="mono-label text-faint">Mercado</span>
          {countryCodes.map((code) => {
            const c = countries[code];
            const active = code === country.code;
            return (
              <Link
                key={code}
                href={c.path}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? 'bg-accent text-accent-fg'
                    : 'border border-line text-muted hover:border-accent hover:text-fg'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* HERO */}
      <section className="theme-dark relative overflow-hidden bg-ink-950 text-fg">
        <HaikeiAtmosphere />
        <div className="container-x relative z-[1] grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <Reveal>
            <Eyebrow>{heroCopy.eyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              {heroCopy.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {heroCopy.subheadline}
            </p>
            <div className="mt-8">
              <DualCtas
                whatsappMessage={waMsg}
                onWhatsApp={() => trackWa('hero')}
                onSchedule={() => trackCal('hero')}
              />
            </div>
            <p className="mt-4 text-sm text-faint">{heroCopy.micro}</p>
            <p className="mt-2 text-sm text-accent">{responseTimePromise}</p>
            <p className="mt-4">
              <a href="#calculadora" className="text-sm text-muted link-underline hover:text-accent">
                Explorar calculadora (opcional)
              </a>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <PipelineInterface />
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <Section tone="light" id="problema">
        <SectionHeading
          eyebrow="El problema"
          title="Después de la consulta, el valor se decide en el seguimiento."
          description="Las clínicas invierten en Meta, Google e Instagram para conseguir consultas, y luego pierden visibilidad sobre citas, asistencias y tratamientos."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problemBlocks.map((block, i) => (
            <Reveal key={block.n} delay={i * 60} className="border border-line bg-paper p-6">
              <span className="font-mono text-xs text-accent">{block.n}</span>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{block.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg text-muted">
          Cada uno de estos puntos representa ingresos potenciales que ya costó
          dinero generar.
        </p>
      </Section>

      {/* CALCULATOR */}
      <Section tone="dark" id="calculadora">
        <SectionHeading
          eyebrow="Calculadora"
          title="¿Cuánto valor generan realmente tus consultas?"
          description="Introduce tus números para ver el recorrido actual y el impacto de mejorar unas cuantas etapas del proceso."
        />
        <div className="mt-12">
          <ConversionCalculator country={country} />
        </div>
      </Section>

      {/* FUNNEL VISIBILITY */}
      <Section tone="soft" id="visibilidad">
        <SectionHeading
          eyebrow="Visibilidad"
          title="Deja de medir solo cuántos leads entran."
          description="Así se ve un funnel comercial completo: de la inversión publicitaria hasta el tratamiento."
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 border border-line bg-paper-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Vista de referencia
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Inversión publicitaria" value={formatMoney(country.demo.adSpend, country)} />
            <Stat label="Consultas" value={String(country.demo.consultations)} />
            <Stat label="Citas" value={String(country.demo.appointments)} />
            <Stat label="Asistencias" value={String(country.demo.attended)} />
            <Stat label="Tratamientos vendidos" value={String(country.demo.treatments)} />
            <Stat
              label="Revenue atribuido"
              value={formatMoney(country.demo.revenue, country)}
              accent
            />
          </div>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {[
              ['Meta Ads', '—'],
              ['Consulta', pct(country.demo.consultations, country.demo.consultations)],
              ['Cita', pct(country.demo.appointments, country.demo.consultations)],
              ['Asistencia', pct(country.demo.attended, country.demo.appointments)],
              ['Tratamiento', pct(country.demo.treatments, country.demo.attended)],
            ].map(([label, rate], idx, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="border border-line px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-sm text-fg">{rate}</p>
                </div>
                {idx < arr.length - 1 && (
                  <span className="hidden text-faint lg:inline">→</span>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* SYSTEM MODULES */}
      <Section tone="dark" id="sistema">
        <SectionHeading
          eyebrow="El sistema"
          title="Un sistema alrededor de todo el recorrido comercial del paciente."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {systemModules.map((m, i) => (
            <Reveal
              key={m.title}
              delay={i * 40}
              className="border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <h3 className="font-display text-xl normal-case tracking-normal">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FOLLOW-UP */}
      <Section tone="light" id="seguimiento">
        <SectionHeading
          eyebrow="Diferenciador"
          title="El seguimiento continúa después de la valoración."
          description="Otras soluciones se detienen cuando el paciente agenda. Aquí el pipeline sigue hasta tratamiento y recurrencia."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="border border-line bg-paper p-6">
            <ol className="space-y-0">
              {followUpPipeline.map((step, i) => (
                <li key={step} className="relative pl-8 pb-6 last:pb-0">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 bg-accent" />
                  {i < followUpPipeline.length - 1 && (
                    <span className="absolute left-[4px] top-4 h-full w-px bg-line" />
                  )}
                  <p className="text-[15px] text-ink">{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={80}>
            <ul className="space-y-3">
              {followUpExamples.map((ex) => (
                <li
                  key={ex}
                  className="border-l-2 border-accent bg-paper-soft px-4 py-3 text-[15px] text-ink/80"
                >
                  {ex}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-l-4 border-accent bg-paper-soft px-5 py-5 text-lg leading-snug text-ink sm:text-xl">
              El seguimiento comercial corre alrededor del proceso clínico,
              sin sustituir el criterio médico del equipo.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* FINANCING — optional module */}
      {country.financingEnabled && (
        <Section tone="soft" id="financiacion">
          <SectionHeading
            eyebrow="Financiación"
            title="Cuando el paciente necesita tiempo, el seguimiento sigue."
            description="Si la clínica trabaja con financiación, el sistema acompaña ese flujo con tu proveedor o proceso interno."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Enviar información de financiación',
              'Mostrar cuotas orientativas',
              'Enlace al proceso financiero externo',
              'Seguimiento posterior',
              'Notificar al equipo cuando hay interés',
              'Integración con proveedor o flujo interno',
            ].map((item) => (
              <div key={item} className="border border-line bg-paper px-4 py-4 text-sm text-ink/80">
                {item}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* PRIVACY */}
      <Section tone="dark" id="privacidad-datos">
        <SectionHeading
          eyebrow={country.privacyLabel}
          title="La historia clínica queda en tu software clínico."
          description="Cluster opera como capa de captación y seguimiento comercial. Diagnósticos, historiales, fotografías clínicas y documentación sanitaria permanecen fuera de este sistema."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal className="border border-line bg-surface p-6">
            <p className="mono-label text-faint">Software clínico</p>
            <ul className="mt-5 space-y-2 text-[15px] text-muted">
              {[
                'Historia médica',
                'Diagnóstico',
                'Documentación sanitaria',
                'Tratamientos clínicos',
              ].map((i) => (
                <li key={i} className="border-b border-line py-2">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80} className="border border-accent/40 bg-surface p-6">
            <p className="mono-label text-accent">Cluster Conversion System</p>
            <ul className="mt-5 space-y-2 text-[15px] text-muted">
              {[
                'Prospectos',
                'Campañas',
                'Conversaciones',
                'Citas',
                'Pipeline comercial',
                'Seguimiento',
              ].map((i) => (
                <li key={i} className="border-b border-line py-2">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <p className="mt-6 text-sm text-faint">{country.legalNote}</p>
      </Section>

      {/* INTEGRATIONS */}
      <Section tone="light" id="integraciones">
        <SectionHeading
          eyebrow="Herramientas"
          title="Trabajamos con lo que la clínica ya usa."
          description="La solución se diseña alrededor de los canales y herramientas actuales."
        />
        <div className="mt-10 flex flex-wrap gap-2">
          {integrations.map((item) => (
            <span
              key={item}
              className="border border-line bg-paper px-4 py-2 text-sm text-ink/80"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-lg text-muted">
          Conectamos el proceso comercial alrededor de tu stack: formularios,
          Meta, Google, WhatsApp, calendario y CRM cuando exista integración.
        </p>
      </Section>

      {/* FLUJO DE CONSULTA — sin video placeholder */}
      <Section tone="dark" id="demo">
        <SectionHeading
          eyebrow="Recorrido"
          title="Así se organiza una consulta desde el primer mensaje."
          description="Cada paso deja rastro en el pipeline para recepción y seguimiento."
        />
        <Reveal className="mt-12">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: '22:47', d: '“Hola, quería información sobre tratamiento facial.”' },
              { t: 'Respuesta', d: 'Atención inmediata y preguntas iniciales.' },
              { t: 'Cita', d: 'Reserva, confirmación y alerta a recepción.' },
              { t: 'Seguimiento', d: 'Pipeline actualizado y follow-up post-valoración.' },
            ].map((step) => (
              <li
                key={step.t}
                className="border border-line bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <p className="mono-label text-accent">{step.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">
            Todo queda ordenado: menos conversaciones sueltas, más control comercial.
          </p>
        </Reveal>
      </Section>

      {/* HUMAN HANDOFF */}
      <Section tone="soft" id="handoff">
        <SectionHeading
          eyebrow="Intervención humana"
          title="Cuando hace falta una persona, el equipo entra."
          description="El sistema ordena el trabajo previo; recepción y comerciales toman las conversaciones que lo requieren."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal className="border border-line bg-paper p-7">
            <p className="mono-label text-muted">Automatización</p>
            <h3 className="mt-3 font-display text-3xl normal-case tracking-normal text-ink">
              Capa comercial
            </h3>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              <li className="border-b border-line py-2">Respuesta inicial</li>
              <li className="border-b border-line py-2">Calificación y agenda</li>
              <li className="border-b border-line py-2">Recordatorios y recuperación</li>
              <li className="border-b border-line py-2">Seguimiento rutinario</li>
            </ul>
          </Reveal>
          <Reveal delay={80} className="border border-line bg-paper p-7">
            <p className="mono-label text-accent">Equipo de la clínica</p>
            <h3 className="mt-3 font-display text-3xl normal-case tracking-normal text-ink">
              Intervención humana
            </h3>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {handoffExamples.map((ex) => (
                <li key={ex} className="border-b border-line py-2">
                  {ex}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <p className="mt-6 text-muted">
          El personal decide el cierre; el sistema mantiene el pipeline visible.
        </p>
      </Section>

      {/* DASHBOARD DEMO */}
      <Section tone="dark" id="dashboard">
        <SectionHeading
          eyebrow="Dashboard"
          title="Visibilidad comercial en un solo lugar."
          description="Consultas, citas, asistencias y tratamientos por fuente, con la próxima acción de cada oportunidad."
        />
        <Reveal className="mt-12 border border-line bg-ink-950 p-6 sm:p-8">
          <div className="mb-6 inline-flex border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Vista de referencia
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat dark label="Consultas" value="182" />
            <Stat dark label="Citas" value="91" />
            <Stat dark label="Asistencia" value="76" />
            <Stat dark label="Tratamientos iniciados" value="38" />
            <Stat
              dark
              label="Valor atribuido"
              value={formatMoney(country.demo.revenue, country)}
              accent
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {sources.map((s) => (
              <span
                key={s}
                className="border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  <th className="py-3 pr-4 font-medium">Paciente</th>
                  <th className="py-3 pr-4 font-medium">Fuente</th>
                  <th className="py-3 pr-4 font-medium">Estado</th>
                  <th className="py-3 font-medium">Próxima acción</th>
                </tr>
              </thead>
              <tbody>
                {demoLeads.map((row) => (
                  <tr key={row.id} className="border-b border-line/60 text-muted">
                    <td className="py-3 pr-4 text-fg">{row.id}</td>
                    <td className="py-3 pr-4">{row.source}</td>
                    <td className="py-3 pr-4">{row.status}</td>
                    <td className="py-3 text-accent">{row.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* IMPLEMENTATION */}
      <Section tone="light" id="implementacion">
        <SectionHeading
          eyebrow="Implementación"
          title="Nosotros construimos el sistema contigo."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {implementationSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 50} className="border border-line bg-paper p-5">
              <span className="font-mono text-xs text-accent">{step.n}</span>
              <h3 className="mt-3 font-display text-2xl normal-case tracking-normal">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* TRUST */}
      <Section tone="dark" id="equipo">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Confianza"
            title="Un equipo real detrás de la implementación."
            description="Diseñamos e implementamos el sistema alrededor del proceso comercial de tu clínica, con soporte en español."
          />
          <Reveal className="border border-line bg-surface p-6">
            <p className="mono-label text-accent">{site.name}</p>
            <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {[
                'Desarrollo e integración',
                'Soporte humano',
                'Comunicación en español',
                'Acompañamiento de implementación',
                'Optimización post-lanzamiento',
              ].map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* SOCIAL PROOF */}
      <Section tone="soft" id="prueba-social">
        <SectionHeading
          eyebrow="Casos"
          title="Métricas de clínicas publicadas con evidencia."
          description="Cuando haya resultados documentados de consultas, citas y tratamientos, aparecerán aquí con el contexto de cada clínica."
        />
        <div className="mt-8">
          <DualCtas
            whatsappMessage={waMsg}
            onWhatsApp={() => trackWa('casos')}
            onSchedule={() => trackCal('casos')}
          />
        </div>
      </Section>

      {/* PRICING */}
      <Section tone="light" id="precio">
        <SectionHeading
          eyebrow="Inversión"
          title="Implementación adaptada a tu clínica."
          description="El precio depende de volumen, canales, usuarios, automatizaciones, integraciones, AI y telefonía."
        />
        <Reveal className="mt-10 max-w-xl border border-line bg-paper p-8">
          <p className="mono-label text-accent">Precio provisional</p>
          <p className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Desde {formatMoney(country.setupFrom, country)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Implementación · equivalencia local según mercado
          </p>
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-sm text-muted">
              Mensualidad: configurable según alcance. Modelo objetivo: setup +
              recurrente.
            </p>
          </div>
          <DualCtas
            className="mt-6"
            size="md"
            whatsappMessage={waMsg}
            onWhatsApp={() => trackWa('precio')}
            onSchedule={() => trackCal('precio')}
          />
        </Reveal>
      </Section>

      {/* CONTACTO */}
      <Section tone="dark" id="contacto">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos de tu proceso de conversión"
          description="WhatsApp o llamada directa. Si prefieres, déjanos tus datos y te escribimos."
        />
        <div className="mt-10 max-w-3xl">
          <ContactBlock country={country} />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light" id="faq">
        <SectionHeading
          eyebrow="FAQ"
          title="Preguntas frecuentes"
          align="center"
        />
        <div className="mt-12">
          <FAQ items={[...faqs]} />
        </div>
      </Section>

      {/* Internal links + last updated */}
      <section className="theme-dark border-t border-line bg-ink-950 py-10 text-fg">
        <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/automatizaciones-ia" className="hover:text-accent">
              Automatizaciones
            </Link>
            <Link href="/contacto" className="hover:text-accent">
              Contacto
            </Link>
            <Link href="/privacidad" className="hover:text-accent">
              Privacidad
            </Link>
            <Link href="/casos-de-exito" className="hover:text-accent">
              Casos de éxito
            </Link>
            <a
              href={whatsappLink(
                `Hola, quiero el Diagnóstico de Conversión (${country.name}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('WhatsAppClick', { country: country.code })}
              className="hover:text-accent"
            >
              WhatsApp
            </a>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            Actualizado {landingMeta.lastUpdated}
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  dark,
}: {
  label: string;
  value: string;
  accent?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={`border border-line p-4 ${dark ? 'bg-surface' : 'bg-paper-soft'}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p className={`mt-2 font-mono text-xl ${accent ? 'text-accent' : 'text-fg'}`}>
        {value}
      </p>
    </div>
  );
}

function PipelineInterface() {
  return (
    <div className="border border-line bg-ink-900/80 p-5 shadow-panel backdrop-blur-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="mono-label text-accent">Pipeline comercial</p>
        <span className="font-mono text-[10px] text-faint">LIVE UI</span>
      </div>
      <div className="space-y-2">
        {pipelineStages.map((stage, i) => (
          <div
            key={stage}
            className="flex items-center gap-3 border border-line bg-surface px-3 py-3 transition-colors hover:border-accent/40"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-7 w-7 items-center justify-center bg-accent/15 font-mono text-[10px] text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm text-fg">{stage}</span>
            {i < pipelineStages.length - 1 && (
              <span className="ml-auto font-mono text-[10px] text-faint">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Atmósfera tipo Haikei: ondas SVG con paleta de marca. */
function HaikeiAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cmWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#02C39A" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#111111" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#02C39A" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          fill="url(#cmWave)"
          d="M0,480 C180,420 320,560 520,500 C720,440 820,300 1020,340 C1220,380 1340,280 1440,320 L1440,800 L0,800 Z"
        />
        <path
          fill="#02C39A"
          fillOpacity="0.06"
          d="M0,560 C220,500 380,620 560,580 C780,530 900,420 1100,460 C1280,490 1360,400 1440,430 L1440,800 L0,800 Z"
        />
      </svg>
      <div className="absolute inset-0 bg-grid-fade opacity-20 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
