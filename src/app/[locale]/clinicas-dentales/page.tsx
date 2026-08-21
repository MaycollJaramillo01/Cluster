import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClinicasDentalesLanding } from '@/components/clinicas-dentales/ClinicasDentalesLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import {
  DEFAULT_CLINICAS_DENTALES_MARKET,
  getClinicasDentalesMarket,
} from '@/lib/clinicas-dentales/markets';
import { site } from '@/lib/site';

type PageParams = {
  params: Promise<{ locale: string; market?: string }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, market: marketParam } = await params;
  const market = getClinicasDentalesMarket(
    marketParam ?? DEFAULT_CLINICAS_DENTALES_MARKET,
  );
  const t = await getTranslations({ locale, namespace: 'ClinicasDentales' });

  return {
    title: t('metaTitle', { country: market.country }),
    description: t('metaDescription'),
    alternates: {
      canonical: marketParam
        ? `/clinicas-dentales/${market.id}`
        : '/clinicas-dentales',
    },
  };
}

export default async function ClinicasDentalesPage({ params }: PageParams) {
  const { locale, market: marketParam } = await params;
  setRequestLocale(locale);
  const market = getClinicasDentalesMarket(
    marketParam ?? DEFAULT_CLINICAS_DENTALES_MARKET,
  );
  const t = await getTranslations('ClinicasDentales');
  const tc = await getTranslations('Common');
  const path = marketParam
    ? `${site.url}/clinicas-dentales/${market.id}`
    : `${site.url}/clinicas-dentales`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('crumb'), url: path },
        ])}
      />
      <ClinicasDentalesLanding market={market} />
    </>
  );
}
