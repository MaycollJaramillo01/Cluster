import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CommercialLanding } from '@/components/podcast/PodcastSite';
import { site } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: { absolute: 'Asegura tu participación | Cluster Podcast' },
  description: 'Evalúa tu historia y solicita una participación comercial en Cluster Podcast.',
  alternates: { canonical: '/participa/asegura-tu-participacion' },
  openGraph: {
    title: 'Asegura tu participación en Cluster Podcast',
    description: 'Conoce la modalidad de participación disponible para tu historia.',
    url: `${site.url}/participa/asegura-tu-participacion`,
    images: ['/assets/podcast/podcast-guest.webp'],
  },
};

export default async function CommercialPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CommercialLanding />;
}
