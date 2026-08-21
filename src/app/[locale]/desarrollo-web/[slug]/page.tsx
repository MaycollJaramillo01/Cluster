import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/blocks/PageHero';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CheckList, PillList } from '@/components/blocks/Blocks';
import { CTASection } from '@/components/blocks/CTASection';
import { FAQ } from '@/components/blocks/FAQ';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { routing } from '@/i18n/routing';
import {
  getLocalizedWebsitePlanBySlug,
  getLocalizedWebsitePlans,
} from '@/lib/localized-content';
import { site, whatsappLink } from '@/lib/site';
import {
  websitePlanDisplayName,
  websitePlanSlugs,
  type WebsitePlanSlug,
} from '@/lib/website-plans';

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    websitePlanSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const messages = await getMessages({ locale });
  const plan = getLocalizedWebsitePlanBySlug(messages, slug);
  const tc = await getTranslations({ locale, namespace: 'Common' });

  if (!plan) return { title: tc('planNotFound') };

  const displayName = websitePlanDisplayName(plan);

  return {
    title: `${displayName} | $${plan.price}${tc('perMonth')}`,
    description: plan.tagline,
    alternates: { canonical: `/desarrollo-web/${plan.slug}` },
    openGraph: {
      title: `${displayName} | Cluster Media`,
      description: plan.tagline,
    },
  };
}

export default async function WebsitePlanLandingPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations('Common');
  const tp = await getTranslations('Plans');
  const tw = await getTranslations('WebDev');
  const messages = await getMessages();
  const plan = getLocalizedWebsitePlanBySlug(messages, slug);

  if (!plan) notFound();

  const displayName = websitePlanDisplayName(plan);
  const otherPlans = getLocalizedWebsitePlans(messages).filter((p) => p.slug !== plan.slug);
  const pageUrl = `${site.url}/desarrollo-web/${plan.slug}`;
  const hireHref = plan.stripeUrl || site.calendarUrl;
  const hireLabel = plan.stripeUrl ? tc('hireNow') : tc('scheduleCall');

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: displayName,
          description: plan.tagline,
          url: pageUrl,
          price: String(plan.price),
        })}
      />
      <JsonLd data={faqSchema(plan.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tw('heroEyebrow'), url: `${site.url}/desarrollo-web` },
          { name: displayName, url: pageUrl },
        ])}
      />

      <PageHero
        image={{
          src: '/assets/stock/laptop.jpg',
          alt: displayName,
          aspectClassName: 'aspect-[4/3]',
          imageClassName: 'object-cover object-center grayscale',
        }}
        eyebrow={plan.kicker ?? displayName}
        title={plan.headline}
        subtitle={plan.tagline}
        price={{
          now: `$${plan.price}`,
          note: tc('monthlyFee'),
        }}
        primaryCta={{
          label: hireLabel,
          href: hireHref,
        }}
        whatsappMessage={plan.whatsapp}
      >
        {plan.badge && (
          <Reveal delay={240}>
            <span className="mono-label mt-6 inline-flex items-center gap-2 text-accent">
              <span className="h-px w-6 bg-accent" />
              {plan.badge}
            </span>
          </Reveal>
        )}
      </PageHero>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={tp('includesEyebrow')}
            title={tc('includesWith', { name: displayName })}
            description={plan.note ?? plan.footer}
          />
          <Reveal delay={120} className="flex flex-col justify-center bg-surface p-8">
            <CheckList items={plan.features} columns={1} className="gap-4" />
            {plan.note && (
              <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-faint">
                ⓘ {plan.note}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button
                href={hireHref}
                external={hireHref.startsWith('http')}
                size="sm"
                iconRight="arrow-right"
              >
                {hireLabel}
              </Button>
              <Button
                href={whatsappLink(plan.whatsapp)}
                external
                variant="whatsapp"
                size="sm"
                icon="whatsapp"
              >
                {tc('whatsapp')}
              </Button>
              <Button href="#faq" variant="ghost" size="sm">
                {tc('seeQuestions')}
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow={tp('idealEyebrow')}
          tone="light"
          title={tc('planFitsIf', { name: displayName })}
          description={tp('idealDescription')}
          titleClass="text-fg text-3xl sm:text-4xl"
        />
        <Reveal delay={100} className="mt-10">
          <PillList items={plan.idealFor} />
        </Reveal>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={tc('otherWebPlans')}
          title={tc('comparePlans')}
          description={tc('compareOtherWeb')}
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherPlans.map((other, i) => {
            const otherName = websitePlanDisplayName(other);
            return (
              <Reveal
                key={other.slug}
                delay={i * 60}
                className="border border-ink-950/10 bg-paper p-6 transition-colors hover:bg-paper-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {other.kicker && <p className="mono-label text-accent">{other.kicker}</p>}
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase text-ink-950">
                      {otherName}
                    </h3>
                  </div>
                  {other.badge && (
                    <span className="mono-label text-[10px] text-accent">{other.badge}</span>
                  )}
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-ink-950">
                  ${other.price}
                  <span className="ml-1 font-mono text-xs font-medium uppercase tracking-wider text-ink-600">
                    {tc('monthlyFee')}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{other.tagline}</p>
                <Link
                  href={`/desarrollo-web/${other.slug as WebsitePlanSlug}`}
                  className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink-950 transition-colors hover:text-accent"
                >
                  {tc('seePlan', { name: otherName })}
                  <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="faq" tone="light">
        <SectionHeading
          eyebrow={tp('faqEyebrow')}
          align="center"
          title={tc('faqAboutPlan', { name: displayName })}
          className="mb-12"
        />
        <FAQ items={plan.faqs} />
      </Section>

      <CTASection
        title={tc('startWithPlan', { name: displayName })}
        text={tc('webPlanCtaText', { name: displayName })}
        whatsappMessage={plan.whatsapp}
        primaryCta={{
          label: hireLabel,
          href: hireHref,
        }}
      />
    </>
  );
}
