import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList, PillList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
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
  const t = await getTranslations({ locale, namespace: 'GoogleAds' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/google-ads' },
  };
}

export default async function GoogleAdsPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('GoogleAds');
  const tc = await getTranslations('Common');

  const includes = t.raw('includes') as string[];
  const forWhom = t.raw('forWhom') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/google-ads`,
          price: '150',
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/google-ads` },
        ])}
      />

      <PageHero
        videoSrc="/assets/videos/heroes/google-ads.mp4"
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        price={{
          now: t('heroPrice'),
          note: tc('adSpendNotIncluded'),
        }}
        whatsappMessage={t('heroWhatsapp')}
      />

      <div className="border-y border-line bg-ink-850 py-6 text-center text-white">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span className="text-white/60">
            <strong className="text-accent">{t('heroPrice')}</strong> · {tc('managementFrom')}
          </span>
          <span className="text-white/60">
            {tc('suggestedCommitment')}{' '}
            <strong className="text-white">{tc('months6')}</strong>
          </span>
          <span className="text-white/60">
            <strong className="text-white">{tc('adSpendNotIncludedLabel')}</strong>
          </span>
        </div>
      </div>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={t('includesEyebrow')}
            title={t('includesTitle')}
            description={t('includesDescription')}
          />
          <Reveal delay={120} className="rounded-3xl bg-surface p-8">
            <CheckList items={includes} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('forWhomEyebrow')}
          title={t('forWhomTitle')}
          description={t('forWhomDescription')}
          className="mb-10"
        />
        <PillList items={forWhom} />
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="search" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            {t('insightTitle')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{t('insightText')}</p>
        </div>
      </Section>

      <Section tone="light">
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
