import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/postulaciones', '/en/postulaciones'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
