'use client';

import { useTranslations } from 'next-intl';
import { DualCtas } from '@/components/landings/DualCtas';
import { trackEvent } from '@/lib/inmobiliarias/tracking';
import type { CountryCode } from '@/lib/inmobiliarias/types';
import { countries } from '@/lib/inmobiliarias/countries';

type Props = {
  countryCode: CountryCode;
  calendarUrl: string;
};

export function GraciasActions({ countryCode }: Props) {
  const t = useTranslations('Inmobiliarias');
  const country = countries[countryCode];

  return (
    <DualCtas
      className="mt-8 justify-center"
      whatsappMessage={t('waShort', { country: country.name })}
      onWhatsApp={() =>
        trackEvent('WhatsAppClick', { country: countryCode, source: 'gracias' })
      }
      onSchedule={() =>
        trackEvent('ScheduleStart', { country: countryCode })
      }
    />
  );
}
