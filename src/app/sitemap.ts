import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { site } from '@/lib/site';

const routes = [
  { path: '/', priority: 1, freq: 'weekly' as const },
  { path: '/servicios', priority: 0.9, freq: 'monthly' as const },
  { path: '/paquete-inicial-digital', priority: 0.9, freq: 'monthly' as const },
  { path: '/planes/next', priority: 0.85, freq: 'monthly' as const },
  { path: '/planes/advance', priority: 0.85, freq: 'monthly' as const },
  { path: '/planes/enterprise', priority: 0.85, freq: 'monthly' as const },
  { path: '/planes/cluster', priority: 0.85, freq: 'monthly' as const },
  { path: '/redes-sociales', priority: 0.8, freq: 'monthly' as const },
  { path: '/google-ads', priority: 0.8, freq: 'monthly' as const },
  { path: '/branding', priority: 0.8, freq: 'monthly' as const },
  { path: '/automatizaciones-ia', priority: 0.8, freq: 'monthly' as const },
  { path: '/websites-seo', priority: 0.8, freq: 'monthly' as const },
  { path: '/desarrollo-web', priority: 0.9, freq: 'monthly' as const },
  { path: '/desarrollo-web/website', priority: 0.85, freq: 'monthly' as const },
  { path: '/desarrollo-web/website-plus', priority: 0.85, freq: 'monthly' as const },
  { path: '/desarrollo-web/website-leads', priority: 0.85, freq: 'monthly' as const },
  { path: '/desarrollo-web/website-seo', priority: 0.85, freq: 'monthly' as const },
  { path: '/desarrollo-web/website-seo-leads', priority: 0.85, freq: 'monthly' as const },
  { path: '/seo-audit', priority: 0.8, freq: 'monthly' as const },
  { path: '/ruta-local', priority: 0.9, freq: 'monthly' as const },
  { path: '/casos-de-exito', priority: 0.7, freq: 'monthly' as const },
  { path: '/sobre-cluster', priority: 0.6, freq: 'monthly' as const },
  { path: '/blog', priority: 0.7, freq: 'weekly' as const },
  { path: '/contacto', priority: 0.6, freq: 'yearly' as const },
  { path: '/agendar', priority: 0.8, freq: 'monthly' as const },
  { path: '/remodelaciones', priority: 0.95, freq: 'weekly' as const },
  { path: '/remodelaciones/cl', priority: 0.9, freq: 'weekly' as const },
  { path: '/remodelaciones/es', priority: 0.85, freq: 'weekly' as const },
  { path: '/remodelaciones/mx', priority: 0.85, freq: 'weekly' as const },
  { path: '/remodelaciones/pa', priority: 0.85, freq: 'weekly' as const },
  { path: '/clinicas-dentales', priority: 0.95, freq: 'weekly' as const },
  { path: '/clinicas-dentales/pa', priority: 0.9, freq: 'weekly' as const },
  { path: '/clinicas-dentales/cl', priority: 0.85, freq: 'weekly' as const },
  { path: '/clinicas-dentales/es', priority: 0.85, freq: 'weekly' as const },
  { path: '/clinicas-dentales/mx', priority: 0.85, freq: 'weekly' as const },
  { path: '/diagnostico', priority: 0.5, freq: 'yearly' as const },
  { path: '/carreras/editor-de-video', priority: 0.7, freq: 'weekly' as const },
  { path: '/privacidad', priority: 0.3, freq: 'yearly' as const },
  { path: '/terminos', priority: 0.3, freq: 'yearly' as const },
];

function localePath(locale: string, path: string) {
  if (locale === routing.defaultLocale) {
    return path === '/' ? '/' : path;
  }
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    routes.map((route) => {
      const localizedPath = localePath(locale, route.path);
      const languages = Object.fromEntries(
        routing.locales.map((alt) => [alt, `${site.url}${localePath(alt, route.path)}`]),
      );
      languages['x-default'] = `${site.url}${localePath(routing.defaultLocale, route.path)}`;

      return {
        url: `${site.url}${localizedPath}`,
        lastModified: now,
        changeFrequency: route.freq,
        priority: route.priority,
        alternates: { languages },
      };
    }),
  );
}
