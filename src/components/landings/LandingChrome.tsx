'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { DualCtas } from '@/components/landings/DualCtas';
import { trackEvent } from '@/lib/analytics';

type Props = {
  vertical: string;
  marketId: string;
  whatsappMessage: string;
};

/** Chrome compartido de landings verticales (progreso, sticky CTAs, cookies). */
export function LandingChrome({ vertical, marketId, whatsappMessage }: Props) {
  const t = useTranslations('Common');
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [cookieOk, setCookieOk] = useState(true);

  useEffect(() => {
    trackEvent('PageView', {
      market: marketId,
      path:
        typeof window !== 'undefined' ? window.location.pathname : undefined,
      vertical,
    });
    trackEvent('landing_view', { market: marketId, page: vertical });

    try {
      const storage = window.localStorage;
      if (storage && typeof storage.getItem === 'function') {
        setCookieOk(storage.getItem('cm_cookie_ok') === '1');
      } else {
        setCookieOk(false);
      }
    } catch {
      setCookieOk(false);
    }

    let scrolled50 = false;
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      setProgress(pct);
      setShowTop(doc.scrollTop > 600);
      setShowSticky(doc.scrollTop > 700);

      if (!scrolled50 && pct >= 50) {
        scrolled50 = true;
        trackEvent('Scroll50', { market: marketId, vertical });
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [marketId, vertical]);

  function acceptCookies() {
    try {
      const storage = window.localStorage;
      if (storage && typeof storage.setItem === 'function') {
        storage.setItem('cm_cookie_ok', '1');
      }
    } catch {
      /* ignore */
    }
    setCookieOk(true);
  }

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-0.5 bg-accent transition-[width] duration-150"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-950/95 p-3 backdrop-blur md:hidden">
          <DualCtas
            size="md"
            className="justify-center"
            whatsappMessage={whatsappMessage}
            onWhatsApp={() =>
              trackEvent('WhatsAppClick', {
                market: marketId,
                source: 'sticky',
                page: vertical,
              })
            }
            onSchedule={() =>
              trackEvent('ScheduleStart', {
                market: marketId,
                source: 'sticky',
                page: vertical,
              })
            }
          />
        </div>
      )}

      {showTop && (
        <button
          type="button"
          aria-label={t('backToTop')}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-28 right-5 z-40 flex h-11 w-11 items-center justify-center border border-line bg-ink-900 text-fg shadow-panel transition hover:border-accent hover:text-accent md:bottom-5"
        >
          <Icon name="chevron-down" size={18} className="rotate-180" />
        </button>
      )}

      {!cookieOk && (
        <div className="fixed inset-x-4 bottom-28 z-50 max-w-lg border border-line bg-ink-900 p-4 text-sm text-muted shadow-panel sm:left-5 sm:right-auto md:bottom-5">
          <p>
            {t('cookieBanner')}{' '}
            <Link href="/privacidad" className="text-accent link-underline">
              {t('privacy')}
            </Link>
          </p>
          <button
            type="button"
            onClick={acceptCookies}
            className="mt-3 bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-fg"
          >
            {t('cookieAccept')}
          </button>
        </div>
      )}
    </>
  );
}
