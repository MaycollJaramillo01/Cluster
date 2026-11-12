import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ParticipacionLanding } from '@/components/podcast/ParticipacionLanding';
import { site } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

const title = 'Participación en Cluster Podcast';
const description = 'Propuesta para emprendedores y empresas medianas: episodio completo en YouTube y un mínimo de 5 clips en TikTok, Instagram y Facebook.';

// Private link shared by the sales team: not in the sitemap, nav or footer, and
// noindex/nofollow. Kept crawlable in robots.txt so the noindex can be read.
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/participacion' },
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title,
    description,
    url: `${site.url}/participacion`,
    images: [{ url: '/assets/podcast/participacion-og.jpg', width: 1200, height: 630 }],
  },
};

export default async function ParticipacionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ParticipacionLanding />;
}
