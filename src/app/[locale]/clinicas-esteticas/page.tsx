import type { Metadata } from 'next';
import { ClinicasEsteticasLanding } from '@/components/clinicas-esteticas/ClinicasEsteticasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import { faqs, landingMeta } from '@/lib/clinicas-esteticas/content';
import { getCountry } from '@/lib/clinicas-esteticas/countries';
import { site } from '@/lib/site';

const country = getCountry('pa');

export const metadata: Metadata = {
  title: landingMeta.title,
  description: landingMeta.description,
  alternates: {
    canonical: '/clinicas-esteticas',
    languages: {
      'es-PA': '/clinicas-esteticas/pa',
      'es-CL': '/clinicas-esteticas/cl',
      'es-ES': '/clinicas-esteticas/es',
      'es-MX': '/clinicas-esteticas/mx',
    },
  },
  openGraph: {
    title: landingMeta.title,
    description: landingMeta.description,
    url: `${site.url}/clinicas-esteticas`,
    locale: country.ogLocale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: landingMeta.title,
    description: landingMeta.description,
  },
};

export default function ClinicasEsteticasPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Sistema de conversión para clínicas de medicina estética',
          description: landingMeta.description,
          url: `${site.url}/clinicas-esteticas`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema([...faqs])} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          {
            name: 'Clínicas estéticas',
            url: `${site.url}/clinicas-esteticas`,
          },
        ])}
      />
      <ClinicasEsteticasLanding country={country} />
    </>
  );
}
