import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClinicasEsteticasLanding } from '@/components/clinicas-esteticas/ClinicasEsteticasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import { getCountry } from '@/lib/clinicas-esteticas/countries';
import { site } from '@/lib/site';

const country = getCountry('pa');

type PageParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ClinicasEsteticas' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: '/clinicas-esteticas',
      languages: {
        'es-PA': '/clinicas-esteticas/pa',
        'es-CL': '/clinicas-esteticas/cl',
        'es-ES': '/clinicas-esteticas/es',
        'es-MX': '/clinicas-esteticas/mx',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${site.url}/clinicas-esteticas`,
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

export default async function ClinicasEsteticasPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('ClinicasEsteticas');
  const tc = await getTranslations('Common');
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: t('metaTitle'),
          description: t('metaDescription'),
          url: `${site.url}/clinicas-esteticas`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('crumb'), url: `${site.url}/clinicas-esteticas` },
        ])}
      />
      <ClinicasEsteticasLanding country={country} />
    </>
  );
}
