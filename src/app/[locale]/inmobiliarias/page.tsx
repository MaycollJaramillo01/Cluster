import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { InmobiliariasLanding } from '@/components/inmobiliarias/InmobiliariasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import { getCountry } from '@/lib/inmobiliarias/countries';
import { site } from '@/lib/site';

const country = getCountry('do');

type PageParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Inmobiliarias' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: '/inmobiliarias',
      languages: {
        'es-DO': '/inmobiliarias/do',
        'es-PA': '/inmobiliarias/pa',
        'es-CL': '/inmobiliarias/cl',
        'es-ES': '/inmobiliarias/es',
        'es-MX': '/inmobiliarias/mx',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${site.url}/inmobiliarias`,
      locale: country.ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

export default async function InmobiliariasPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Inmobiliarias');
  const tc = await getTranslations('Common');
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/inmobiliarias`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('crumb'), url: `${site.url}/inmobiliarias` },
        ])}
      />
      <InmobiliariasLanding country={country} />
    </>
  );
}
