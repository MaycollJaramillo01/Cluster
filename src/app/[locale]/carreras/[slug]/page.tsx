import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JobLanding } from '@/components/careers/JobLanding';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { site } from '@/lib/site';
import { DEFAULT_JOB_SLUG } from '@/lib/careers/types';
import { getJob } from '@/lib/careers/jobs';

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug === DEFAULT_JOB_SLUG) return {};
  const job = await getJob(slug);
  if (!job || !job.open) return { title: 'Carreras' };

  return {
    title: job.title,
    description: job.summary,
    alternates: { canonical: `/carreras/${job.slug}` },
  };
}

export default async function CareerJobPage({ params }: PageParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (slug === DEFAULT_JOB_SLUG) notFound();

  const job = await getJob(slug);
  if (!job || !job.open) notFound();

  const tc = await getTranslations('Common');
  const t = await getTranslations('CareersJobs');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: t('indexTitle'), url: `${site.url}/carreras` },
          { name: job.title, url: `${site.url}/carreras/${job.slug}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.summary,
          datePosted: job.createdAt.slice(0, 10),
          employmentType: 'FULL_TIME',
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: 'Anywhere' },
          hiringOrganization: {
            '@type': 'Organization',
            name: site.name,
            sameAs: site.url,
            url: site.url,
          },
          url: `${site.url}/carreras/${job.slug}`,
          directApply: true,
        }}
      />
      <JobLanding job={job} />
    </>
  );
}
