import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RemodelacionesLanding } from '@/components/remodelaciones/RemodelacionesLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import {
  DEFAULT_REMODELACIONES_MARKET,
  getRemodelacionesMarket,
} from '@/lib/remodelaciones/markets';
import { site } from '@/lib/site';

type PageParams = {
  params: Promise<{ locale: string; market?: string }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, market: marketParam } = await params;
  const market = getRemodelacionesMarket(marketParam ?? DEFAULT_REMODELACIONES_MARKET);
  const t = await getTranslations({ locale, namespace: 'Remodelaciones' });

  return {
    title: t('metaTitle', { country: market.country }),
    description: t('metaDescription'),
    alternates: {
      canonical: marketParam
        ? `/remodelaciones/${market.id}`
        : '/remodelaciones',
    },
  };
}

export default async function RemodelacionesPage({ params }: PageParams) {
  const { locale, market: marketParam } = await params;
  setRequestLocale(locale);
  const market = getRemodelacionesMarket(marketParam ?? DEFAULT_REMODELACIONES_MARKET);
  const t = await getTranslations('Remodelaciones');
  const tc = await getTranslations('Common');
  const path = marketParam
    ? `${site.url}/remodelaciones/${market.id}`
    : `${site.url}/remodelaciones`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('crumb'), url: path },
        ])}
      />
      <RemodelacionesLanding market={market} />
    </>
  );
}
