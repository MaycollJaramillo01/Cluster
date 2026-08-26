'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FAQ } from '@/components/blocks/FAQ';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { DualCtas } from '@/components/landings/DualCtas';
import { LandingChrome } from '@/components/landings/LandingChrome';
import { TreatmentCalculator } from '@/components/clinicas-dentales/TreatmentCalculator';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { MinimalLeadForm } from '@/components/verticals/MinimalLeadForm';
import { trackEvent } from '@/lib/analytics';
import { site } from '@/lib/site';
import {
  CALCULATOR_STORAGE_KEY,
  CLINICAS_DENTALES_MARKETS,
  formatMoney,
  type ClinicasDentalesMarket,
  type ClinicasDentalesMarketId,
} from '@/lib/clinicas-dentales/markets';

type Props = {
  market: ClinicasDentalesMarket;
};

const MARKET_IDS = Object.keys(
  CLINICAS_DENTALES_MARKETS,
) as ClinicasDentalesMarketId[];

/** Demo numbers for visibility (illustrative). */
const DEMO = {
  evaluations: 80,
  quotes: 48,
  followUps: 36,
  accepted: 17,
  started: 14,
};

export function ClinicasDentalesLanding({ market }: Props) {
  const t = useTranslations('ClinicasDentales');
  const tc = useTranslations('Common');
  const tn = useTranslations('Nav');

  const problems = t.raw('problems') as { n: string; text: string }[];
  const systemModules = t.raw('systemModules') as {
    title: string;
    text: string;
  }[];
  const followPipeline = t.raw('followPipeline') as string[];
  const followUpExamples = t.raw('followUpExamples') as string[];
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
    evaluations: string;
    quotes: string;
    followUps: string;
    accepted: string;
    started: string;
    pipelineValue: string;
  };

  const pct = (a: number, b: number) =>
    b === 0 ? '0%' : `${Math.round((a / b) * 100)}%`;

  const pipelineValue = formatMoney(
    market.defaultTicket * (DEMO.quotes - DEMO.accepted),
    market,
  );
  const attributedValue = formatMoney(
    market.defaultTicket * DEMO.started,
    market,
  );

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', {
      market: market.id,
      source,
      page: 'clinicas-dentales',
    });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', {
      market: market.id,
      source,
      page: 'clinicas-dentales',
    });

  return (
    <div className="clinicas-dentales-landing pt-[76px] pb-20 md:pb-0">
      <LandingChrome
        vertical="clinicas-dentales"
        marketId={market.id}
        whatsappMessage={market.whatsappMessage}
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
          <Link href="/clinicas-dentales" className="hover:text-accent">
            {t('crumb')}
          </Link>
          <span>/</span>
          <span className="text-fg">{market.country}</span>
        </div>
      </nav>

      <div className="theme-dark border-b border-line bg-ink-900">
        <div className="container-x flex flex-wrap items-center gap-2 py-3">
          <span className="mono-label text-faint">{tc('market')}</span>
          {MARKET_IDS.map((id) => {
            const m = CLINICAS_DENTALES_MARKETS[id];
            const active = id === market.id;
            return (
              <Link
                key={id}
                href={`/clinicas-dentales/${id}`}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? 'bg-accent text-accent-fg'
                    : 'border border-line text-muted hover:border-accent hover:text-fg'
                }`}
              >
                {m.country}
              </Link>
            );
          })}
        </div>
      </div>

      {/* HERO — video actual conservado */}
      <section className="relative overflow-hidden bg-ink-950 pt-20 pb-20 sm:pt-24 sm:pb-28">
        {market.videoSrc ? (
          <HeroBackgroundVideo src={market.videoSrc} />
        ) : (
          <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
        )}
        <div className="grain absolute inset-0" aria-hidden="true" />

        <div className="container-x relative z-[1]">
          <div className="max-w-xl">
            <Reveal>
              <Eyebrow>{t('heroEyebrow')}</Eyebrow>
              <h1 className="mt-5 text-[2.15rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-[3.25rem]">
                {t('heroTitle')}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
                {t('heroSubtitle')}
              </p>
              <div className="mt-8">
                <DualCtas
                  whatsappMessage={market.whatsappMessage}
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
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <Section tone="light" id="problema">
        <SectionHeading
          eyebrow={t('problemEyebrow')}
          title={t('problemTitle')}
          description={t('problemIntro')}
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {problems.map((item, i) => (
            <Reveal
              key={item.n}
              delay={i * 50}
              className="border border-line bg-paper p-6"
            >
              <span className="font-mono text-xs text-accent">{item.n}</span>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                {item.text}
              </p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg text-muted">{t('problemClose')}</p>
      </Section>

      {/* CALCULADORA */}
      <Section tone="dark" id="calculadora">
        <SectionHeading eyebrow={t('calcEyebrow')} title={t('calcTitle')} />
        <div className="mt-12">
          <TreatmentCalculator market={market} />
        </div>
      </Section>

      {/* VISIBILIDAD */}
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
              label={visStats.evaluations}
              value={String(DEMO.evaluations)}
            />
            <Stat label={visStats.quotes} value={String(DEMO.quotes)} />
            <Stat label={visStats.followUps} value={String(DEMO.followUps)} />
            <Stat label={visStats.accepted} value={String(DEMO.accepted)} />
            <Stat label={visStats.started} value={String(DEMO.started)} />
            <Stat label={visStats.pipelineValue} value={pipelineValue} accent />
          </div>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {(
              [
                [t('funnelValoracion'), pct(DEMO.evaluations, DEMO.evaluations)],
                [t('funnelPresupuesto'), pct(DEMO.quotes, DEMO.evaluations)],
                [t('funnelSeguimiento'), pct(DEMO.followUps, DEMO.quotes)],
                [t('funnelAceptacion'), pct(DEMO.accepted, DEMO.quotes)],
                [t('funnelInicio'), pct(DEMO.started, DEMO.accepted)],
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

      {/* SISTEMA */}
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

      {/* SEGUIMIENTO */}
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

      {/* PRIVACIDAD */}
      <Section tone="dark" id="privacidad-datos">
        <SectionHeading
          eyebrow={t('clinicalSoftLabel')}
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
        <p className="mt-6 text-sm text-faint">{t('integrateNote')}</p>
      </Section>

      {/* INTEGRACIONES */}
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

      {/* DEMO */}
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

      {/* HANDOFF */}
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

      {/* DASHBOARD */}
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
            <Stat
              dark
              label={t('dashStatEvaluations')}
              value={String(DEMO.evaluations)}
            />
            <Stat
              dark
              label={t('dashStatQuotes')}
              value={String(DEMO.quotes)}
            />
            <Stat
              dark
              label={t('dashStatAccepted')}
              value={String(DEMO.accepted)}
            />
            <Stat
              dark
              label={t('dashStatStarted')}
              value={String(DEMO.started)}
            />
            <Stat dark label={t('dashStatValue')} value={attributedValue} accent />
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

      {/* IMPLEMENTACIÓN */}
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

      {/* EQUIPO */}
      <Section tone="dark" id="equipo">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow={t('trustEyebrow')}
            title={t('trustTitle')}
            description={t('trustText')}
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

      {/* PRUEBA SOCIAL */}
      <Section tone="soft" id="prueba-social">
        <SectionHeading
          eyebrow={t('casesEyebrow')}
          title={t('casesTitle')}
          description={t('casesDesc')}
        />
        <div className="mt-8">
          <DualCtas
            whatsappMessage={market.whatsappMessage}
            onWhatsApp={() => trackWa('casos')}
            onSchedule={() => trackCal('casos')}
          />
        </div>
      </Section>

      {/* PRECIO */}
      {(market.implementationFromUsd != null ||
        market.implementationFromLocal) && (
        <Section tone="light" id="precio">
          <SectionHeading
            eyebrow={t('priceEyebrow')}
            title={t('priceTitle')}
            description={t('priceText')}
          />
          <Reveal className="mt-10 max-w-xl border border-line bg-paper p-8">
            <p className="mono-label text-accent">{t('priceProvisional')}</p>
            {market.implementationFromUsd != null && (
              <p className="mt-4 font-display text-4xl text-ink sm:text-5xl">
                {t('priceFrom', { amount: market.implementationFromUsd })}
              </p>
            )}
            {market.implementationFromLocal && (
              <p className="mt-2 text-sm text-muted">
                {market.implementationFromLocal}
              </p>
            )}
            {market.showMonthly && market.monthlyFromUsd != null ? (
              <p className="mt-4 font-mono text-sm text-accent">
                {t('priceMonthly', { amount: market.monthlyFromUsd })}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted">
                {tc('monthlyDefinedByScope')}
              </p>
            )}
            <p className="mt-2 text-sm text-faint">{t('priceNote')}</p>
            <DualCtas
              className="mt-6"
              size="md"
              whatsappMessage={market.whatsappMessage}
              onWhatsApp={() => trackWa('precio')}
              onSchedule={() => trackCal('precio')}
            />
          </Reveal>
        </Section>
      )}

      {/* CONTACTO */}
      <Section tone="dark" id="contacto">
        <SectionHeading
          eyebrow={t('formEyebrow')}
          title={t('contactSectionTitle')}
          description={t('formDesc')}
        />
        <div className="mt-10 max-w-3xl space-y-8">
          <div>
            <p className="mono-label text-accent">{tc('talkToTeam')}</p>
            <p className="mt-3 max-w-xl text-[15px] text-muted">
              {t('formMicro')}
            </p>
            <DualCtas
              className="mt-6"
              whatsappMessage={market.whatsappMessage}
              onWhatsApp={() => trackWa('contact_section')}
              onSchedule={() => trackCal('contact_section')}
            />
          </div>
          <div className="border-t border-line pt-8">
            <p className="mb-5 text-sm text-muted">{t('formTitle')}</p>
            <MinimalLeadForm
              i18nNamespace="ClinicasDentales"
              vertical="clinicas-dentales"
              country={market.country}
              landingPath={`/clinicas-dentales/${market.id}`}
              origen={`clinicas-dentales-${market.id}`}
              servicio="Conversión tratamientos clínicas dentales"
              whatsappMessage={market.whatsappMessage}
              calculatorStorageKey={CALCULATOR_STORAGE_KEY}
            />
          </div>
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
            <Link href="/inmobiliarias" className="hover:text-accent">
              {tn('inmobiliarias')}
            </Link>
            <Link href="/remodelaciones" className="hover:text-accent">
              {tn('remodelaciones')}
            </Link>
            <Link href="/contacto" className="hover:text-accent">
              {tc('contact')}
            </Link>
            <Link href="/privacidad" className="hover:text-accent">
              {tc('privacy')}
            </Link>
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
