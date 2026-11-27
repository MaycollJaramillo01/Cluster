import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terms' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/terminos' },
    robots: { index: false, follow: true },
  };
}

export default async function TerminosPage({ params }: PageParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Terms');
  const sections = t.raw('sections') as {
    servicesTitle: string;
    servicesText: string;
    pricingTitle: string;
    pricingItems: string[];
    clientTitle: string;
    clientText: string;
    resultsTitle: string;
    resultsText: string;
    contactTitle: string;
    contactText: string;
  };

  return (
    <LegalLayout title={t('title')} updated={t('updated')}>
      <p>{t('intro', { siteName: site.name })}</p>

      <div>
        <h2>{sections.servicesTitle}</h2>
        <p>{sections.servicesText.replace('{siteName}', site.name)}</p>
      </div>

      <div>
        <h2>{sections.pricingTitle}</h2>
        <ul>
          {sections.pricingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>{sections.clientTitle}</h2>
        <p>{sections.clientText}</p>
      </div>

      <div>
        <h2>{sections.resultsTitle}</h2>
        <p>{sections.resultsText}</p>
      </div>

      <div>
        <h2>{sections.contactTitle}</h2>
        <p>{sections.contactText.replace('{email}', site.email)}</p>
      </div>
      <section id="academia" className="scroll-mt-24 space-y-6">
        <header>
          <h2>{t('academy.title')}</h2>
          <p><strong>{t('academy.draft')}</strong></p>
        </header>
        <p>{t('academy.purchase')}</p>
        <section>
          <h3 className="mb-2 font-semibold text-fg">{t('academy.membershipTitle')}</h3>
          <p>{t('academy.membership')}</p>
        </section>
        <section id="reembolsos" className="scroll-mt-24 space-y-2">
          <h3 className="font-semibold text-fg">{t('academy.refundTitle')}</h3>
          <p>{t('academy.refundRequest', { email: site.email })}</p>
          <p>{t('academy.refundEffect')}</p>
        </section>
        <section>
          <h3 className="mb-2 font-semibold text-fg">{t('academy.certTitle')}</h3>
          <p>{t('academy.cert')}</p>
        </section>
      </section>
    </LegalLayout>
  );
}
