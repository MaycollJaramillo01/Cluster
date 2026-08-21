import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { WebsitePlansCarousel } from '@/components/home/WebsitePlansCarousel';
import { WebsiteCasesCarousel } from '@/components/home/WebsiteCasesCarousel';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { getLocalizedWebsitePlans } from '@/lib/localized-content';
import { site, whatsappLink } from '@/lib/site';
import { websitePlanBenefits } from '@/lib/website-plans';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WebDev' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/desarrollo-web' },
  };
}

export default async function DesarrolloWebPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('WebDev');
  const tc = await getTranslations('Common');
  const messages = await getMessages();
  const websitePlans = getLocalizedWebsitePlans(messages);
  const websitePlansStarter = websitePlans.filter(
    (plan) => plan.slug === 'website' || plan.slug === 'website-plus',
  );
  const websitePlansAdvance = websitePlans.filter(
    (plan) =>
      plan.slug === 'website-leads' ||
      plan.slug === 'website-seo' ||
      plan.slug === 'website-seo-leads',
  );

  const benefits = (messages as Record<string, unknown>).WebsitePlans as {
    benefits: { title: string; text: string }[];
    faqs: { q: string; a: string }[];
  };
  const localizedBenefits = (benefits?.benefits ?? []).map((b, i) => ({
    ...b,
    icon: (websitePlanBenefits[i]?.icon ?? 'globe') as IconName,
  }));
  const faqs = benefits?.faqs ?? [];
  const journey = t.raw('journey') as { n: string; title: string; text: string }[];
  const heroTitleParts = t.raw('heroTitleParts') as { text: string; highlight?: boolean }[];

  return (
    <div className="theme-desarrollo-web">
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/desarrollo-web`,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroEyebrow'), url: `${site.url}/desarrollo-web` },
        ])}
      />

      <PageHero
        videoSrc="/assets/videos/heroes/desarrollo-web.mp4"
        eyebrow={t('heroEyebrow')}
        title={
          <>
            {heroTitleParts.map((part, index) =>
              part.highlight ? (
                <span
                  key={index}
                  className={part.text === 'website' ? 'web-hero-mark' : 'text-accent'}
                >
                  {part.text}
                </span>
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </>
        }
        subtitle={t('heroSubtitle')}
        whatsappMessage={t('heroWhatsapp')}
      />

      <Section tone="dark" id="casos">
        <SectionHeading
          tone="light"
          eyebrow={t('casesEyebrow')}
          title={
            <>
              {t('casesTitleBefore')}{' '}
              <span className="text-accent">{t('casesTitleHighlight')}</span>
              {t('casesTitleAfter')}
            </>
          }
          description={t('casesDescription')}
          className="mb-10"
        />
        <WebsiteCasesCarousel />
      </Section>

      <Section tone="light">
        <SectionHeading
          align="center"
          eyebrow={t('benefitsEyebrow')}
          title={
            <>
              {t('benefitsTitleBefore')}{' '}
              <span className="text-accent">{t('benefitsTitleHighlight')}</span>
              {t('benefitsTitleAfter')}
            </>
          }
          description={t('benefitsDescription')}
          className="mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {localizedBenefits.map((b, i) => (
            <Reveal
              key={b.title}
              delay={i * 60}
              className="group border border-ink-950/10 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:rgba(2,195,154,0.35)] hover:shadow-[0_20px_40px_-24px_rgba(2,195,154,0.45)]"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center transition-transform duration-300 group-hover:scale-105 web-accent-${i}`}
              >
                <Icon name={b.icon} size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold uppercase text-ink-950">
                {b.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <div className="relative mx-auto max-w-5xl">
          <SectionHeading
            tone="light"
            align="center"
            eyebrow={t('integralEyebrow')}
            title={
              <>
                {t('integralTitleBefore')}{' '}
                <span className="text-accent">{t('integralTitleHighlight')}</span>
                {t('integralTitleAfter')}
              </>
            }
            description={t('integralDescription')}
            className="mb-12"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((step, i) => (
              <Reveal key={step.n} delay={i * 70} className="web-panel relative overflow-hidden p-6">
                <span className="mono-label text-accent">{step.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold uppercase text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="#planes" size="lg" iconRight="arrow-right">
              {tc('viewPlans')}
            </Button>
            <Button
              href={whatsappLink(t('integralWhatsapp'))}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              {tc('whatsapp')}
            </Button>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft" id="planes">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow={t('plansEyebrow')}
            title={
              <>
                {t('plansTitleBefore')}{' '}
                <span className="text-accent">{t('plansTitleHighlight')}</span>
                {t('plansTitleAfter')}
              </>
            }
            description={t('plansDescription')}
          />
          <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="#faq" size="lg" variant="ghost" iconRight="arrow-right">
              {tc('seeQuestions')}
            </Button>
            <Button
              href={whatsappLink(t('chooseWhatsapp'))}
              external
              variant="whatsapp"
              size="lg"
              icon="whatsapp"
            >
              {tc('whatsapp')}
            </Button>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark" id="starter">
        <SectionHeading
          tone="light"
          eyebrow={t('starterSectionEyebrow')}
          title={
            <>
              {t('starterSectionTitleBefore')}{' '}
              <span className="text-accent">{t('starterSectionTitleHighlight')}</span>
              {t('starterSectionTitleAfter')}
            </>
          }
          description={t('starterSectionDescription')}
          className="mb-10"
        />
        <WebsitePlansCarousel plans={websitePlansStarter} />
      </Section>

      <Section tone="brand" id="advance">
        <SectionHeading
          tone="light"
          eyebrow={t('advanceSectionEyebrow')}
          title={
            <>
              {t('advanceSectionTitleBefore')}{' '}
              <span className="text-accent">{t('advanceSectionTitleHighlight')}</span>
              {t('advanceSectionTitleAfter')}
            </>
          }
          description={t('advanceSectionDescription')}
          className="mb-10"
        />
        <WebsitePlansCarousel plans={websitePlansAdvance} />
      </Section>

      <Section tone="light" id="faq">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={t('faqEyebrow')}
              title={
                <>
                  {t('faqTitleBefore')}{' '}
                  <span className="text-accent">{t('faqTitleHighlight')}</span>
                  {t('faqTitleAfter')}
                </>
              }
              description={t('faqDescription')}
            />
            <div className="web-stat mt-8 p-5">
              <p className="font-display text-lg font-semibold uppercase text-ink-950">
                {t('tipTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{t('tipText')}</p>
            </div>
          </div>
          <FAQ items={faqs} />
        </div>
      </Section>

      <CTASection
        title={t('ctaTitle')}
        text={t('ctaText')}
        whatsappMessage={t('ctaWhatsapp')}
      />
    </div>
  );
}
