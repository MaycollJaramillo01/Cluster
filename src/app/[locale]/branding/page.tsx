import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { LogoWall } from '@/components/blocks/LogoWall';
import { BrandManualsGallery } from '@/components/branding/BrandManualsGallery';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { getBrandManuals } from '@/lib/brand-manuals';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Branding' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/branding' },
  };
}

export default async function BrandingPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Branding');
  const tc = await getTranslations('Common');

  const includes = t.raw('includes') as string[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const manualWhyItems = t.raw('manualWhyItems') as string[];
  const manuals = getBrandManuals();

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/branding`,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/branding` },
        ])}
      />

      <PageHero
        videoSrc="/assets/videos/heroes/branding.mp4"
        eyebrow={t('heroEyebrow')}
        title={
          <>
            {t('heroTitleBefore')}{' '}
            <span className="text-accent">{t('heroTitleHighlight')}</span>
            {t('heroTitleAfter')}
          </>
        }
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={t('includesEyebrow')}
            title={t('includesTitle')}
            description={t('includesDescription')}
          />
          <Reveal delay={120} className="flex flex-col justify-center rounded-3xl bg-surface p-8">
            <CheckList items={includes} columns={1} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="sparkles" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            {t('problemTitle')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{t('problemText')}</p>
        </div>
      </Section>

      <Section tone="soft">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <SectionHeading
            eyebrow={t('manualEyebrow')}
            title={t('manualTitle')}
            description={t('manualDescription')}
          />
          <Reveal delay={120} className="bg-surface p-7">
            <h3 className="font-display text-2xl font-semibold uppercase text-fg">
              {t('manualWhyTitle')}
            </h3>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-muted">
              {manualWhyItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow={t('portfolioEyebrow')}
          title={t('portfolioTitle')}
          description={t('portfolioDescription')}
          align="center"
          className="mx-auto mb-10"
        />
        <BrandManualsGallery manuals={manuals} />
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow={t('logosEyebrow')}
          title={t('logosTitle')}
          description={t('logosDescription')}
          align="center"
          tone="light"
          className="mx-auto mb-10"
        />
        <LogoWall />
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
