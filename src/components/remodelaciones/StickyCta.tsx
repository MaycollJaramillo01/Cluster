'use client';

import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';

export function StickyCta({ href = '#diagnostico' }: { href?: string }) {
  const t = useTranslations('Remodelaciones');

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <a
        href={href}
        onClick={() => trackEvent('click_sticky_cta', { target: href })}
        className="flex w-full items-center justify-center bg-accent px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-fg"
      >
        {t('stickyCta')}
      </a>
    </div>
  );
}
