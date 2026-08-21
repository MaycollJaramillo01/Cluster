import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CaseCard } from '@/components/blocks/CaseCard';
import { LogoWall } from '@/components/blocks/LogoWall';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { getLocalizedCaseStudies } from '@/lib/localized-content';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cases' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/casos-de-exito' },
  };
}

export default async function CasosPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Cases');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');
  const messages = await getMessages();
  const caseStudies = getLocalizedCaseStudies(messages);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tn('cases'), url: `${site.url}/casos-de-exito` },
        ])}
      />

      <PageHero
        image={{ src: '/assets/stock/meeting.jpg', alt: t('heroImageAlt') }}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((study, i) => (
            <CaseCard key={study.slug} study={study} index={i} />
          ))}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={t('socialEyebrow')}
          align="center"
          title={t('socialTitle')}
          description={t('socialDescription')}
          className="mb-12"
        />
        <LogoWall />
      </Section>

      <CTASection title={t('ctaTitle')} whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
