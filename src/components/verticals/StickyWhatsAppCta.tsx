'use client';

import { trackEvent } from '@/lib/analytics';
import { whatsappLink } from '@/lib/site';

type StickyWhatsAppCtaProps = {
  label: string;
  whatsappMessage: string;
  vertical: string;
};

export function StickyWhatsAppCta({
  label,
  whatsappMessage,
  vertical,
}: StickyWhatsAppCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <a
        href={whatsappLink(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent('WhatsAppClick', {
            source: 'sticky',
            vertical,
          })
        }
        className="flex w-full items-center justify-center bg-[#25D366] px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white"
      >
        {label}
      </a>
    </div>
  );
}
