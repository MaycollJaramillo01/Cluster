import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import {
  IncludeGrid,
  PillList,
  ProcessSteps,
  type IncludeItem,
  type Step,
} from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { JsonLd, faqSchema, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

const includeIcons: IconName[] = ['globe', 'target', 'pin', 'shield', 'bolt', 'pen'];

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PaqueteInicial' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/paquete-inicial-digital' },
  };
}

export default async function PaquetePage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('PaqueteInicial');
  const tc = await getTranslations('Common');

  const includes = (t.raw('includes') as { title: string; text: string }[]).map(
    (item, index) => ({
      ...item,
      icon: includeIcons[index] ?? 'globe',
    }),
  ) satisfies IncludeItem[];

  const forWhom = t.raw('forWhom') as string[];
  const steps = t.raw('steps') as Step[];
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const importantItems = t.raw('importantItems') as string[];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: t('heroEyebrow'),
          description: t('metaDescription'),
          brand: { '@type': 'Brand', name: site.name },
          offers: {
            '@type': 'Offer',
            price: '590',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${site.url}/paquete-inicial-digital`,
          },
        }}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/paquete-inicial-digital` },
        ])}
      />

      <PageHero
        image={{ src: '/assets/stock/office.jpg', alt: t('heroImageAlt') }}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        price={{
          before: t('heroPriceBefore'),
          now: t('heroPriceNow'),
          note: tc('oneTimePayment'),
        }}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <SectionHeading
          eyebrow={t('includesEyebrow')}
          align="center"
          title={t('includesTitle')}
          className="mb-14"
        />
        <IncludeGrid items={includes} />
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            tone="light"
            eyebrow={t('forWhomEyebrow')}
            title={t('forWhomTitle')}
            description={t('forWhomDescription')}
          />
          <Reveal delay={120} className="flex items-center">
            <PillList items={forWhom} />
          </Reveal>
        </div>
      </Section>

      <Section tone="soft">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow={t('problemEyebrow')}
            title={t('problemTitle')}
            description={t('problemDescription')}
          />
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow={t('processEyebrow')}
          align="center"
          title={t('processTitle')}
          className="mb-14"
        />
        <ProcessSteps steps={steps} />
      </Section>

      <Section tone="soft">
        <Reveal className="mx-auto max-w-3xl rounded-3xl bg-surface p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-accent">
              <Icon name="shield" size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                {t('importantTitle')}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {t('importantText')}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-faint">
                {importantItems.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
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

      <CTASection
        title={t('ctaTitle')}
        text={t('ctaText')}
        whatsappMessage={t('ctaWhatsapp')}
      />
    </>
  );
}
