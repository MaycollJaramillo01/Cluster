import type { Metadata, Viewport } from 'next';
import {
  Bebas_Neue,
  DM_Sans,
  IBM_Plex_Mono,
  Montserrat,
} from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  JsonLd,
  organizationSchema,
  localBusinessSchema,
} from '@/components/seo/JsonLd';
import { routing } from '@/i18n/routing';
import { site } from '@/lib/site';

const display = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const brand = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
  weight: ['300', '800'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t('titleDefault'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    authors: [{ name: site.name }],
    creator: site.name,
    alternates: {
      canonical: locale === 'es' ? '/' : `/${locale}`,
      languages: {
        es: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'es_US',
      url: site.url,
      siteName: site.name,
      title: t('titleDefault'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('titleDefault'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('Common');

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/assets/hero-poster.jpg"
          fetchPriority="high"
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={organizationSchema} />
          <JsonLd data={localBusinessSchema} />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <FloatingWhatsApp />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
