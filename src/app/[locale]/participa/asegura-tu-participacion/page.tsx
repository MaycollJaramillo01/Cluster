import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CommercialLanding } from '@/components/podcast/PodcastSite';
import { site } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: { absolute: 'Asegura tu participación | Cluster Podcast' },
  description: 'Asegura tu entrevista comercial en Cluster Podcast. $300 USD para emprendedores y $600 USD para empresas, sociedades o multinacionales.',
  alternates: { canonical: '/participa/asegura-tu-participacion' },
  openGraph: {
    title: 'Asegura tu participación en Cluster Podcast',
    description: 'Entrevista paga: $300 USD para emprendedores y $600 USD para empresas, sociedades o multinacionales.',
    url: `${site.url}/participa/asegura-tu-participacion`,
    images: ['/assets/podcast/podcast-guest.webp'],
  },
};

export default async function CommercialPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CommercialLanding />;
}
