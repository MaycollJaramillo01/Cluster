'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

const labels: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
};

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('Common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-surface p-0.5 ${className}`}
      role="group"
      aria-label={t('language')}
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            aria-pressed={active}
            className={`min-w-9 rounded-full px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              active
                ? 'bg-fg text-bg'
                : 'text-muted hover:text-fg'
            }`}
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}
