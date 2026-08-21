import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WebsitesSeo' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/websites-seo' },
  };
}

export default async function WebsitesSeoPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('WebsitesSeo');
  const tc = await getTranslations('Common');

  const servicesList = t.raw('servicesList') as string[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/websites-seo`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/websites-seo` },
        ])}
      />

      <PageHero
        image={{ src: '/assets/stock/laptop.jpg', alt: t('heroImageAlt') }}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={t('servicesEyebrow')}
            title={t('servicesTitle')}
            description={t('servicesDescription')}
          />
          <Reveal delay={120} className="rounded-3xl bg-surface p-8">
            <CheckList items={servicesList} columns={2} className="gap-4" />
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <Reveal className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-surface p-8 text-center sm:flex-row sm:text-left lg:p-10">
          <div className="flex items-center gap-5">
            <span className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-surface text-accent sm:flex">
              <Icon name="globe" size={28} />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-white">{t('webDevTitle')}</h3>
              <p className="mt-1.5 text-white/65">{t('webDevText')}</p>
            </div>
          </div>
          <Button href="/desarrollo-web" size="lg" className="flex-none" iconRight="arrow-right">
            {tc('seeWebPlans')}
          </Button>
        </Reveal>
      </Section>

      <Section tone="soft">
        <Reveal className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-surface p-8 text-center sm:flex-row sm:text-left lg:p-10">
          <div className="flex items-center gap-5">
            <span className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-surface text-accent sm:flex">
              <Icon name="rocket" size={28} />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-fg">{t('starterTitle')}</h3>
              <p className="mt-1.5 text-muted">{t('starterText')}</p>
            </div>
          </div>
          <Button
            href="/paquete-inicial-digital"
            size="lg"
            className="flex-none"
            iconRight="arrow-right"
          >
            {tc('seePackage')}
          </Button>
        </Reveal>
      </Section>

      <CTASection title={t('ctaTitle')} whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
