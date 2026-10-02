import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { EditorialLanding } from '@/components/podcast/PodcastSite';
import { site } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: { absolute: 'Participa en Cluster Podcast | Cuenta tu historia' },
  description: 'Postula tu historia para participar sin costo en Cluster Podcast. Cada mes seleccionamos a 2 emprendedores.',
  alternates: { canonical: '/participa' },
  openGraph: {
    title: 'Tu historia merece ser escuchada',
    description: 'Postula tu historia para participar en Cluster Podcast.',
    url: `${site.url}/participa`,
    images: ['/assets/podcast/podcast-hero.webp'],
  },
};

export default async function ParticipaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EditorialLanding />;
}
