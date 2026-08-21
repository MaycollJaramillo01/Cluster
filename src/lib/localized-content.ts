import type { AbstractIntlMessages } from 'next-intl';
import {
  articles as articleMeta,
  caseStudies as caseMeta,
  plans as planMeta,
  services as serviceMeta,
  socialPlans as socialPlanMeta,
  type Article,
  type CaseStudy,
  type PricingPlan,
  type Plan,
  type Service,
} from '@/lib/site';
import {
  websitePlans as websitePlanMeta,
  type WebsitePlan,
} from '@/lib/website-plans';

type Dict = Record<string, unknown>;

function asRecord(value: unknown): Dict {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Dict)
    : {};
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  const record = asRecord(value);
  const keys = Object.keys(record)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b));
  return keys.map((k) => record[k] as T);
}

function siteContent(messages: AbstractIntlMessages) {
  return asRecord(asRecord(messages).SiteContent);
}

export function getLocalizedServices(
  messages: AbstractIntlMessages,
): Service[] {
  const localized = asArray<Partial<Service>>(siteContent(messages).services);
  return serviceMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      name: text.name ?? base.name,
      short: text.short ?? base.short,
      description: text.description ?? base.description,
      features: text.features ?? base.features,
      cta: text.cta ?? base.cta,
      price: text.price ?? base.price,
    };
  });
}

export function getLocalizedPlans(
  messages: AbstractIntlMessages,
): PricingPlan[] {
  const localized = asArray<Partial<PricingPlan>>(siteContent(messages).plans);
  return planMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      name: text.name ?? base.name,
      kicker: text.kicker ?? base.kicker,
      note: text.note ?? base.note,
      headline: text.headline ?? base.headline,
      subtitle: text.subtitle ?? base.subtitle,
      idealFor: text.idealFor ?? base.idealFor,
      faqs: text.faqs ?? base.faqs,
      features: text.features ?? base.features,
      cta: text.cta ?? base.cta,
      whatsapp: text.whatsapp ?? base.whatsapp,
      badge: text.badge ?? base.badge,
      period: text.period ?? base.period,
    };
  });
}

export function getLocalizedSocialPlans(
  messages: AbstractIntlMessages,
): Plan[] {
  const localized = asArray<Partial<Plan>>(siteContent(messages).socialPlans);
  return socialPlanMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      name: text.name ?? base.name,
      period: text.period ?? base.period,
      features: text.features ?? base.features,
    };
  });
}

export function getLocalizedCaseStudies(
  messages: AbstractIntlMessages,
): CaseStudy[] {
  const localized = asArray<Partial<CaseStudy>>(
    siteContent(messages).caseStudies,
  );
  return caseMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      title: text.title ?? base.title,
      summary: text.summary ?? base.summary,
      text: text.text ?? base.text,
      metric: text.metric ?? base.metric,
      services: text.services ?? base.services,
      industry: text.industry ?? base.industry,
    };
  });
}

export function getLocalizedArticles(
  messages: AbstractIntlMessages,
): Article[] {
  const localized = asArray<Partial<Article>>(siteContent(messages).articles);
  return articleMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      title: text.title ?? base.title,
      category: text.category ?? base.category,
      excerpt: text.excerpt ?? base.excerpt,
      readingTime: text.readingTime ?? base.readingTime,
    };
  });
}

export function getLocalizedWebsitePlans(
  messages: AbstractIntlMessages,
): WebsitePlan[] {
  const websitePlans = asRecord(asRecord(messages).WebsitePlans);
  const localized = asArray<Partial<WebsitePlan>>(websitePlans.websitePlans);
  return websitePlanMeta.map((base, index) => {
    const text = localized[index] ?? {};
    return {
      ...base,
      name: text.name ?? base.name,
      nameAccent: text.nameAccent ?? base.nameAccent,
      kicker: text.kicker ?? base.kicker,
      headline: text.headline ?? base.headline,
      tagline: text.tagline ?? base.tagline,
      features: text.features ?? base.features,
      idealFor: text.idealFor ?? base.idealFor,
      faqs: text.faqs ?? base.faqs,
      note: text.note ?? base.note,
      footer: text.footer ?? base.footer,
      badge: text.badge ?? base.badge,
      whatsapp: text.whatsapp ?? base.whatsapp,
    };
  });
}

export function getLocalizedPlanBySlug(
  messages: AbstractIntlMessages,
  slug: string,
) {
  return getLocalizedPlans(messages).find((plan) => plan.slug === slug);
}

export function getLocalizedWebsitePlanBySlug(
  messages: AbstractIntlMessages,
  slug: string,
) {
  return getLocalizedWebsitePlans(messages).find((plan) => plan.slug === slug);
}
