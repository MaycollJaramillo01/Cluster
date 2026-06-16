import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1, freq: 'weekly' as const },
    { path: '/servicios', priority: 0.9, freq: 'monthly' as const },
    { path: '/paquete-inicial-digital', priority: 0.9, freq: 'monthly' as const },
    { path: '/redes-sociales', priority: 0.8, freq: 'monthly' as const },
    { path: '/google-ads', priority: 0.8, freq: 'monthly' as const },
    { path: '/branding', priority: 0.8, freq: 'monthly' as const },
    { path: '/automatizaciones-ia', priority: 0.8, freq: 'monthly' as const },
    { path: '/websites-seo', priority: 0.8, freq: 'monthly' as const },
    { path: '/casos-de-exito', priority: 0.7, freq: 'monthly' as const },
    { path: '/sobre-cluster', priority: 0.6, freq: 'monthly' as const },
    { path: '/blog', priority: 0.7, freq: 'weekly' as const },
    { path: '/contacto', priority: 0.6, freq: 'yearly' as const },
  ];

  const now = new Date();

  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
