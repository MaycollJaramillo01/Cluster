import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GraciasActions } from '@/components/inmobiliarias/GraciasActions';
import { getCountry, isCountryCode } from '@/lib/inmobiliarias/countries';
import { site } from '@/lib/site';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pais?: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Inmobiliarias' });
  return {
    title: t('graciasTitle'),
    description: t('graciasText'),
    robots: { index: false, follow: false },
    alternates: { canonical: '/inmobiliarias/gracias' },
  };
}

export default async function GraciasPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { pais } = await searchParams;
  const country = getCountry(isCountryCode(pais || '') ? pais : 'do');
  const t = await getTranslations('Inmobiliarias');

  return (
    <section className="theme-dark relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-ink-950 px-5 py-28 text-fg">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1] mx-auto max-w-xl text-center">
        <p className="mono-label text-accent">{t('graciasEyebrow')}</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">{t('graciasTitle')}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {t('graciasText')}
        </p>
        <p className="mt-3 text-sm text-faint">
          {t('graciasMarket', { country: country.name })}
        </p>

        <GraciasActions
          countryCode={country.code}
          calendarUrl={site.calendarUrl}
        />

        <p className="mt-10 text-sm text-faint">
          <Link href={country.path} className="text-accent hover:underline">
            {t('graciasBack')}
          </Link>
        </p>
      </div>
    </section>
  );
}
