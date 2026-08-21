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
import { getLocalizedPlanBySlug, getLocalizedPlans } from '@/lib/localized-content';
import { planSlugs, site, type PlanSlug } from '@/lib/site';

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    planSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const messages = await getMessages({ locale });
  const plan = getLocalizedPlanBySlug(messages, slug);
  const tc = await getTranslations({ locale, namespace: 'Common' });

  if (!plan) return { title: tc('planNotFound') };

  return {
    title: `${plan.name} | ${plan.price}${plan.period ?? ''}`,
    description: plan.subtitle,
    alternates: { canonical: `/planes/${plan.slug}` },
    openGraph: {
      title: `${plan.name} | Cluster Media`,
      description: plan.subtitle,
    },
  };
}

export default async function PlanLandingPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations('Common');
  const tp = await getTranslations('Plans');
  const messages = await getMessages();
  const plan = getLocalizedPlanBySlug(messages, slug);

  if (!plan) notFound();

  const otherPlans = getLocalizedPlans(messages).filter((p) => p.slug !== plan.slug);
  const pageUrl = `${site.url}/planes/${plan.slug}`;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Plan ${plan.name}`,
          description: plan.subtitle,
          url: pageUrl,
        })}
      />
      <JsonLd data={faqSchema(plan.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tc('breadcrumbPlans'), url: `${site.url}/#planes` },
          { name: plan.name, url: pageUrl },
        ])}
      />

      <PageHero
        eyebrow={`Plan ${plan.name}`}
        title={plan.headline}
        subtitle={plan.subtitle}
        price={{
          now: plan.price,
          note: plan.period,
        }}
        whatsappMessage={plan.whatsapp}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={tp('includesEyebrow')}
            title={tc('includesWith', { name: plan.name })}
            description={plan.note}
          />
          <Reveal delay={120} className="flex flex-col justify-center bg-surface p-8">
            <CheckList items={plan.features} columns={1} className="gap-4" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={plan.stripeUrl} external size="lg" iconRight="arrow-right">
                {tc('hireNow')}
              </Button>
              <Button href="#faq" variant="ghost" size="lg">
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
          title={tc('planFitsIf', { name: plan.name })}
          description={tp('idealDescription')}
          titleClass="text-fg text-3xl sm:text-4xl"
        />
        <Reveal delay={100} className="mt-10">
          <PillList items={plan.idealFor} />
        </Reveal>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow={tp('otherEyebrow')}
          title={tc('comparePlans')}
          description={tc('compareOtherMonthly')}
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherPlans.map((other, i) => (
            <Reveal
              key={other.slug}
              delay={i * 60}
              className="border border-ink-950/10 bg-paper p-6 transition-colors hover:bg-paper-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mono-label text-accent">{other.kicker}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase text-ink-950">
                    {other.name}
                  </h3>
                </div>
                {other.badge && (
                  <span className="mono-label text-[10px] text-accent">{other.badge}</span>
                )}
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-ink-950">
                {other.price}
                <span className="ml-1 font-mono text-xs font-medium uppercase tracking-wider text-ink-600">
                  {other.period}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{other.note}</p>
              <Link
                href={`/planes/${other.slug as PlanSlug}`}
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink-950 transition-colors hover:text-accent"
              >
                {tc('seePlan', { name: other.name })}
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="faq" tone="light">
        <SectionHeading
          eyebrow={tp('faqEyebrow')}
          align="center"
          title={tc('faqAboutPlan', { name: plan.name })}
          className="mb-12"
        />
        <FAQ items={plan.faqs} />
      </Section>

      <CTASection
        title={tc('startWithPlan', { name: plan.name })}
        text={tc('planCtaText', { name: plan.name })}
        whatsappMessage={plan.whatsapp}
        primaryCta={{
          label: tc('hireNow'),
          href: plan.stripeUrl,
        }}
      />
    </>
  );
}
