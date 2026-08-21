import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ServiceCard } from '@/components/blocks/ServiceCard';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { getLocalizedServices } from '@/lib/localized-content';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Services' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/servicios' },
  };
}

export default async function ServiciosPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Services');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');
  const messages = await getMessages();
  const services = getLocalizedServices(messages);
  const additionalServices = t.raw('additionalServices') as string[];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tn('services'), url: `${site.url}/servicios` },
        ])}
      />
      <PageHero
        image={{ src: '/assets/stock/strategy.jpg', alt: t('heroImageAlt') }}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <SectionHeading
          eyebrow={t('categoriesEyebrow')}
          align="center"
          title={t('categoriesTitle')}
          description={t('categoriesDescription')}
          className="mb-14"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('additionalEyebrow')}
          align="center"
          title={t('additionalTitle')}
          description={t('additionalDescription')}
          className="mb-12"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {additionalServices.map((service) => (
            <div
              key={service}
              className="border border-line bg-paper px-5 py-4 font-display text-base font-semibold uppercase leading-tight text-ink-950"
            >
              {service}
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        title={t('ctaTitle')}
        text={t('ctaText')}
        whatsappMessage={t('ctaWhatsapp')}
      />
    </>
  );
}
