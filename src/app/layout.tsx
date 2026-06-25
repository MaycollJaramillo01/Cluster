import type { Metadata, Viewport } from 'next';
import {
  Bebas_Neue,
  DM_Sans,
  IBM_Plex_Mono,
  Montserrat,
} from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { AutoTranslate } from '@/components/i18n/AutoTranslate';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  JsonLd,
  organizationSchema,
  localBusinessSchema,
} from '@/components/seo/JsonLd';
import { site } from '@/lib/site';

// Titulares: Bebas Neue — condensado ultra-bold, dark modernism
const display = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
});

// Cuerpo: DM Sans — geométrico limpio, alta legibilidad en pantalla
const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

// Etiquetas técnicas monoespaciadas
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// Tipografia de marca para el logotipo textual.
const brand = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
  weight: ['300', '400', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default:
      'Cluster Media | Comunicación digital que conecta con tu audiencia',
    template: '%s | Cluster Media',
  },
  description: site.description,
  keywords: [
    'comunicación digital para marcas',
    'contenido para redes sociales',
    'agencia de marketing digital para hispanos',
    'marketing digital para negocios hispanos',
    'marketing digital en Estados Unidos',
    'agencia de redes sociales para negocios',
    'campañas de Google Ads para negocios',
    'campañas de Meta Ads para negocios',
    'websites para negocios hispanos',
    'edición audiovisual para marcas',
    'fotografía y podcast para marcas',
    'funnels y email marketing',
    'automatización de WhatsApp para negocios',
    'agentes IA para negocios',
    'branding para negocios',
    'agencia digital en Miami',
    'marketing para negocios latinos',
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_US',
    url: site.url,
    siteName: site.name,
    title: 'Cluster Media | Comunicación digital que conecta con tu audiencia',
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cluster Media | Comunicación digital que conecta con tu audiencia',
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}
    >
      <body suppressHydrationWarning>
        <JsonLd data={organizationSchema} />
        <JsonLd data={localBusinessSchema} />
        <AutoTranslate />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
