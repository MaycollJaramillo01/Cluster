'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ } from '@/components/blocks/FAQ';
import { ConversionCalculator } from './ConversionCalculator';
import { ContactBlock } from './ContactBlock';
import { DualCtas } from '@/components/landings/DualCtas';
import { LandingChrome } from '@/components/landings/LandingChrome';
import type { CountryConfig } from '@/lib/clinicas-esteticas/types';
import { formatMoney, countryCodes, countries } from '@/lib/clinicas-esteticas/countries';
import { site, whatsappLink } from '@/lib/site';
import { trackEvent } from '@/lib/clinicas-esteticas/tracking';

type Props = {
  country: CountryConfig;
};

export function ClinicasEsteticasLanding({ country }: Props) {
  const t = useTranslations('ClinicasEsteticas');
  const tc = useTranslations('Common');
  const tn = useTranslations('Nav');

  const problems = t.raw('problems') as { n: string; text: string }[];
  const pipelineStages = t.raw('pipelineStages') as string[];
  const systemModules = t.raw('systemModules') as { title: string; text: string }[];
  const followPipeline = t.raw('followPipeline') as string[];
  const followUpExamples = t.raw('followUpExamples') as string[];
  const financeItems = t.raw('financeItems') as string[];
  const clinicalSoftItems = t.raw('clinicalSoftItems') as string[];
  const clusterSystemItems = t.raw('clusterSystemItems') as string[];
  const integrations = t.raw('integrations') as string[];
  const demoSteps = t.raw('demoSteps') as { t: string; d: string }[];
  const handoffAutoItems = t.raw('handoffAutoItems') as string[];
  const handoffExamples = t.raw('handoffExamples') as string[];
  const sources = t.raw('sources') as string[];
  const demoLeads = t.raw('demoLeads') as {
    id: string;
    source: string;
    status: string;
    next: string;
  }[];
  const implementationSteps = t.raw('implementationSteps') as {
    n: string;
    title: string;
    text: string;
  }[];
  const trustItems = t.raw('trustItems') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const visStats = t.raw('visStats') as {
    adSpend: string;
    consultations: string;
    appointments: string;
    attended: string;
    treatments: string;
    revenue: string;
  };

  const pct = (a: number, b: number) =>
    b === 0 ? '0%' : `${Math.round((a / b) * 100)}%`;

  const waMsg = t('waLanding', { country: country.name });

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', { country: country.code, source });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', { country: country.code, source });

  return (
    <div className="clinicas-landing pt-[76px]">
      <LandingChrome
        vertical="clinicas-esteticas"
        marketId={country.code}
        whatsappMessage={waMsg}
      />

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="theme-dark border-b border-line bg-ink-950"
      >
        <div className="container-x flex flex-wrap items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          <Link href="/" className="hover:text-accent">
            {tc('home')}
          </Link>
          <span>/</span>
          <Link href="/clinicas-esteticas" className="hover:text-accent">
            {t('crumb')}
          </Link>
          <span>/</span>
          <span className="text-fg">{country.name}</span>
        </div>
      </nav>

      {/* Country switcher */}
      <div className="theme-dark border-b border-line bg-ink-900">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <span className="mono-label text-faint">{tc('market')}</span>
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
            <Eyebrow>{t('heroEyebrow')}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8">
              <DualCtas
                whatsappMessage={waMsg}
                onWhatsApp={() => trackWa('hero')}
                onSchedule={() => trackCal('hero')}
              />
            </div>
            <p className="mt-4 text-sm text-faint">{t('heroMicro')}</p>
            <p className="mt-2 text-sm text-accent">{t('responseTimePromise')}</p>
            <p className="mt-4">
              <a
                href="#calculadora"
                className="text-sm text-muted link-underline hover:text-accent"
              >
                {t('heroCalcLink')}
              </a>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <PipelineInterface
              label={t('pipelineLabel')}
              live={t('pipelineLive')}
              stages={pipelineStages}
            />
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <Section tone="light" id="problema">
        <SectionHeading
          eyebrow={t('problemEyebrow')}
          title={t('problemTitle')}
          description={t('problemIntro')}
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((block, i) => (
            <Reveal
              key={block.n}
              delay={i * 60}
              className="border border-line bg-paper p-6"
            >
              <span className="font-mono text-xs text-accent">{block.n}</span>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                {block.text}
              </p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg text-muted">{t('problemClose')}</p>
      </Section>

      {/* CALCULATOR */}
      <Section tone="dark" id="calculadora">
        <SectionHeading
          eyebrow={t('calcEyebrow')}
          title={t('calcTitle')}
          description={t('calcDesc')}
        />
        <div className="mt-12">
          <ConversionCalculator country={country} />
        </div>
      </Section>

      {/* FUNNEL VISIBILITY */}
      <Section tone="soft" id="visibilidad">
        <SectionHeading
          eyebrow={t('visEyebrow')}
          title={t('visTitle')}
          description={t('visDesc')}
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 border border-line bg-paper-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {t('visRef')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label={visStats.adSpend}
              value={formatMoney(country.demo.adSpend, country)}
            />
            <Stat
              label={visStats.consultations}
              value={String(country.demo.consultations)}
            />
            <Stat
              label={visStats.appointments}
              value={String(country.demo.appointments)}
            />
            <Stat
              label={visStats.attended}
              value={String(country.demo.attended)}
            />
            <Stat
              label={visStats.treatments}
              value={String(country.demo.treatments)}
            />
            <Stat
              label={visStats.revenue}
              value={formatMoney(country.demo.revenue, country)}
              accent
            />
          </div>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {(
              [
                [t('funnelMeta'), '—'],
                [
                  t('funnelConsulta'),
                  pct(country.demo.consultations, country.demo.consultations),
                ],
                [
                  t('funnelCita'),
                  pct(country.demo.appointments, country.demo.consultations),
                ],
                [
                  t('funnelAsistencia'),
                  pct(country.demo.attended, country.demo.appointments),
                ],
                [
                  t('funnelTratamiento'),
                  pct(country.demo.treatments, country.demo.attended),
                ],
              ] as [string, string][]
            ).map(([label, rate], idx, arr) => (
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
          eyebrow={t('modulesEyebrow')}
          title={t('modulesTitle')}
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {systemModules.map((m, i) => (
            <Reveal
              key={m.title}
              delay={i * 40}
              className="border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <h3 className="font-display text-xl normal-case tracking-normal">
                {m.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FOLLOW-UP */}
      <Section tone="light" id="seguimiento">
        <SectionHeading
          eyebrow={t('followEyebrow')}
          title={t('followTitle')}
          description={t('followDesc')}
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="border border-line bg-paper p-6">
            <ol className="space-y-0">
              {followPipeline.map((step, i) => (
                <li key={step} className="relative pl-8 pb-6 last:pb-0">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 bg-accent" />
                  {i < followPipeline.length - 1 && (
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
              {t('followClose')}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* FINANCING — optional module */}
      {country.financingEnabled && (
        <Section tone="soft" id="financiacion">
          <SectionHeading
            eyebrow={t('financeEyebrow')}
            title={t('financeTitle')}
            description={t('financeDesc')}
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {financeItems.map((item) => (
              <div
                key={item}
                className="border border-line bg-paper px-4 py-4 text-sm text-ink/80"
              >
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
          title={t('privacyTitle')}
          description={t('privacyDesc')}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal className="border border-line bg-surface p-6">
            <p className="mono-label text-faint">{t('clinicalSoftLabel')}</p>
            <ul className="mt-5 space-y-2 text-[15px] text-muted">
              {clinicalSoftItems.map((i) => (
                <li key={i} className="border-b border-line py-2">
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80} className="border border-accent/40 bg-surface p-6">
            <p className="mono-label text-accent">{t('clusterSystemLabel')}</p>
            <ul className="mt-5 space-y-2 text-[15px] text-muted">
              {clusterSystemItems.map((i) => (
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
          eyebrow={t('toolsEyebrow')}
          title={t('toolsTitle')}
          description={t('toolsDesc')}
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
        <p className="mt-8 max-w-2xl text-lg text-muted">{t('toolsClose')}</p>
      </Section>

      {/* FLUJO DE CONSULTA — sin video placeholder */}
      <Section tone="dark" id="demo">
        <SectionHeading
          eyebrow={t('demoEyebrow')}
          title={t('demoTitle')}
          description={t('demoDesc')}
        />
        <Reveal className="mt-12">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {demoSteps.map((step) => (
              <li
                key={step.t}
                className="border border-line bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <p className="mono-label text-accent">{step.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">{t('demoClose')}</p>
        </Reveal>
      </Section>

      {/* HUMAN HANDOFF */}
      <Section tone="soft" id="handoff">
        <SectionHeading
          eyebrow={t('handoffEyebrow')}
          title={t('handoffTitle')}
          description={t('handoffDesc')}
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal className="border border-line bg-paper p-7">
            <p className="mono-label text-muted">{t('handoffAutoLabel')}</p>
            <h3 className="mt-3 font-display text-3xl normal-case tracking-normal text-ink">
              {t('handoffAutoTitle')}
            </h3>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {handoffAutoItems.map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80} className="border border-line bg-paper p-7">
            <p className="mono-label text-accent">{t('handoffTeamLabel')}</p>
            <h3 className="mt-3 font-display text-3xl normal-case tracking-normal text-ink">
              {t('handoffTeamTitle')}
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
        <p className="mt-6 text-muted">{t('handoffClose')}</p>
      </Section>

      {/* DASHBOARD DEMO */}
      <Section tone="dark" id="dashboard">
        <SectionHeading
          eyebrow={t('dashEyebrow')}
          title={t('dashTitle')}
          description={t('dashDesc')}
        />
        <Reveal className="mt-12 border border-line bg-ink-950 p-6 sm:p-8">
          <div className="mb-6 inline-flex border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {t('dashRef')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat dark label={t('dashStatConsultations')} value="182" />
            <Stat dark label={t('dashStatAppointments')} value="91" />
            <Stat dark label={t('dashStatAttendance')} value="76" />
            <Stat dark label={t('dashStatTreatments')} value="38" />
            <Stat
              dark
              label={t('dashStatValue')}
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
                  <th className="py-3 pr-4 font-medium">{t('tablePatient')}</th>
                  <th className="py-3 pr-4 font-medium">{t('tableSource')}</th>
                  <th className="py-3 pr-4 font-medium">{t('tableStatus')}</th>
                  <th className="py-3 font-medium">{t('tableNext')}</th>
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
        <SectionHeading eyebrow={t('implEyebrow')} title={t('implTitle')} />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {implementationSteps.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 50}
              className="border border-line bg-paper p-5"
            >
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
            eyebrow={t('trustEyebrow')}
            title={t('trustTitle')}
            description={t('trustDesc')}
          />
          <Reveal className="border border-line bg-surface p-6">
            <p className="mono-label text-accent">{site.name}</p>
            <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {trustItems.map((item) => (
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
          eyebrow={t('casesEyebrow')}
          title={t('casesTitle')}
          description={t('casesDesc')}
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
          eyebrow={t('priceEyebrow')}
          title={t('priceTitle')}
          description={t('priceDesc')}
        />
        <Reveal className="mt-10 max-w-xl border border-line bg-paper p-8">
          <p className="mono-label text-accent">{t('priceProvisional')}</p>
          <p className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            {t('priceFrom', { amount: formatMoney(country.setupFrom, country) })}
          </p>
          <p className="mt-2 text-sm text-muted">{t('priceNote')}</p>
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-sm text-muted">{tc('monthlyDefinedByScope')}</p>
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
          eyebrow={t('contactEyebrow')}
          title={t('contactTitle')}
          description={t('contactDesc')}
        />
        <div className="mt-10 max-w-3xl">
          <ContactBlock country={country} />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light" id="faq">
        <SectionHeading
          eyebrow={t('faqEyebrow')}
          title={t('faqTitle')}
          align="center"
        />
        <div className="mt-12">
          <FAQ items={faqs} />
        </div>
      </Section>

      {/* Internal links + last updated */}
      <section className="theme-dark border-t border-line bg-ink-950 py-10 text-fg">
        <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/automatizaciones-ia" className="hover:text-accent">
              {tn('automation')}
            </Link>
            <Link href="/contacto" className="hover:text-accent">
              {tc('contact')}
            </Link>
            <Link href="/privacidad" className="hover:text-accent">
              {tc('privacy')}
            </Link>
            <Link href="/casos-de-exito" className="hover:text-accent">
              {tn('cases')}
            </Link>
            <a
              href={whatsappLink(t('waShort', { country: country.name }))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('WhatsAppClick', { country: country.code })
              }
              className="hover:text-accent"
            >
              {tc('whatsapp')}
            </a>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            {tc('lastUpdated', { date: t('lastUpdated') })}
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
    <div
      className={`border border-line p-4 ${dark ? 'bg-surface' : 'bg-paper-soft'}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-xl ${accent ? 'text-accent' : 'text-fg'}`}
      >
        {value}
      </p>
    </div>
  );
}

function PipelineInterface({
  label,
  live,
  stages,
}: {
  label: string;
  live: string;
  stages: string[];
}) {
  return (
    <div className="border border-line bg-ink-900/80 p-5 shadow-panel backdrop-blur-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="mono-label text-accent">{label}</p>
        <span className="font-mono text-[10px] text-faint">{live}</span>
      </div>
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div
            key={stage}
            className="flex items-center gap-3 border border-line bg-surface px-3 py-3 transition-colors hover:border-accent/40"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-7 w-7 items-center justify-center bg-accent/15 font-mono text-[10px] text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm text-fg">{stage}</span>
            {i < stages.length - 1 && (
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
