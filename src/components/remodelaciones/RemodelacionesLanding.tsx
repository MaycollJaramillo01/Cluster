'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { FAQ } from '@/components/blocks/FAQ';
import { HeroBackgroundVideo } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { BudgetCalculator } from '@/components/remodelaciones/BudgetCalculator';
import {
  FinalCtaSection,
  MethodSection,
  OutcomesSection,
  ProblemSection,
  VerticalHero,
} from '@/components/verticals/ConversionLandingParts';
import { MinimalLeadForm } from '@/components/verticals/MinimalLeadForm';
import { StickyWhatsAppCta } from '@/components/verticals/StickyWhatsAppCta';
import { trackEvent } from '@/lib/analytics';
import { site, whatsappLink } from '@/lib/site';
import {
  CALCULATOR_STORAGE_KEY,
  type RemodelacionesMarket,
} from '@/lib/remodelaciones/markets';

type Props = {
  market: RemodelacionesMarket;
};

export function RemodelacionesLanding({ market }: Props) {
  const t = useTranslations('Remodelaciones');
  const problems = t.raw('problems') as { n: string; title: string; text: string }[];
  const method = t.raw('method') as { n: string; title: string; text: string }[];
  const outcomes = t.raw('outcomes') as { title: string; text: string }[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const trust = t.raw('heroTrust') as { label: string; value: string }[];

  useEffect(() => {
    trackEvent('PageView', { market: market.id, page: 'remodelaciones' });
    trackEvent('landing_view', { market: market.id, page: 'remodelaciones' });
  }, [market.id]);

  return (
    <div className="pb-20 md:pb-0">
      <VerticalHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        micro={t('heroMicro')}
        trust={trust}
        video={
          market.videoSrc ? (
            <HeroBackgroundVideo src={market.videoSrc} />
          ) : (
            <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
          )
        }
        ctaWhatsapp={t('ctaWhatsapp')}
        ctaSchedule={t('ctaSchedule')}
        whatsappMessage={market.whatsappMessage}
        onWhatsapp={() =>
          trackEvent('WhatsAppClick', {
            source: 'hero',
            page: 'remodelaciones',
          })
        }
        onSchedule={() =>
          trackEvent('AppointmentStart', {
            source: 'hero',
            page: 'remodelaciones',
          })
        }
      />

      <ProblemSection
        eyebrow={t('problemEyebrow')}
        title={t('problemTitle')}
        description={t('problemDesc')}
        close={t('problemClose')}
        items={problems}
        images={[
          { src: '/assets/stock/laptop.jpg', alt: t('imageAlt1') },
          { src: '/assets/stock/strategy2.jpg', alt: t('imageAlt2') },
          { src: '/assets/stock/analytics.jpg', alt: t('imageAlt3') },
        ]}
      />

      <MethodSection
        id="metodo"
        eyebrow={t('methodEyebrow')}
        title={t('methodTitle')}
        description={t('methodDesc')}
        items={method}
      />

      <Section tone="dark" id="calculadora">
        <SectionHeading
          tone="light"
          eyebrow={t('calcEyebrow')}
          title={t('calcTitle')}
          description={t('calcDesc')}
          className="mb-10 max-w-3xl"
          titleClass="text-4xl text-fg sm:text-5xl"
        />
        <Reveal>
          <BudgetCalculator market={market} />
        </Reveal>
      </Section>

      <OutcomesSection
        id="resultados"
        eyebrow={t('outcomesEyebrow')}
        title={t('outcomesTitle')}
        description={t('outcomesDesc')}
        items={outcomes}
      />

      <Section tone="dark" id="contacto">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              tone="light"
              eyebrow={t('formEyebrow')}
              title={t('formTitle')}
              description={t('formDesc')}
              titleClass="text-4xl text-fg sm:text-5xl"
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              {t('formAside')}
            </p>
          </div>
          <Reveal>
            <MinimalLeadForm
              i18nNamespace="Remodelaciones"
              vertical="construccion"
              country={market.country}
              landingPath={`/remodelaciones/${market.id}`}
              origen={`remodelaciones-${market.id}`}
              servicio="Conversión presupuestos construcción"
              whatsappMessage={market.whatsappMessage}
              calculatorStorageKey={CALCULATOR_STORAGE_KEY}
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow={t('faqEyebrow')}
          title={t('faqTitle')}
          description={t('faqDesc')}
          className="mb-10 max-w-2xl"
          titleClass="text-4xl text-fg sm:text-5xl"
        />
        <FAQ items={faqs} />
      </Section>

      <FinalCtaSection
        eyebrow={t('finalEyebrow')}
        title={t('finalTitle')}
        text={t('finalText')}
        ctaWhatsapp={t('ctaWhatsapp')}
        ctaSchedule={t('ctaSchedule')}
        whatsappMessage={market.whatsappMessage}
      />

      <StickyWhatsAppCta
        label={t('stickyCta')}
        whatsappMessage={market.whatsappMessage}
        vertical="remodelaciones"
      />
    </div>
  );
}
