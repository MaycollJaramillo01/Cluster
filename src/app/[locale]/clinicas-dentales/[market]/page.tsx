import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClinicasDentalesLanding } from '@/components/clinicas-dentales/ClinicasDentalesLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import {
  CLINICAS_DENTALES_MARKETS,
  getClinicasDentalesMarket,
  type ClinicasDentalesMarketId,
} from '@/lib/clinicas-dentales/markets';
import { site } from '@/lib/site';

type PageParams = {
  params: Promise<{ locale: string; market: string }>;
};

export function generateStaticParams() {
  return (Object.keys(CLINICAS_DENTALES_MARKETS) as ClinicasDentalesMarketId[]).map(
    (market) => ({ market }),
  );
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, market: marketParam } = await params;
  if (!(marketParam in CLINICAS_DENTALES_MARKETS)) return {};
  const market = getClinicasDentalesMarket(marketParam);
  const t = await getTranslations({ locale, namespace: 'ClinicasDentales' });

  return {
    title: t('metaTitle', { country: market.country }),
    description: t('metaDescription'),
    alternates: { canonical: `/clinicas-dentales/${market.id}` },
  };
}

export default async function ClinicasDentalesMarketPage({ params }: PageParams) {
  const { locale, market: marketParam } = await params;
  if (!(marketParam in CLINICAS_DENTALES_MARKETS)) notFound();
  setRequestLocale(locale);
  const market = getClinicasDentalesMarket(marketParam);
  const t = await getTranslations('ClinicasDentales');
  const tc = await getTranslations('Common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          {
            name: t('crumb'),
            url: `${site.url}/clinicas-dentales/${market.id}`,
          },
        ])}
      />
      <ClinicasDentalesLanding market={market} />
    </>
  );
}
