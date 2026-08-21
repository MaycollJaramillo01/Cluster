import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow } from '@/components/ui/Section';
import { Icon } from '@/components/ui/Icon';
import { CTASection } from '@/components/blocks/CTASection';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { routing } from '@/i18n/routing';
import { getLocalizedArticles } from '@/lib/localized-content';
import { articles as articleMeta, site } from '@/lib/site';

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    articleMeta.map((article) => ({ locale, slug: article.slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const messages = await getMessages({ locale });
  const article = getLocalizedArticles(messages).find((a) => a.slug === slug);
  const tc = await getTranslations({ locale, namespace: 'Common' });

  if (!article) return { title: tc('articleNotFound') };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('BlogArticle');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');
  const messages = await getMessages();
  const articles = getLocalizedArticles(messages);
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          articleSection: article.category,
          author: { '@type': 'Organization', name: site.name },
          publisher: { '@type': 'Organization', name: site.name },
          mainEntityOfPage: `${site.url}/blog/${article.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tc('home'), url: site.url },
          { name: tn('blog'), url: `${site.url}/blog` },
          { name: article.title, url: `${site.url}/blog/${article.slug}` },
        ])}
      />

      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div className="hero-accent-fade absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(60%_60%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container-x relative z-[1] max-w-3xl">
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="mt-6 text-3xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <div className="mt-6 flex items-center gap-4 font-mono text-sm text-faint">
            <span>{site.name}</span>
            <span>·</span>
            <span>{tc('readingTime', { time: article.readingTime })}</span>
          </div>
        </div>
      </section>

      <article className="bg-ink-900 py-16 sm:py-20">
        <div className="container-x max-w-3xl">
          <div className="space-y-6 text-lg leading-relaxed text-muted">
            <p className="text-xl text-muted">{article.excerpt}</p>
            <p>{t('introTemplate', { siteName: site.name })}</p>
            <h2 className="font-display text-2xl font-semibold text-fg">{t('whyTitle')}</h2>
            <p>{t('whyText')}</p>
            <h2 className="font-display text-2xl font-semibold text-fg">{t('howTitle')}</h2>
            <p>{t('howText')}</p>
            <p className="rounded-2xl bg-surface p-5 text-base text-muted">
              <strong className="text-fg">{tc('important')}</strong> {tc('templateNote')}
            </p>
          </div>

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-accent"
          >
            <Icon name="arrow-right" size={16} className="rotate-180" />
            {tc('backToBlog')}
          </Link>
        </div>
      </article>

      <section className="border-t border-line bg-ink-850 py-16">
        <div className="container-x">
          <h2 className="mb-8 font-display text-2xl font-semibold text-fg">
            {tc('keepReading')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="card-dark group p-6">
                <span className="mono-label text-accent">{a.category}</span>
                <h3 className="mt-3 font-display text-base font-semibold leading-snug text-fg">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection whatsappMessage={t('ctaWhatsapp')} />
    </>
  );
}
