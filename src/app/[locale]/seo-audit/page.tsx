import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema, serviceSchema } from '@/components/seo/JsonLd';
import { SeoAuditHeroGraphic } from '@/components/seo-audit/SeoAuditHeroGraphic';
import { SeoAuditTool } from '@/components/seo-audit/SeoAuditTool';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

const reviewIcons: IconName[] = ['search', 'pen', 'target'];

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SeoAudit' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/seo-audit' },
  };
}

export default async function SeoAuditPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('SeoAudit');
  const tc = await getTranslations('Common');

  const reviewAreas = (t.raw('reviewAreas') as { title: string; text: string }[]).map(
    (area, index) => ({
      ...area,
      icon: reviewIcons[index] ?? 'search',
    }),
  );

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/seo-audit`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/seo-audit` },
        ])}
      />

      <PageHero
        visual={<SeoAuditHeroGraphic />}
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        primaryCta={{ label: tc('auditNow'), href: '#seo-audit-tool' }}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section id="seo-audit-tool" tone="light">
        <div className="mb-12">
          <SectionHeading
            eyebrow={t('toolEyebrow')}
            title={t('toolTitle')}
            description={t('toolDescription')}
            titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
          />
        </div>
        <SeoAuditTool />
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow={t('reviewEyebrow')}
          tone="light"
          title={t('reviewTitle')}
          description={t('reviewDescription')}
          titleClass="text-4xl text-fg sm:text-5xl lg:text-6xl"
          className="mb-12"
        />
        <div className="grid gap-px bg-surface-2 md:grid-cols-3">
          {reviewAreas.map((area, index) => (
            <Reveal key={area.title} delay={index * 80} className="bg-theme p-8">
              <span className="flex h-12 w-12 items-center justify-center bg-surface text-accent">
                <Icon name={area.icon} size={24} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-fg">{area.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{area.text}</p>
            </Reveal>
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
