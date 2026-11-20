import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { GrowthLanding } from '@/components/crecimiento/GrowthLanding';
import { verticals } from '@/components/crecimiento/content';
import { site } from '@/lib/site';

type PageParams = { params: Promise<{ locale: string; vertical: string }> };

// Solo existen las verticales de content.ts, y solo en español.
export const dynamicParams = false;

// Devuelve locale y vertical juntos: desde Next 15.5 el `params` del padre no llegaba con
// locale y la ruta quedaba sin páginas (404 con dynamicParams = false).
export function generateStaticParams() {
  return verticals.map((v) => ({ locale: 'es', vertical: v.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { vertical } = await params;
  const v = verticals.find((item) => item.slug === vertical);
  if (!v) return {};
  const path = `/crecimiento/${v.slug}`;

  return {
    title: { absolute: v.meta.title },
    description: v.meta.description,
    alternates: { canonical: path },
    // Landings de campaña (Meta Ads): fuera del índice para no competir con las páginas SEO.
    robots: { index: false, follow: false },
    openGraph: {
      title: v.meta.title,
      description: v.meta.description,
      url: `${site.url}${path}`,
      locale: 'es_US',
      type: 'website',
      siteName: site.name,
    },
  };
}

export default async function CrecimientoPage({ params }: PageParams) {
  const { locale, vertical } = await params;
  setRequestLocale(locale);
  const v = verticals.find((item) => item.slug === vertical);
  if (!v) notFound();

  return <GrowthLanding v={v} />;
}
