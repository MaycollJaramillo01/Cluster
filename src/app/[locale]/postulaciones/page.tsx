import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApplicationsOffice } from '@/components/careers/admin/ApplicationsOffice';

type PageParams = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersAdmin' });

  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function PostulacionesPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ApplicationsOffice />;
}
