'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ } from '@/components/blocks/FAQ';
import { PipelineCalculator } from './PipelineCalculator';
import { ContactBlock } from './ContactBlock';
import { LandingChrome } from '@/components/landings/LandingChrome';
import { DualCtas } from '@/components/landings/DualCtas';
import type { CountryConfig } from '@/lib/inmobiliarias/types';
import { formatMoney, countryCodes, countries } from '@/lib/inmobiliarias/countries';
import { site, whatsappLink } from '@/lib/site';
import { trackEvent } from '@/lib/inmobiliarias/tracking';

type Props = {
  country: CountryConfig;
};

export function InmobiliariasLanding({ country }: Props) {
  const t = useTranslations('Inmobiliarias');
  const tc = useTranslations('Common');
  const tn = useTranslations('Nav');

  const problems = t.raw('problems') as { n: string; text: string }[];
  const qualificationFields = t.raw('qualificationFields') as string[];
  const leadScores = t.raw('leadScores') as { level: string; text: string }[];
  const assignmentVars = t.raw('assignmentVars') as string[];
  const visitFeatures = t.raw('visitFeatures') as string[];
  const postVisitFlow = t.raw('postVisitFlow') as { day: string; text: string }[];
  const nurturingBuckets = t.raw('nurturingBuckets') as {
    range: string;
    label: string;
  }[];
  const discardReasons = t.raw('discardReasons') as string[];
  const projectSteps = t.raw('projectSteps') as string[];
  const intlSteps = t.raw('intlSteps') as string[];
  const dashStats = t.raw('dashStats') as {
    leads: string;
    contacted: string;
    qualified: string;
    visits: string;
    negotiations: string;
    reservations: string;
    sales: string;
  };
  const dashSources = t.raw('dashSources') as string[];
  const dashAgents = t.raw('dashAgents') as string[];
  const responseTimes = t.raw('responseTimes') as { id: string; time: string }[];
  const implementationSteps = t.raw('implementationSteps') as {
    n: string;
    title: string;
    text: string;
  }[];
  const demoSteps = t.raw('demoSteps') as { t: string; d: string }[];
  const handoffAutoItems = t.raw('handoffAutoItems') as string[];
  const handoffAgentItems = t.raw('handoffAgentItems') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  const waMsg = t('waLanding', { country: country.name });

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', { country: country.code, source });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', { country: country.code, source });

  return (
    <div className="inmobiliarias-landing pt-[76px]">
      <LandingChrome
        vertical="inmobiliarias"
        marketId={country.code}
        whatsappMessage={waMsg}
      />

      <nav
        aria-label="Breadcrumb"
        className="theme-dark border-b border-line bg-ink-950"
      >
        <div className="container-x flex flex-wrap items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          <Link href="/" className="hover:text-accent">
            {tc('home')}
          </Link>
          <span>/</span>
          <Link href="/inmobiliarias" className="hover:text-accent">
            {t('crumb')}
          </Link>
          <span>/</span>
          <span className="text-fg">{country.name}</span>
        </div>
      </nav>

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
        <Atmosphere />
        <div className="container-x relative z-[1] grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <Reveal>
            <Eyebrow>{t('heroEyebrow')}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
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
            <PipelineInterface />
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
              delay={i * 50}
              className="border border-line bg-paper p-6 lg:last:col-span-2"
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
          <PipelineCalculator country={country} />
        </div>
      </Section>

      {/* MULTICHANNEL */}
      <Section tone="soft" id="multicanal">
        <SectionHeading
          eyebrow={t('multiEyebrow')}
          title={t('multiTitle')}
          description={t('multiDesc')}
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
            <p className="mono-label text-accent">{t('multiSystemLabel')}</p>
            <p className="mt-2 text-sm text-muted">{t('multiSystemText')}</p>
          </div>
          <div className="my-6 font-mono text-sm text-accent">↓</div>
          <p className="text-sm text-muted">{t('multiAgents')}</p>
          <p className="mt-4 max-w-2xl text-sm text-faint">{t('multiApiNote')}</p>
        </Reveal>
      </Section>

      {/* SPEED RESPONSE */}
      <Section tone="dark" id="respuesta">
        <SectionHeading
          eyebrow={t('responseEyebrow')}
          title={t('responseTitle')}
          description={t('responseDesc')}
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
          eyebrow={t('scoringEyebrow')}
          title={t('scoringTitle')}
          description={t('scoringDesc')}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {leadScores.map((s, i) => (
            <Reveal
              key={s.level}
              delay={i * 60}
              className="border border-line bg-paper p-6"
            >
              <p className="mono-label text-accent">{s.level}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
                {s.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ASSIGNMENT */}
      <Section tone="soft" id="asignacion">
        <SectionHeading
          eyebrow={t('assignEyebrow')}
          title={t('assignTitle')}
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
            <p className="mono-label text-faint">{t('assignLeadLabel')}</p>
            <p className="mt-3 text-sm text-ink">{country.assignmentExample.lead}</p>
          </div>
          <span className="hidden text-center font-mono text-accent md:block">
            →
          </span>
          <div className="border border-accent/40 bg-paper p-5">
            <p className="mono-label text-accent">{t('assignAgentLabel')}</p>
            <p className="mt-3 text-sm text-ink">
              {country.assignmentExample.agent}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* VISITS */}
      <Section tone="dark" id="visitas">
        <SectionHeading
          eyebrow={t('visitsEyebrow')}
          title={t('visitsTitle')}
          description={t('visitsDesc')}
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visitFeatures.map((f) => (
            <div
              key={f}
              className="border border-line bg-surface px-4 py-4 text-sm text-muted"
            >
              {f}
            </div>
          ))}
        </div>
      </Section>

      {/* POST VISIT */}
      <Section tone="light" id="post-visita">
        <SectionHeading
          eyebrow={t('postVisitEyebrow')}
          title={t('postVisitTitle')}
          description={t('postVisitDesc')}
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
            <p className="mono-label text-muted">{t('matchingBlurbLabel')}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
              {t('matchingBlurb')}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* NURTURING */}
      <Section tone="dark" id="nurturing">
        <SectionHeading
          eyebrow={t('nurtureEyebrow')}
          title={t('nurtureTitle')}
          description={t('nurtureDesc')}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nurturingBuckets.map((b, i) => (
            <Reveal
              key={b.range}
              delay={i * 40}
              className="border border-line bg-surface p-5"
            >
              <p className="mono-label text-accent">{b.range}</p>
              <p className="mt-3 text-sm text-muted">{b.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* BUYER MATCHING */}
      <Section tone="soft" id="matching">
        <SectionHeading
          eyebrow={t('buyerEyebrow')}
          title={t('buyerTitle')}
          description={t('buyerDesc')}
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
          eyebrow={t('projectsEyebrow')}
          title={t('projectsTitle')}
          description={t('projectsDesc')}
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {projectSteps.map((step, i) => (
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
            eyebrow={t('intlEyebrow')}
            title={t('intlTitle')}
            description={t('intlDesc')}
          />
          <Reveal className="mt-12 flex flex-wrap items-center gap-2 text-sm text-muted">
            {intlSteps.map((step, i, arr) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="border border-line bg-surface px-3 py-2">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-accent">→</span>}
              </span>
            ))}
          </Reveal>
        </Section>
      )}

      {/* DASHBOARD */}
      <Section tone="soft" id="dashboard">
        <SectionHeading
          eyebrow={t('dashEyebrow')}
          title={t('dashTitle')}
          description={t('dashDesc')}
        />
        <Reveal className="mt-12 border border-line bg-paper p-6 sm:p-8">
          <div className="mb-6 inline-flex border border-line bg-paper-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {t('dashRef')}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={dashStats.leads} value={String(country.demo.leads)} />
            <Stat
              label={dashStats.contacted}
              value={String(country.demo.contacted)}
            />
            <Stat
              label={dashStats.qualified}
              value={String(country.demo.qualified)}
            />
            <Stat label={dashStats.visits} value={String(country.demo.visits)} />
            <Stat
              label={dashStats.negotiations}
              value={String(country.demo.negotiations)}
            />
            <Stat
              label={dashStats.reservations}
              value={String(country.demo.reservations)}
            />
            <Stat
              label={dashStats.sales}
              value={String(country.demo.sales)}
              accent
            />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mono-label text-faint">{t('dashBySource')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashSources.map((s) => (
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
              <p className="mono-label text-faint">{t('dashByAgent')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashAgents.map((s) => (
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
          <p className="mt-6 text-sm text-faint">{t('dashMetrics')}</p>
        </Reveal>
      </Section>

      {/* SPEED TO LEAD */}
      <Section tone="dark" id="speed">
        <SectionHeading
          eyebrow={t('speedEyebrow')}
          title={t('speedTitle')}
          description={t('speedDesc')}
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
            <p className="mono-label text-faint">{t('avgResponseLabel')}</p>
            <p className="mt-2 font-mono text-lg text-fg">
              {t('avgResponseValue')}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* CRM */}
      <Section tone="light" id="crm">
        <SectionHeading
          eyebrow={t('crmEyebrow')}
          title={t('crmTitle')}
          description={t('crmDesc')}
        />
      </Section>

      {/* IMPLEMENTATION */}
      <Section tone="soft" id="implementacion">
        <SectionHeading
          eyebrow={t('implEyebrow')}
          title={t('implTitle')}
          description={t('implDesc')}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {implementationSteps.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 40}
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

      {/* FLOW DEMO */}
      <Section tone="dark" id="demo">
        <SectionHeading eyebrow={t('demoEyebrow')} title={t('demoTitle')} />
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
        </Reveal>
      </Section>

      {/* HANDOFF */}
      <Section tone="light" id="handoff">
        <SectionHeading
          eyebrow={t('handoffEyebrow')}
          title={t('handoffTitle')}
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal className="border border-line bg-paper p-7">
            <p className="mono-label text-muted">{t('handoffAutoLabel')}</p>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {handoffAutoItems.map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={60} className="border border-line bg-paper p-7">
            <p className="mono-label text-accent">{t('handoffAgentLabel')}</p>
            <ul className="mt-5 space-y-2 text-sm text-ink/75">
              {handoffAgentItems.map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* REACTIVATION */}
      <Section tone="dark" id="reactivacion">
        <SectionHeading
          eyebrow={t('reactEyebrow')}
          title={t('reactTitle')}
          description={t('reactDesc')}
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
          eyebrow={t('sellersEyebrow')}
          title={t('sellersTitle')}
          description={t('sellersDesc')}
        />
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

      {/* CONTACTO */}
      <Section tone="soft" id="contacto">
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

      <section className="theme-dark border-t border-line bg-ink-950 py-10 text-fg">
        <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/clinicas-esteticas" className="hover:text-accent">
              {tn('clinicasEsteticas')}
            </Link>
            <Link href="/contacto" className="hover:text-accent">
              {tc('contact')}
            </Link>
            <Link href="/privacidad" className="hover:text-accent">
              {tc('privacy')}
            </Link>
            <a
              href={whatsappLink(
                t('waDiagnostico', { country: country.name })
              )}
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
            {t('lastUpdated')} · {site.name}
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
      <p
        className={`mt-2 font-mono text-xl ${accent ? 'text-accent' : 'text-ink'}`}
      >
        {value}
      </p>
    </div>
  );
}

function PipelineInterface() {
  const t = useTranslations('Inmobiliarias');
  const pipelineStages = t.raw('pipelineStages') as string[];

  return (
    <div className="border border-line bg-ink-900/80 p-5 shadow-panel backdrop-blur-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="mono-label text-accent">{t('pipelineLabel')}</p>
        <span className="font-mono text-[10px] text-faint">
          {t('pipelineLive')}
        </span>
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
