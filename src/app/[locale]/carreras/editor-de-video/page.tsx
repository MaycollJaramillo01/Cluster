import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VideoEditorLanding } from '@/components/careers/VideoEditorLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersVideoEditor' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/carreras/editor-de-video' },
  };
}

export default async function VideoEditorJobPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('CareersVideoEditor');
  const tc = await getTranslations('Common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('heroTitle'), url: `${site.url}/carreras/editor-de-video` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: t('jobTitle'),
          description: t('metaDescription'),
          datePosted: '2026-09-01',
          employmentType: 'FULL_TIME',
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: 'Anywhere' },
          hiringOrganization: {
            '@type': 'Organization',
            name: site.name,
            sameAs: site.url,
            url: site.url,
          },
          url: `${site.url}/carreras/editor-de-video`,
          directApply: true,
        }}
      />
      <VideoEditorLanding />
    </>
  );
}
