'use client';

import { trackEvent } from '@/lib/clinicas-esteticas/tracking';
import { whatsappLink } from '@/lib/site';
import type { CountryCode } from '@/lib/clinicas-esteticas/types';
import { countries } from '@/lib/clinicas-esteticas/countries';

type Props = {
  countryCode: CountryCode;
  calendarUrl: string;
};

export function GraciasActions({ countryCode, calendarUrl }: Props) {
  const country = countries[countryCode];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <a
        href={whatsappLink(
          `Hola Cluster Media, vi la landing de clínicas estéticas (${country.name}) y quiero hablar.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent('WhatsAppClick', { country: countryCode, source: 'gracias' })
        }
        className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] px-8 py-4 font-mono text-[13px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#1ebe5a]"
      >
        Hablar por WhatsApp
      </a>
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('ScheduleStart', { country: countryCode })}
        className="inline-flex items-center justify-center gap-2.5 bg-accent px-8 py-4 font-mono text-[13px] font-medium uppercase tracking-[0.16em] text-accent-fg transition hover:opacity-90"
      >
        Agendar una llamada
      </a>
    </div>
  );
}
