import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LeadQuiz } from '@/components/forms/LeadQuiz';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Diagnostico' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/diagnostico' },
  };
}

export default async function DiagnosticoPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Diagnostico');

  return (
    <section className="theme-dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-5 py-28 text-fg sm:py-32">
      <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 top-1/2 h-[44rem] w-[44rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(2,195,154,0.18),transparent_70%)] blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />

      <div className="relative z-[1] flex w-full max-w-xl flex-col items-center">
        <div className="mb-10 text-center">
          <span className="mono-label inline-flex items-center gap-3 text-accent">
            <span className="inline-block h-px w-8 bg-accent" />
            {t('eyebrow')}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-fg sm:text-5xl">
            {t('titleBefore')}{' '}
            <span className="text-accent">{t('titleHighlight')}</span>
            {t('titleAfter')}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            {t('subtitle')}
          </p>
        </div>

        <LeadQuiz />
      </div>
    </section>
  );
}
