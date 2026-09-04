import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/blocks/PageHero';
import { listJobs } from '@/lib/careers/jobs';

type PageParams = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersJobs' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/carreras' },
  };
}

export default async function CarrerasPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('CareersJobs');
  const jobs = (await listJobs()).filter((job) => job.open);

  return (
    <>
      <PageHero
        videoSrc="/assets/videos/heroes/redes-sociales.mp4"
        eyebrow={t('heroEyebrow')}
        title={t('indexTitle')}
        subtitle={t('indexSubtitle')}
        hideCtas
      />
      <section className="theme-light bg-paper py-16 text-fg sm:py-24">
        <div className="container-x">
          {jobs.length === 0 ? (
            <p className="text-muted">{t('empty')}</p>
          ) : (
            <ul className="grid gap-4">
              {jobs.map((job) => (
                <li key={job.slug}>
                  <Link
                    href={`/carreras/${job.slug}`}
                    className="block border border-ink-950/10 bg-paper p-6 transition-colors hover:border-accent sm:p-8"
                  >
                    <p className="mono-label text-accent">{t('roleEyebrow')}</p>
                    <h2 className="mt-3 font-display text-3xl font-semibold uppercase text-ink-950">
                      {job.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{job.summary}</p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      {job.location} · {job.employment}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
