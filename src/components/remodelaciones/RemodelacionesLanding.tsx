'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FAQ } from '@/components/blocks/FAQ';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { DualCtas } from '@/components/landings/DualCtas';
import { LandingChrome } from '@/components/landings/LandingChrome';
import { BudgetCalculator } from '@/components/remodelaciones/BudgetCalculator';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { MinimalLeadForm } from '@/components/verticals/MinimalLeadForm';
import { trackEvent } from '@/lib/analytics';
import { site } from '@/lib/site';
import {
  CALCULATOR_STORAGE_KEY,
  formatMoney,
  REMODELACIONES_MARKETS,
  type RemodelacionesMarket,
  type RemodelacionesMarketId,
} from '@/lib/remodelaciones/markets';

type Props = {
  market: RemodelacionesMarket;
};

const MARKET_IDS = Object.keys(
  REMODELACIONES_MARKETS,
) as RemodelacionesMarketId[];

/** Demo numbers for the visibility section (illustrative, not a real case). */
const DEMO = {
  inquiries: 120,
  qualified: 84,
  visits: 52,
  quotes: 40,
  won: 12,
};

export function RemodelacionesLanding({ market }: Props) {
  const t = useTranslations('Remodelaciones');
  const tc = useTranslations('Common');
  const tn = useTranslations('Nav');

  const problems = t.raw('problems') as { n: string; text: string }[];
  const modules = t.raw('modules') as { title: string; text: string }[];
  const followPipeline = t.raw('followPipeline') as string[];
  const followUpExamples = t.raw('followUpExamples') as string[];
  const opsSoftItems = t.raw('opsSoftItems') as string[];
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
  const implementationSteps = t.raw('implSteps5') as {
    n: string;
    title: string;
    text: string;
  }[];
  const trustPoints = t.raw('trustPoints') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const visStats = t.raw('visStats') as {
    inquiries: string;
    qualified: string;
    visits: string;
    quotes: string;
    won: string;
    pipelineValue: string;
  };

  const pct = (a: number, b: number) =>
    b === 0 ? '0%' : `${Math.round((a / b) * 100)}%`;

  const pipelineValue = formatMoney(
    market.id === 'cl'
      ? 48_000_000
      : market.id === 'mx'
        ? 1_200_000
        : market.id === 'es'
          ? 96_000
          : 48_000,
    market,
  );

  const trackWa = (source: string) =>
    trackEvent('WhatsAppClick', {
      market: market.id,
      source,
      page: 'remodelaciones',
    });
  const trackCal = (source: string) =>
    trackEvent('ScheduleStart', {
      market: market.id,
      source,
      page: 'remodelaciones',
    });

  return (
    <div className="remodelaciones-landing pt-[76px] pb-20 md:pb-0">
      <LandingChrome
        vertical="remodelaciones"
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
          <Link href="/remodelaciones" className="hover:text-accent">
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
            const m = REMODELACIONES_MARKETS[id];
            const active = id === market.id;
            return (
              <Link
                key={id}
                href={`/remodelaciones/${id}`}
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
          <>
            <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(70%_55%_at_20%_0%,black,transparent)]"
              aria-hidden="true"
            />
          </>
        )}
        <div className="grain absolute inset-0" aria-hidden="true" />

        <div className="container-x relative z-[1]">
          <div className="max-w-xl">
            <Reveal>
              <Eyebrow>{t('heroEyebrow')}</Eyebrow>
              <h1 className="mt-5 text-[2.35rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-6xl">
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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <BudgetCalculator market={market} />
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
            <Stat label={visStats.inquiries} value={String(DEMO.inquiries)} />
            <Stat label={visStats.qualified} value={String(DEMO.qualified)} />
            <Stat label={visStats.visits} value={String(DEMO.visits)} />
            <Stat label={visStats.quotes} value={String(DEMO.quotes)} />
            <Stat label={visStats.won} value={String(DEMO.won)} />
            <Stat label={visStats.pipelineValue} value={pipelineValue} accent />
          </div>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {(
              [
                [t('funnelConsulta'), pct(DEMO.inquiries, DEMO.inquiries)],
                [t('funnelCalificada'), pct(DEMO.qualified, DEMO.inquiries)],
                [t('funnelVisita'), pct(DEMO.visits, DEMO.qualified)],
                [t('funnelPresupuesto'), pct(DEMO.quotes, DEMO.visits)],
                [t('funnelCierre'), pct(DEMO.won, DEMO.quotes)],
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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
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

      {/* PRIVACIDAD / SOFTWARE */}
      <Section tone="dark" id="privacidad-datos">
        <SectionHeading
          eyebrow={t('integrateEyebrow')}
          title={t('privacyTitle')}
          description={t('privacyDesc')}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal className="border border-line bg-surface p-6">
            <p className="mono-label text-faint">{t('opsSoftLabel')}</p>
            <ul className="mt-5 space-y-2 text-[15px] text-muted">
              {opsSoftItems.map((i) => (
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
        <p className="mt-6 text-sm text-faint">{t('integrateFocus')}</p>
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

      {/* DEMO / RECORRIDO */}
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
            <Stat dark label={t('dashBudgeted')} value={pipelineValue} />
            <Stat dark label={t('dashWon')} value={String(DEMO.won)} />
            <Stat dark label={t('dashPending')} value="18" />
            <Stat dark label={t('dashLost')} value="7" />
            <Stat
              dark
              label={t('dashConversion')}
              value={pct(DEMO.won, DEMO.quotes)}
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
                  <th className="py-3 pr-4 font-medium">{t('tableOpp')}</th>
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

      {/* EQUIPO / CONFIANZA */}
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
              {trustPoints.map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-fg">{t('trustPhrase')}</p>
          </Reveal>
        </div>
      </Section>

      {/* PRUEBA SOCIAL */}
      <Section tone="soft" id="prueba-social">
        <SectionHeading
          eyebrow={t('casesEyebrow')}
          title={t('casesTitle')}
          description={t('casesText')}
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
      <Section tone="light" id="precio">
        <SectionHeading
          eyebrow={t('priceEyebrow')}
          title={t('priceTitle')}
          description={t('priceText')}
        />
        <Reveal className="mt-10 max-w-xl border border-line bg-paper p-8">
          <p className="mono-label text-accent">{tc('provisionalPrice')}</p>
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
            <p className="mt-4 text-sm text-muted">{t('priceMonthlySoon')}</p>
          )}
          <DualCtas
            className="mt-6"
            size="md"
            whatsappMessage={market.whatsappMessage}
            onWhatsApp={() => trackWa('precio')}
            onSchedule={() => trackCal('precio')}
          />
        </Reveal>
      </Section>

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
              i18nNamespace="Remodelaciones"
              vertical="remodelaciones"
              country={market.country}
              landingPath={`/remodelaciones/${market.id}`}
              origen={`remodelaciones-${market.id}`}
              servicio="Conversión presupuestos remodelaciones"
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
            <Link href="/clinicas-dentales" className="hover:text-accent">
              {tn('clinicasDentales')}
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
