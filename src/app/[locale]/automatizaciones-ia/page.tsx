import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { ChallengeSolutionMap } from '@/components/automatizaciones-ia/ChallengeSolutionMap';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Automation' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/automatizaciones-ia' },
  };
}

export default async function AutomatizacionesPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Automation');
  const tc = await getTranslations('Common');

  const problems = t.raw('problems') as string[];
  const solutions = t.raw('solutions') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/automatizaciones-ia`,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/automatizaciones-ia` },
        ])}
      />

      <PageHero
        videoSrc="/assets/videos/heroes/ia-automatizaciones.mp4"
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <Reveal>
          <ChallengeSolutionMap problems={problems} solutions={solutions} />
        </Reveal>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="bot" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            {t('insightTitle')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{t('insightText')}</p>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('faqEyebrow')}
          align="center"
          title={t('faqTitle')}
          className="mb-12"
        />
        <FAQ items={faqs} />
      </Section>

      <CTASection title={t('ctaTitle')} whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
