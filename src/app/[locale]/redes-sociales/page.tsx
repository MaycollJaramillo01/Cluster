import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { SocialVideosCarousel } from '@/components/redes-sociales/SocialVideosCarousel';
import { Section, SectionHeading } from '@/components/ui/Section';
import { PricingCard } from '@/components/blocks/PricingCard';
import { CTASection } from '@/components/blocks/CTASection';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { getLocalizedSocialPlans } from '@/lib/localized-content';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Social' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/redes-sociales' },
  };
}

export default async function RedesSocialesPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Social');
  const tc = await getTranslations('Common');
  const messages = await getMessages();
  const socialPlans = getLocalizedSocialPlans(messages);
  const pills = t.raw('pills') as string[];

  const pillTints = [
    'bg-[color:rgba(2,195,154,0.12)] text-accent',
    'bg-[color:rgba(56,189,248,0.16)] text-[color:#0369a1]',
    'bg-[color:rgba(236,72,153,0.14)] text-[color:#be185d]',
    'bg-[color:rgba(234,179,8,0.16)] text-[color:#a16207]',
  ];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/redes-sociales`,
          price: '480',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/redes-sociales` },
        ])}
      />

      <PageHero
        videoSrc="/assets/videos/heroes/redes-sociales.mp4"
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent">
            <Icon name="megaphone" size={28} />
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">
            {t('convertTitle')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{t('convertText')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {pills.map((pill, i) => (
              <span
                key={pill}
                className={`mono-label rise-in px-3 py-1.5 ${pillTints[i % pillTints.length]}`}
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark" id="reels" className="!overflow-visible">
        <SectionHeading
          tone="light"
          eyebrow={t('reelsEyebrow')}
          title={
            <>
              {t('reelsTitleBefore')}{' '}
              <span className="text-accent">{t('reelsTitleHighlight')}</span>
              {t('reelsTitleAfter')}
            </>
          }
          description={t('reelsDescription')}
          className="mb-10"
        />
        <SocialVideosCarousel />
      </Section>

      <Section tone="soft" id="paquetes">
        <SectionHeading
          eyebrow={t('packagesEyebrow')}
          align="center"
          title={t('packagesTitle')}
          description={t('packagesDescription')}
          className="mb-16"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {socialPlans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <Reveal className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl bg-surface p-5 text-sm text-muted">
          <Icon name="shield" size={20} className="mt-0.5 flex-none text-accent" />
          <p>
            <strong className="text-fg">{tc('important')}:</strong> {t('adSpendNote')}
          </p>
        </Reveal>
      </Section>

      <CTASection title={t('ctaTitle')} whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
