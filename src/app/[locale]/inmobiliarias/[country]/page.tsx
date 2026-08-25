import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InmobiliariasLanding } from '@/components/inmobiliarias/InmobiliariasLanding';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from '@/components/seo/JsonLd';
import { faqs, landingMeta } from '@/lib/inmobiliarias/content';
import {
  countryCodes,
  getCountry,
  isCountryCode,
} from '@/lib/inmobiliarias/countries';
import { site } from '@/lib/site';

type Props = {
  params: Promise<{ country: string }>;
};

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: code } = await params;
  if (!isCountryCode(code)) return {};
  const country = getCountry(code);
  const title = `${landingMeta.title} · ${country.name}`;
  const description = `${landingMeta.description} Mercado: ${country.name}.`;

  return {
    title,
    description,
    alternates: { canonical: country.path },
    openGraph: {
      title,
      description,
      url: `${site.url}${country.path}`,
      locale: country.ogLocale,
      type: 'website',
    },
  };
}

export default async function InmobiliariasCountryPage({ params }: Props) {
  const { country: code } = await params;
  if (!isCountryCode(code)) notFound();
  const country = getCountry(code);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Conversión de leads inmobiliarios — ${country.name}`,
          description: landingMeta.description,
          url: `${site.url}${country.path}`,
          price: String(country.setupFrom),
        })}
      />
      <JsonLd data={faqSchema([...faqs])} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: site.url },
          { name: 'Inmobiliarias', url: `${site.url}/inmobiliarias` },
          { name: country.name, url: `${site.url}${country.path}` },
        ])}
      />
      <InmobiliariasLanding country={country} />
    </>
  );
}
