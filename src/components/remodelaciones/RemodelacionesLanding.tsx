'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { FAQ } from '@/components/blocks/FAQ';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { BudgetCalculator } from '@/components/remodelaciones/BudgetCalculator';
import { DiagnosticForm } from '@/components/remodelaciones/DiagnosticForm';
import { StickyCta } from '@/components/remodelaciones/StickyCta';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';
import type { RemodelacionesMarket } from '@/lib/remodelaciones/markets';

type Props = {
  market: RemodelacionesMarket;
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function RemodelacionesLanding({ market }: Props) {
  const t = useTranslations('Remodelaciones');
  const problems = t.raw('problems') as { n: string; text: string }[];
  const howSteps = t.raw('howSteps') as { title: string; text: string; items?: string[] }[];
  const modules = t.raw('modules') as { title: string; text: string }[];
  const diffs = t.raw('diffs') as { title: string; text: string }[];
  const impl = t.raw('implSteps') as { n: string; title: string; text: string }[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  useEffect(() => {
    trackEvent('landing_view', { market: market.id, page: 'remodelaciones' });
  }, [market.id]);

  return (
    <div className="pb-20 md:pb-0">
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-28">
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
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-[2.35rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                {t('heroTitle')}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
                {t('heroSubtitle')}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button
                  href="#diagnostico"
                  size="lg"
                  iconRight="arrow-right"
                  onClick={() =>
                    trackEvent('click_cta_primary', { source: 'hero' })
                  }
                >
                  {t('heroCta')}
                </Button>
                <Button
                  href="#como-funciona"
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    trackEvent('click_cta_secondary', { source: 'hero' })
                  }
                >
                  {t('heroCtaSecondary')}
                </Button>
              </div>
              <p className="mt-4 font-mono text-xs text-faint">{t('heroMicro')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <Section tone="light">
        <SectionHeading
          eyebrow={t('problemEyebrow')}
          title={t('problemTitle')}
          description={t('problemIntro')}
          className="mb-12 max-w-3xl"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((item) => (
            <Reveal key={item.n} className="border border-line bg-surface p-6">
              <span className="mono-label text-accent">{item.n}</span>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{item.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-3xl border-l-2 border-accent pl-5 text-lg font-medium leading-snug text-fg sm:text-xl">
          {t('problemClose')}
        </p>
      </Section>

      {/* CALCULADORA */}
      <Section tone="dark" id="calculadora">
        <SectionHeading
          tone="light"
          eyebrow={t('calcEyebrow')}
          title={t('calcTitle')}
          className="mb-10 max-w-3xl"
        />
        <BudgetCalculator
          market={market}
          onAnalyze={() => scrollToId('diagnostico')}
        />
      </Section>

      {/* CÓMO FUNCIONA */}
      <Section tone="soft" id="como-funciona">
        <SectionHeading
          eyebrow={t('howEyebrow')}
          title={t('howTitle')}
          className="mb-12 max-w-3xl"
        />
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {howSteps.map((step, i) => (
            <li key={step.title} className="border border-line bg-surface p-6">
              <span className="mono-label text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold uppercase text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.text}</p>
              {step.items && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* AUTOMATIZAMOS */}
      <Section tone="light">
        <SectionHeading
          eyebrow={t('modulesEyebrow')}
          title={t('modulesTitle')}
          className="mb-12 max-w-3xl"
        />
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div key={mod.title} className="bg-paper p-6 sm:p-7">
              <h3 className="font-display text-lg font-semibold uppercase text-fg">
                {mod.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{mod.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* NO SUSTITUIMOS */}
      <Section tone="dark">
        <SectionHeading
          tone="light"
          eyebrow={t('integrateEyebrow')}
          title={t('integrateTitle')}
          description={t('integrateText')}
          className="mb-10 max-w-3xl"
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="border border-line bg-surface p-6">
            <p className="mono-label text-faint">{t('integrateTheirLabel')}</p>
            <p className="mt-3 text-lg font-medium text-fg">{t('integrateTheir')}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {(t.raw('integrateTheirItems') as string[]).map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
          <div className="hidden text-center font-mono text-xs uppercase tracking-[0.16em] text-accent lg:block">
            +
          </div>
          <div className="border border-accent/40 bg-surface p-6">
            <p className="mono-label text-accent">{t('integrateOursLabel')}</p>
            <p className="mt-3 text-lg font-medium text-fg">{t('integrateOurs')}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {(t.raw('integrateOursItems') as string[]).map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-[15px] text-muted">{t('integrateFocus')}</p>
      </Section>

      {/* DIFERENCIACIÓN */}
      <Section tone="dark">
        <SectionHeading
          tone="light"
          eyebrow={t('diffEyebrow')}
          title={t('diffTitle')}
          className="mb-12 max-w-3xl"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {diffs.map((item) => (
            <div key={item.title} className="border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold uppercase text-fg">
                {item.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* IMPLEMENTACIÓN */}
      <Section tone="light">
        <SectionHeading
          eyebrow={t('implEyebrow')}
          title={t('implTitle')}
          className="mb-12 max-w-3xl"
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impl.map((step) => (
            <li key={step.n} className="border border-line bg-surface p-6">
              <span className="mono-label text-accent">{step.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold uppercase text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* CONFIANZA */}
      <Section tone="soft">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden bg-ink-950">
            <Image
              src="/assets/stock/team.jpg"
              alt={t('trustImageAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow={t('trustEyebrow')}
              title={t('trustTitle')}
              description={t('trustText')}
            />
            <ul className="mt-8 space-y-3 text-[15px] text-muted">
              {(t.raw('trustPoints') as string[]).map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base font-medium text-fg">{t('trustPhrase')}</p>
          </div>
        </div>
      </Section>

      {/* CASOS PLACEHOLDER */}
      <Section tone="dark">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            tone="light"
            align="center"
            eyebrow={t('casesEyebrow')}
            title={t('casesTitle')}
            description={t('casesText')}
            className="mx-auto"
          />
          <div className="mt-8">
            <Button href="#diagnostico" size="lg" iconRight="arrow-right">
              {t('casesCta')}
            </Button>
          </div>
        </div>
      </Section>

      {/* PRECIO */}
      <Section tone="light" id="precio">
        <SectionHeading
          eyebrow={t('priceEyebrow')}
          title={t('priceTitle')}
          description={t('priceText')}
          className="mb-8 max-w-3xl"
        />
        <div className="border border-line bg-surface p-7 sm:p-9">
          {market.implementationFromUsd != null && (
            <p className="font-display text-3xl font-bold text-fg sm:text-4xl">
              {t('priceFrom', { amount: market.implementationFromUsd })}
            </p>
          )}
          {market.implementationFromLocal && (
            <p className="mt-2 text-lg text-muted">{market.implementationFromLocal}</p>
          )}
          {market.showMonthly && market.monthlyFromUsd != null ? (
            <p className="mt-4 font-mono text-sm text-accent">
              {t('priceMonthly', { amount: market.monthlyFromUsd })}
            </p>
          ) : (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-faint">
              {t('priceMonthlySoon')}
            </p>
          )}
        </div>
      </Section>

      {/* FORMULARIO */}
      <Section tone="dark" id="diagnostico">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              tone="light"
              eyebrow={t('formEyebrow')}
              title={t('formTitle')}
              description={t('formDesc')}
            />
            <p className="mt-6 text-[15px] leading-relaxed text-muted">
              {t('formMicro')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href={site.calendarUrl}
                size="lg"
                iconRight="arrow-right"
                onClick={() =>
                  trackEvent('click_agenda', { source: 'form_aside' })
                }
              >
                {t('thanksSchedule')}
              </Button>
              <Button
                href={whatsappLink(market.whatsappMessage)}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
                onClick={() =>
                  trackEvent('click_whatsapp', { source: 'form_aside' })
                }
              >
                WhatsApp
              </Button>
            </div>
          </div>
          <DiagnosticForm market={market} />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="soft">
        <SectionHeading
          eyebrow={t('faqEyebrow')}
          title={t('faqTitle')}
          align="center"
          className="mx-auto mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      {/* CTA final + WhatsApp */}
      <Section tone="brand">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold uppercase text-fg sm:text-4xl">
            {t('finalTitle')}
          </h2>
          <p className="mt-5 text-muted">{t('finalText')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="#diagnostico" size="lg" variant="accent" iconRight="arrow-right">
              {t('heroCta')}
            </Button>
            <Button
              href={whatsappLink(market.whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
              onClick={() => trackEvent('click_whatsapp', { source: 'final' })}
            >
              WhatsApp
            </Button>
            <Button
              href={site.calendarUrl}
              variant="ghost"
              size="lg"
              onClick={() => trackEvent('click_agenda', { source: 'final' })}
            >
              {t('thanksSchedule')}
            </Button>
          </div>
        </div>
      </Section>

      <StickyCta href="#diagnostico" />
    </div>
  );
}
