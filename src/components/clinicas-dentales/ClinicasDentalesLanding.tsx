'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { FAQ } from '@/components/blocks/FAQ';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { TreatmentCalculator } from '@/components/clinicas-dentales/TreatmentCalculator';
import { MinimalLeadForm } from '@/components/verticals/MinimalLeadForm';
import { StickyWhatsAppCta } from '@/components/verticals/StickyWhatsAppCta';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';
import {
  CALCULATOR_STORAGE_KEY,
  type ClinicasDentalesMarket,
} from '@/lib/clinicas-dentales/markets';

type Props = {
  market: ClinicasDentalesMarket;
};

export function ClinicasDentalesLanding({ market }: Props) {
  const t = useTranslations('ClinicasDentales');
  const problems = t.raw('problems') as { n: string; text: string }[];
  const benefits = t.raw('benefits') as { title: string; text: string }[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  useEffect(() => {
    trackEvent('PageView', { market: market.id, page: 'clinicas-dentales' });
    trackEvent('landing_view', { market: market.id, page: 'clinicas-dentales' });
  }, [market.id]);

  return (
    <div className="pb-20 md:pb-0">
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-28">
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
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-[2.15rem] font-semibold leading-[0.98] tracking-tight text-fg sm:text-5xl lg:text-[3.25rem]">
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
                  href={whatsappLink(market.whatsappMessage)}
                  external
                  variant="whatsapp"
                  size="lg"
                  icon="whatsapp"
                  onClick={() =>
                    trackEvent('WhatsAppClick', {
                      source: 'hero',
                      page: 'clinicas-dentales',
                    })
                  }
                >
                  {t('ctaWhatsapp')}
                </Button>
                <Button
                  href={site.calendarUrl}
                  size="lg"
                  iconRight="arrow-right"
                  onClick={() =>
                    trackEvent('AppointmentStart', {
                      source: 'hero',
                      page: 'clinicas-dentales',
                    })
                  }
                >
                  {t('ctaSchedule')}
                </Button>
              </div>
              <p className="mt-4 font-mono text-xs text-faint">{t('heroMicro')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading
          eyebrow={t('problemEyebrow')}
          title={t('problemTitle')}
          description={t('problemIntro')}
          className="mb-10 max-w-3xl"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {problems.map((item) => (
            <Reveal key={item.n} className="border border-line bg-surface p-6">
              <span className="mono-label text-accent">{item.n}</span>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {item.text}
              </p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg font-medium leading-snug text-fg">
          {t('problemClose')}
        </p>
      </Section>

      <Section tone="dark" id="calculadora">
        <SectionHeading
          tone="light"
          eyebrow={t('calcEyebrow')}
          title={t('calcTitle')}
          className="mb-10 max-w-3xl"
        />
        <TreatmentCalculator market={market} />
      </Section>

      <Section tone="soft" id="como-ayudamos">
        <SectionHeading
          eyebrow={t('benefitsEyebrow')}
          title={t('benefitsTitle')}
          className="mb-10 max-w-3xl"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <div key={item.title} className="border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold uppercase text-fg">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-[15px] text-muted">{t('integrateNote')}</p>
      </Section>

      <Section tone="light">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            align="center"
            eyebrow={t('trustEyebrow')}
            title={t('trustTitle')}
            description={t('trustText')}
            className="mx-auto"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={whatsappLink(market.whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              {t('ctaWhatsapp')}
            </Button>
            <Button href={site.calendarUrl} size="lg" iconRight="arrow-right">
              {t('ctaSchedule')}
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="dark" id="contacto">
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
                href={whatsappLink(market.whatsappMessage)}
                external
                variant="whatsapp"
                size="lg"
                icon="whatsapp"
                onClick={() =>
                  trackEvent('WhatsAppClick', { source: 'form_aside' })
                }
              >
                {t('ctaWhatsapp')}
              </Button>
              <Button
                href={site.calendarUrl}
                size="lg"
                iconRight="arrow-right"
                onClick={() =>
                  trackEvent('AppointmentStart', { source: 'form_aside' })
                }
              >
                {t('ctaSchedule')}
              </Button>
            </div>
          </div>
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
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('faqEyebrow')}
          title={t('faqTitle')}
          align="center"
          className="mx-auto mb-10"
        />
        <FAQ items={faqs} />
      </Section>

      <Section tone="brand">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold uppercase text-fg sm:text-4xl">
            {t('finalTitle')}
          </h2>
          <p className="mt-5 text-muted">{t('finalText')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={whatsappLink(market.whatsappMessage)}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
              onClick={() => trackEvent('WhatsAppClick', { source: 'final' })}
            >
              {t('ctaWhatsapp')}
            </Button>
            <Button
              href={site.calendarUrl}
              size="lg"
              variant="accent"
              iconRight="arrow-right"
              onClick={() =>
                trackEvent('AppointmentStart', { source: 'final' })
              }
            >
              {t('ctaSchedule')}
            </Button>
          </div>
        </div>
      </Section>

      <StickyWhatsAppCta
        label={t('stickyCta')}
        whatsappMessage={market.whatsappMessage}
        vertical="clinicas-dentales"
      />
    </div>
  );
}
