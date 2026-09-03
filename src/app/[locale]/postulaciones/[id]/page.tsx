import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApplicationProfile } from '@/components/careers/admin/ApplicationProfile';
import { CareersAuthGate } from '@/components/careers/admin/CareersAuthGate';
import { hasPassword, isAdminRequest } from '@/lib/careers/auth';

type PageParams = { params: Promise<{ locale: string; id: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersAdmin' });

  return {
    title: t('profileMetaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function PostulacionProfilePage({ params }: PageParams) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const authed = await isAdminRequest();
  const configured = await hasPassword();
  return (
    <CareersAuthGate initial={authed ? 'ready' : configured ? 'login' : 'setup'}>
      <ApplicationProfile id={id} />
    </CareersAuthGate>
  );
}
