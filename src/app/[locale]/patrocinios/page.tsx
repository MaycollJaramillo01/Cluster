import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SponsorsLanding } from '@/components/podcast/PodcastSite';
import { site } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: { absolute: 'Patrocinios | Cluster Podcast' },
  description: 'Integra tu marca a Cluster Podcast mediante episodios patrocinados, planes mensuales y contenido multiplataforma.',
  alternates: { canonical: '/patrocinios' },
  openGraph: {
    title: 'Haz que tu marca sea parte de la conversación',
    description: 'Opciones de patrocinio e integración de marca en Cluster Podcast.',
    url: `${site.url}/patrocinios`,
    images: ['/assets/podcast/podcast-production.webp'],
  },
};

export default async function SponsorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SponsorsLanding />;
}
