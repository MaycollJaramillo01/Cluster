import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CareersAuthGate } from '@/components/careers/admin/CareersAuthGate';
import { JobsOffice } from '@/components/careers/admin/JobsOffice';
import { isAdminRequest } from '@/lib/careers/auth';

type PageParams = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersAdmin' });

  return {
    title: t('jobsMetaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function PostulacionesPuestosPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const authed = await isAdminRequest();
  return (
    <CareersAuthGate initial={authed ? 'ready' : 'email'}>
      <JobsOffice />
    </CareersAuthGate>
  );
}
