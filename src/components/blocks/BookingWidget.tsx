'use client';

import Script from 'next/script';
import { site } from '@/lib/site';

type BookingWidgetProps = {
  className?: string;
};

export function BookingWidget({ className = '' }: BookingWidgetProps) {
  return (
    <div className={className}>
      <iframe
        src={site.calendarEmbedUrl}
        title="Agendar llamada con Cluster Media"
        allow="payment"
        className="w-full border-0"
        style={{ minHeight: 720, overflow: 'hidden' }}
      />
      <Script src={site.bookingScriptUrl} strategy="lazyOnload" />
    </div>
  );
}
