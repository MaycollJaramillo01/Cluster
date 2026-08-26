import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClinicasEsteticasLanding } from '@/components/clinicas-esteticas/ClinicasEsteticasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import {
  countryCodes,
  getCountry,
  isCountryCode,
} from '@/lib/clinicas-esteticas/countries';
import { site } from '@/lib/site';

type Props = {
  params: Promise<{ locale: string; country: string }>;
};

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country: code } = await params;
  if (!isCountryCode(code)) return {};
  const country = getCountry(code);
  const t = await getTranslations({ locale, namespace: 'ClinicasEsteticas' });
  const title = `${t('metaTitle')} · ${country.name}`;
  const description = `${t('metaDescription')} ${country.name}.`;

  return {
    title,
    description,
    alternates: { canonical: country.path },
    openGraph: {
      title,
      description,
      url: `${site.url}${country.path}`,
      locale: country.ogLocale,
      type: 'website',
    },
  };
}

export default async function ClinicasEsteticasCountryPage({ params }: Props) {
  const { locale, country: code } = await params;
  setRequestLocale(locale);
  if (!isCountryCode(code)) notFound();
  const country = getCountry(code);
  const t = await getTranslations('ClinicasEsteticas');
  const tc = await getTranslations('Common');
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `${t('metaTitle')} — ${country.name}`,
          description: t('metaDescription'),
          url: `${site.url}${country.path}`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('crumb'), url: `${site.url}/clinicas-esteticas` },
          { name: country.name, url: `${site.url}${country.path}` },
        ])}
      />
      <ClinicasEsteticasLanding country={country} />
    </>
  );
}
