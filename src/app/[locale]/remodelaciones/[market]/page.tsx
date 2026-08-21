import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RemodelacionesLanding } from '@/components/remodelaciones/RemodelacionesLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import {
  REMODELACIONES_MARKETS,
  getRemodelacionesMarket,
  type RemodelacionesMarketId,
} from '@/lib/remodelaciones/markets';
import { site } from '@/lib/site';

type PageParams = {
  params: Promise<{ locale: string; market: string }>;
};

export function generateStaticParams() {
  return (Object.keys(REMODELACIONES_MARKETS) as RemodelacionesMarketId[]).map(
    (market) => ({ market }),
  );
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, market: marketParam } = await params;
  if (!(marketParam in REMODELACIONES_MARKETS)) return {};
  const market = getRemodelacionesMarket(marketParam);
  const t = await getTranslations({ locale, namespace: 'Remodelaciones' });

  return {
    title: t('metaTitle', { country: market.country }),
    description: t('metaDescription'),
    alternates: { canonical: `/remodelaciones/${market.id}` },
  };
}

export default async function RemodelacionesMarketPage({ params }: PageParams) {
  const { locale, market: marketParam } = await params;
  if (!(marketParam in REMODELACIONES_MARKETS)) notFound();
  setRequestLocale(locale);
  const market = getRemodelacionesMarket(marketParam);
  const t = await getTranslations('Remodelaciones');
  const tc = await getTranslations('Common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          {
            name: t('crumb'),
            url: `${site.url}/remodelaciones/${market.id}`,
          },
        ])}
      />
      <RemodelacionesLanding market={market} />
    </>
  );
}
