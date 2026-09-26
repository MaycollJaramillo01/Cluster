import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AgentLanding } from '@/components/automatizaciones-ia/AgentLanding';
import { getAgentContent } from '@/components/automatizaciones-ia/content';
import {
  JsonLd,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const content = getAgentContent(locale);
  const path = content.locale === 'en' ? '/en/automatizaciones-ia' : '/automatizaciones-ia';

  return {
    title: { absolute: content.meta.title },
    description: content.meta.description,
    alternates: {
      canonical: path,
      languages: {
        es: '/automatizaciones-ia',
        en: '/en/automatizaciones-ia',
        'x-default': '/automatizaciones-ia',
      },
    },
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: `${site.url}${path}`,
      locale: content.locale === 'en' ? 'en_US' : 'es_HN',
      alternateLocale: content.locale === 'en' ? 'es_HN' : 'en_US',
      type: 'website',
      siteName: site.name,
    },
  };
}

export default async function AutomatizacionesPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getAgentContent(locale);
  const path = content.locale === 'en' ? '/en/automatizaciones-ia' : '/automatizaciones-ia';
  const pageUrl = `${site.url}${path}`;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: content.meta.title,
          description: content.meta.description,
          url: pageUrl,
          price: '120',
        })}
      />
      <JsonLd data={faqSchema(content.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: content.locale === 'en' ? 'Home' : 'Inicio', url: `${site.url}${content.locale === 'en' ? '/en' : ''}` },
          { name: content.hero.eyebrow, url: pageUrl },
        ])}
      />

      <AgentLanding content={content} />
    </>
  );
}
