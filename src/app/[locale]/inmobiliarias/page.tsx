import type { Metadata } from 'next';
import { InmobiliariasLanding } from '@/components/inmobiliarias/InmobiliariasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import { faqs, landingMeta } from '@/lib/inmobiliarias/content';
import { getCountry } from '@/lib/inmobiliarias/countries';
import { site } from '@/lib/site';

const country = getCountry('do');

export const metadata: Metadata = {
  title: landingMeta.title,
  description: landingMeta.description,
  alternates: {
    canonical: '/inmobiliarias',
    languages: {
      'es-DO': '/inmobiliarias/do',
      'es-PA': '/inmobiliarias/pa',
      'es-CL': '/inmobiliarias/cl',
      'es-ES': '/inmobiliarias/es',
      'es-MX': '/inmobiliarias/mx',
    },
  },
  openGraph: {
    title: landingMeta.title,
    description: landingMeta.description,
    url: `${site.url}/inmobiliarias`,
    locale: country.ogLocale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: landingMeta.title,
    description: landingMeta.description,
  },
};

export default function InmobiliariasPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Sistema de conversión de leads para inmobiliarias',
          description: landingMeta.description,
          url: `${site.url}/inmobiliarias`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema([...faqs])} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Inmobiliarias', url: `${site.url}/inmobiliarias` },
        ])}
      />
      <InmobiliariasLanding country={country} />
    </>
  );
}
