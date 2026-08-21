import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/privacidad' },
    robots: { index: false, follow: true },
  };
}

export default async function PrivacidadPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Privacy');
  const sections = t.raw('sections') as {
    collectTitle: string;
    collectText: string;
    useTitle: string;
    useItems: string[];
    cookiesTitle: string;
    cookiesText: string;
    rightsTitle: string;
    rightsText: string;
    contactTitle: string;
    contactText: string;
  };

  return (
    <LegalLayout title={t('title')} updated={t('updated')}>
      <p>{t('intro', { siteName: site.name })}</p>

      <div>
        <h2>{sections.collectTitle}</h2>
        <p>{sections.collectText}</p>
      </div>

      <div>
        <h2>{sections.useTitle}</h2>
        <ul>
          {sections.useItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>{sections.cookiesTitle}</h2>
        <p>{sections.cookiesText}</p>
      </div>

      <div>
        <h2>{sections.rightsTitle}</h2>
        <p>
          {sections.rightsText.split('{email}')[0]}
          <a href={`mailto:${site.email}`} className="text-accent underline">
            {site.email}
          </a>
          {sections.rightsText.split('{email}')[1] ?? ''}
        </p>
      </div>

      <div>
        <h2>{sections.contactTitle}</h2>
        <p>
          {sections.contactText.replace('{email}', site.email)}
        </p>
      </div>
    </LegalLayout>
  );
}
