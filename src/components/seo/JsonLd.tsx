import { site } from '@/lib/site';

// Inserta JSON-LD de forma segura en el <head>/<body>.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  sameAs: [
    site.social.instagram,
    site.social.facebook,
    site.social.linkedin,
    site.social.youtube,
  ],
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  image: `${site.url}/og-image.jpg`,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: ['US', 'HN', 'MX', 'ES', 'Latinoamérica'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Miami',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  priceRange: '$$',
};

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  price?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: { '@type': 'Organization', name: site.name, url: site.url },
    areaServed: ['US', 'Latinoamérica', 'ES'],
    ...(opts.price && {
      offers: {
        '@type': 'Offer',
        price: opts.price,
        priceCurrency: 'USD',
      },
    }),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
