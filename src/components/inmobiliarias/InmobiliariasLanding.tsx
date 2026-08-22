'use client';

import Link from 'next/link';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ } from '@/components/blocks/FAQ';
import { PipelineCalculator } from './PipelineCalculator';
import { ContactBlock } from './ContactBlock';
import { LandingChrome } from './LandingChrome';
import { DualCtas } from '@/components/landings/DualCtas';
import type { CountryConfig } from '@/lib/inmobiliarias/types';
import { formatMoney, countryCodes, countries } from '@/lib/inmobiliarias/countries';
import {
  assignmentVars,
  discardReasons,
  faqs,
  heroCopy,
  implementationSteps,
  landingMeta,
  leadScores,
  nurturingBuckets,
  pipelineStages,
  postVisitFlow,
  problemBlocks,
  qualificationFields,
  responseTimePromise,
  responseTimes,
  visitFeatures,
} from '@/lib/inmobiliarias/content';
import { site, whatsappLink } from '@/lib/site';
import { trackEvent } from '@/lib/inmobiliarias/tracking';

type Props = {
  country: CountryConfig;
};

export function InmobiliariasLanding({ country }: Props) {
  const waMsg = `Hola Cluster Media, vi la landing de inmobiliarias (${country.name}) y quiero hablar sobre el sistema de conversión de leads.`;

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', { country: country.code, source });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', { country: country.code, source });

  return (
    <div className="inmobiliarias-landing pt-[76px]">
      <LandingChrome country={country} />

      <nav
        aria-label="Breadcrumb"
        className="theme-dark border-b border-line bg-ink-950"
      >
        <div className="container-x flex flex-wrap items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          <Link href="/" className="hover:text-accent">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/inmobiliarias" className="hover:text-accent">
            Inmobiliarias
          </Link>
          <span>/</span>
          <span className="text-fg">{country.name}</span>
        </div>
      </nav>

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
        <Atmosphere />
        <div className="container-x relative z-[1] grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <Reveal>
            <Eyebrow>{heroCopy.eyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
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
          title="El lead no espera a que tu agente tenga tiempo."
          description="Muchas inmobiliarias ya reciben contactos. El cuello de botella está en respuesta, asignación, visitas y seguimiento."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problemBlocks.map((block, i) => (
            <Reveal
              key={block.n}
              delay={i * 50}
              className="border border-line bg-paper p-6 lg:last:col-span-2"
            >
              <span className="font-mono text-xs text-accent">{block.n}</span>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{block.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg text-muted">
          En inmobiliario, la velocidad importa. La persistencia y la organización
          importan todavía más.
        </p>
      </Section>

      {/* CALCULATOR */}
      <Section tone="dark" id="calculadora">
        <SectionHeading
          eyebrow="Calculadora"
          title="¿Cuánto valor comercial pasa por tu pipeline cada mes?"
          description="Estima visitas y operaciones a partir de tus números. El valor del inmueble ilustra volumen; la comisión es opcional."
        />
        <div className="mt-12">
          <PipelineCalculator country={country} />
        </div>
      </Section>

      {/* MULTICHANNEL */}
      <Section tone="soft" id="multicanal">
        <SectionHeading
          eyebrow="Multicanal"
          title="Tus oportunidades llegan por muchos lugares. Tu equipo debería verlas en uno."
          description="Según las integraciones disponibles, centralizamos o conectamos los puntos de entrada para un proceso comercial más consistente."
        />
        <Reveal className="mt-12">
          <div className="flex flex-wrap gap-2">
            {country.portals.map((p) => (
              <span
                key={p}
                className="border border-line bg-paper px-4 py-2 text-sm text-ink/80"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="my-6 font-mono text-sm text-accent">↓</div>
          <div className="border border-accent/40 bg-ink-900 px-5 py-4 text-fg">
            <p className="mono-label text-accent">Cluster Conversion System</p>
            <p className="mt-2 text-sm text-muted">
              Captación · calificación · asignación · visitas · seguimiento
            </p>
          </div>
          <div className="my-6 font-mono text-sm text-accent">↓</div>
          <p className="text-sm text-muted">Agentes y dirección comercial</p>
          <p className="mt-4 max-w-2xl text-sm text-faint">
            La conexión directa con cada portal se confirma según API disponible
            en el mercado.
          </p>
        </Reveal>
      </Section>

      {/* SPEED RESPONSE */}
      <Section tone="dark" id="respuesta">
        <SectionHeading
          eyebrow="Respuesta inicial"
          title="El primer agente que responde suele tener ventaja."
          description="Cuando entra una consulta: respuesta inicial, confirmación de interés, recopilación de datos, intención y asignación al comercial adecuado."
        />
        <div className="mt-10 flex flex-wrap gap-2">
          {qualificationFields.map((f) => (
            <span
              key={f}
              className="border border-line bg-surface px-3 py-2 text-sm text-muted"
            >
              {f}
            </span>
          ))}
        </div>
      </Section>

      {/* SCORING */}
      <Section tone="light" id="scoring">
        <SectionHeading
          eyebrow="Lead scoring"
          title="No todos los leads tienen la misma intención."
          description="El equipo prioriza las oportunidades HOT y mantiene seguimiento sobre WARM y LONG TERM."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {leadScores.map((s, i) => (
            <Reveal
              key={s.level}
              delay={i * 60}
              className="border border-line bg-paper p-6"
            >
              <p className="mono-label text-accent">{s.level}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ASSIGNMENT */}
      <Section tone="soft" id="asignacion">
        <SectionHeading
          eyebrow="Asignación"
          title="El lead correcto, al agente correcto."
        />
        <div className="mt-10 flex flex-wrap gap-2">
          {assignmentVars.map((v) => (
            <span
              key={v}
              className="border border-line bg-paper px-3 py-2 text-sm text-ink/75"
            >
              {v}
            </span>
          ))}
        </div>
        <Reveal className="mt-10 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="border border-line bg-paper p-5">
            <p className="mono-label text-faint">Lead</p>
            <p className="mt-3 text-sm text-ink">{country.assignmentExample.lead}</p>
          </div>
          <span className="hidden text-center font-mono text-accent md:block">→</span>
          <div className="border border-accent/40 bg-paper p-5">
            <p className="mono-label text-accent">Asignación</p>
            <p className="mt-3 text-sm text-ink">{country.assignmentExample.agent}</p>
          </div>
        </Reveal>
      </Section>

      {/* VISITS */}
      <Section tone="dark" id="visitas">
        <SectionHeading
          eyebrow="Visitas"
          title="Convertir conversaciones en visitas."
          description="Agenda, confirmaciones, recordatorios y, tras la visita, movimiento automático a Follow-Up Post Visit."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visitFeatures.map((f) => (
            <div key={f} className="border border-line bg-surface px-4 py-4 text-sm text-muted">
              {f}
            </div>
          ))}
        </div>
      </Section>

      {/* POST VISIT */}
      <Section tone="light" id="post-visita">
        <SectionHeading
          eyebrow="Después de la visita"
          title="El seguimiento post-visita define si hay segunda oportunidad."
          description="Si la propiedad no encaja, el comprador sigue en el pipeline con property matching y alternativas."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal className="space-y-3">
            {postVisitFlow.map((step) => (
              <div
                key={step.day}
                className="border-l-2 border-accent bg-paper-soft px-4 py-3"
              >
                <p className="mono-label text-accent">{step.day}</p>
                <p className="mt-2 text-sm text-ink/80">{step.text}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={80} className="border border-line bg-paper p-6">
            <p className="mono-label text-muted">Property matching</p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
              Propiedades similares, nuevo inventario, cambios de precio y
              alternativas — el lead permanece activo aunque descarte la unidad
              inicial.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* NURTURING */}
      <Section tone="dark" id="nurturing">
        <SectionHeading
          eyebrow="Nurturing"
          title="Quien busca en seis meses también necesita un proceso."
          description="Mantener presencia con nuevas propiedades, cambios, financiación y contacto periódico — sin depender de la memoria del agente."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nurturingBuckets.map((b, i) => (
            <Reveal key={b.range} delay={i * 40} className="border border-line bg-surface p-5">
              <p className="mono-label text-accent">{b.range}</p>
              <p className="mt-3 text-sm text-muted">{b.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* BUYER MATCHING */}
      <Section tone="soft" id="matching">
        <SectionHeading
          eyebrow="Buyer matching"
          title="Una propiedad descartada. Un comprador que sigue activo."
          description="Capturamos el motivo del descarte, segmentamos y alertamos al agente con nuevas alternativas."
        />
        <div className="mt-10 flex flex-wrap gap-2">
          {discardReasons.map((r) => (
            <span
              key={r}
              className="border border-line bg-paper px-3 py-2 text-sm text-ink/75"
            >
              {r}
            </span>
          ))}
        </div>
      </Section>

      {/* DEVELOPERS */}
      <Section tone="light" id="desarrolladores">
        <SectionHeading
          eyebrow="Proyectos"
          title="Especialmente potente para proyectos con alto volumen de leads."
          description="De la campaña al lead calificado, a la distribución comercial, visita/demo y reserva."
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              'Campañas Meta / Google',
              'Volumen de leads',
              'Calificación automática',
              'Distribución comercial',
              'Visita → reserva',
            ].map((step, i) => (
              <li key={step}>
                <p className="font-mono text-[10px] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-sm text-ink/80">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>

      {/* INTERNATIONAL */}
      {country.showInternationalBuyer && (
        <Section tone="dark" id="internacional">
          <SectionHeading
            eyebrow="Comprador internacional"
            title="Vender propiedades a distancia exige un proceso distinto."
            description="País de residencia, inversión o vivienda, presupuesto, financiación, fecha de viaje, Zoom, preferencias y documentación inicial."
          />
          <Reveal className="mt-12 flex flex-wrap items-center gap-2 text-sm text-muted">
            {[
              'Lead internacional',
              'WhatsApp',
              'Calificación',
              'Videollamada',
              'Propiedades',
              'Visita futura',
              'Seguimiento',
            ].map((step, i, arr) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="border border-line bg-surface px-3 py-2">{step}</span>
                {i < arr.length - 1 && <span className="text-accent">→</span>}
              </span>
            ))}
          </Reveal>
        </Section>
      )}

      {/* DASHBOARD */}
      <Section tone="soft" id="dashboard">
        <SectionHeading
          eyebrow="Dashboard"
          title="Mira el pipeline comercial, no solamente el número de leads."
          description="Leads, contactados, calificados, visitas, negociaciones, reservas y ventas — por fuente y por agente."
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <div className="mb-6 inline-flex border border-line bg-paper-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Vista de referencia
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Leads nuevos" value={String(country.demo.leads)} />
            <Stat label="Contactados" value={String(country.demo.contacted)} />
            <Stat label="Calificados" value={String(country.demo.qualified)} />
            <Stat label="Visitas" value={String(country.demo.visits)} />
            <Stat label="Negociaciones" value={String(country.demo.negotiations)} />
            <Stat label="Reservas" value={String(country.demo.reservations)} />
            <Stat label="Ventas" value={String(country.demo.sales)} accent />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mono-label text-faint">Por fuente</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Meta', 'Google', 'Portal A', 'Portal B', 'Website'].map((s) => (
                  <span
                    key={s}
                    className="border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mono-label text-faint">Por agente</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Agente 1', 'Agente 2', 'Agente 3'].map((s) => (
                  <span
                    key={s}
                    className="border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-faint">
            Métricas: tiempo de respuesta · lead → visita · visita → reserva ·
            reserva → venta
          </p>
        </Reveal>
      </Section>

      {/* SPEED TO LEAD */}
      <Section tone="dark" id="speed">
        <SectionHeading
          eyebrow="Speed-to-lead"
          title="Saber cuánto tardas en responder puede cambiar tu operación."
          description="Cuando la infraestructura lo permite, el sistema mide tiempos de respuesta por lead."
        />
        <Reveal className="mt-10 max-w-xl border border-line bg-surface">
          <ul>
            {responseTimes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-line px-5 py-4 last:border-0"
              >
                <span className="font-mono text-sm text-fg">{r.id}</span>
                <span className="text-sm text-accent">{r.time}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-5 py-4">
            <p className="mono-label text-faint">Average response time</p>
            <p className="mt-2 font-mono text-lg text-fg">Medible por operación</p>
          </div>
        </Reveal>
      </Section>

      {/* CRM */}
      <Section tone="light" id="crm">
        <SectionHeading
          eyebrow="Herramientas"
          title="Tu CRM actual puede quedarse. Nosotros trabajamos la capa comercial."
          description="Software inmobiliario, MLS, portal, CRM o ERP: conectamos captación, automatización, conversión y seguimiento cuando sea técnicamente viable."
        />
      </Section>

      {/* IMPLEMENTATION */}
      <Section tone="soft" id="implementacion">
        <SectionHeading
          eyebrow="Implementación"
          title="Diseñamos e implementamos el proceso contigo."
          description="Lo importante es lo que ocurre dentro del pipeline: etapas, reglas y seguimiento."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {implementationSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 40} className="border border-line bg-paper p-5">
              <span className="font-mono text-xs text-accent">{step.n}</span>
              <h3 className="mt-3 font-display text-2xl normal-case tracking-normal">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FLOW DEMO (no video placeholder) */}
      <Section tone="dark" id="demo">
        <SectionHeading
          eyebrow="Recorrido"
          title="Así se organiza un nuevo comprador desde el primer mensaje."
        />
        <Reveal className="mt-12">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: '22:34',
                d: '“Interesado en apartamentos en Punta Cana para inversión.”',
              },
              { t: 'Calificación', d: 'Presupuesto, plazo e intención.' },
              { t: 'HOT', d: 'Asignación al agente y agenda Zoom.' },
              { t: 'Pipeline', d: 'Oportunidad lista para el equipo comercial.' },
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
        </Reveal>
      </Section>

      {/* HANDOFF */}
      <Section tone="light" id="handoff">
        <SectionHeading
          eyebrow="Human handoff"
          title="El sistema ordena. El agente asesora y cierra."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal className="border border-line bg-paper p-7">
            <p className="mono-label text-muted">Automatización</p>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {['Responde', 'Califica', 'Organiza', 'Recuerda'].map((i) => (
                <li key={i} className="border-b border-line py-2">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={60} className="border border-line bg-paper p-7">
            <p className="mono-label text-accent">Agente</p>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {['Asesora', 'Negocia', 'Genera confianza', 'Vende'].map((i) => (
                <li key={i} className="border-b border-line py-2">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* REACTIVATION */}
      <Section tone="dark" id="reactivacion">
        <SectionHeading
          eyebrow="Reactivación"
          title="¿Cuántos leads tienes guardados que nadie volvió a contactar?"
          description="Segmentación por antigüedad y tipo (compradores, vendedores, inversionistas, alquiler, proyectos), según consentimiento aplicable."
        />
        <div className="mt-8">
          <DualCtas
            whatsappMessage={waMsg}
            onWhatsApp={() => trackWa('reactivacion')}
            onSchedule={() => trackCal('reactivacion')}
          />
        </div>
      </Section>

      {/* SELLERS optional */}
      <Section tone="soft" id="captacion">
        <SectionHeading
          eyebrow="Módulo opcional"
          title="También puede trabajar del lado de captación de propiedades."
          description="Valoración → llamada → reunión → captación. El foco inicial del sistema sigue siendo la conversión de buyer leads."
        />
      </Section>

      {/* PRICING */}
      <Section tone="light" id="precio">
        <SectionHeading
          eyebrow="Inversión"
          title="La implementación depende de tu estructura comercial."
          description="Agentes, canales, volumen, proyectos, integraciones, países, WhatsApp, telefonía, AI y workflows."
        />
        <Reveal className="mt-10 max-w-xl border border-line bg-paper p-8">
          <p className="mono-label text-accent">Precio provisional</p>
          <p className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Desde {formatMoney(country.setupFrom, country)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Desarrolladores y equipos grandes: precio personalizado. Mensualidad
            configurable.
          </p>
          <DualCtas
            className="mt-6"
            size="md"
            whatsappMessage={waMsg}
            onWhatsApp={() => trackWa('precio')}
            onSchedule={() => trackCal('precio')}
          />
        </Reveal>
      </Section>

      {/* SOCIAL */}
      <Section tone="dark" id="casos">
        <SectionHeading
          eyebrow="Casos"
          title="Métricas publicadas con evidencia de pipeline."
          description="Cuando haya resultados documentados de respuesta, visitas, reservas y ventas, aparecerán aquí con contexto."
        />
        <div className="mt-8">
          <DualCtas
            whatsappMessage={waMsg}
            onWhatsApp={() => trackWa('casos')}
            onSchedule={() => trackCal('casos')}
          />
        </div>
      </Section>

      {/* CONTACTO */}
      <Section tone="soft" id="contacto">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos de tu pipeline comercial"
          description="WhatsApp o llamada directa. Si prefieres, déjanos tus datos y te escribimos."
        />
        <div className="mt-10 max-w-3xl">
          <ContactBlock country={country} />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light" id="faq">
        <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes" align="center" />
        <div className="mt-12">
          <FAQ items={[...faqs]} />
        </div>
      </Section>

      <section className="theme-dark border-t border-line bg-ink-950 py-10 text-fg">
        <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/clinicas-esteticas" className="hover:text-accent">
              Clínicas estéticas
            </Link>
            <Link href="/contacto" className="hover:text-accent">
              Contacto
            </Link>
            <Link href="/privacidad" className="hover:text-accent">
              Privacidad
            </Link>
            <a
              href={whatsappLink(
                `Hola, quiero el Diagnóstico de pipeline inmobiliario (${country.name}).`
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
            Actualizado {landingMeta.lastUpdated} · {site.name}
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
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-line bg-paper-soft p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p className={`mt-2 font-mono text-xl ${accent ? 'text-accent' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

function PipelineInterface() {
  return (
    <div className="border border-line bg-ink-900/80 p-5 shadow-panel backdrop-blur-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="mono-label text-accent">Pipeline inmobiliario</p>
        <span className="font-mono text-[10px] text-faint">LIVE UI</span>
      </div>
      <div className="space-y-2">
        {pipelineStages.map((stage, i) => (
          <div
            key={stage}
            className="flex items-center gap-3 border border-line bg-surface px-3 py-3 transition-colors hover:border-accent/40"
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

function Atmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="reWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#02C39A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#111111" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          fill="url(#reWave)"
          d="M0,520 C240,460 380,600 600,540 C820,480 980,360 1180,400 C1320,430 1400,360 1440,380 L1440,800 L0,800 Z"
        />
      </svg>
      <div className="absolute inset-0 bg-grid-fade opacity-20 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
