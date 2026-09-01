'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { site, whatsappLink } from '@/lib/site';

type Props = {
  whatsappMessage: string;
  onWhatsApp?: () => void;
  onSchedule?: () => void;
  className?: string;
  size?: 'md' | 'lg';
};

/** CTAs principales: WhatsApp y agenda, sin formulario previo. */
export function DualCtas({
  whatsappMessage,
  onWhatsApp,
  onSchedule,
  className = '',
  size = 'lg',
}: Props) {
  const t = useTranslations('Common');
  const pad =
    size === 'lg' ? 'px-8 py-4 text-[13px]' : 'px-6 py-3.5 text-xs';

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <a
        href={whatsappLink(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onWhatsApp}
        className={`inline-flex w-full items-center justify-center gap-2.5 bg-[#25D366] font-mono font-medium uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#1ebe5a] ${pad}`}
      >
        <Icon name="whatsapp" size={18} />
        {t('talkWhatsApp')}
      </a>
      <a
        href={site.calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onSchedule}
        className={`inline-flex w-full items-center justify-center gap-2.5 bg-accent font-mono font-medium uppercase tracking-[0.16em] text-accent-fg transition hover:-translate-y-0.5 hover:opacity-90 ${pad}`}
      >
        {t('bookCall')}
      </a>
    </div>
  );
}
