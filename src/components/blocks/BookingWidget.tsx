'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { site } from '@/lib/site';

type BookingWidgetProps = {
  className?: string;
};

export function BookingWidget({ className = '' }: BookingWidgetProps) {
  const tc = useTranslations('Common');

  return (
    <div className={className}>
      <iframe
        src={site.calendarEmbedUrl}
        title={tc('scheduleCallCluster')}
        allow="payment"
        className="w-full border-0"
        style={{ minHeight: 720, overflow: 'hidden' }}
      />
      <Script src={site.bookingScriptUrl} strategy="lazyOnload" />
    </div>
  );
}
