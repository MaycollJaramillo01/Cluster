import { defineRouting } from 'next-intl/routing';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  // Explicit URLs are more predictable for campaigns and avoid recursive
  // default-locale redirects in self-hosted Next.js production servers.
  localeDetection: false,
});
