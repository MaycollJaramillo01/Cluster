'use client';

import { useTranslations } from 'next-intl';
import { DualCtas } from '@/components/landings/DualCtas';
import { trackEvent } from '@/lib/clinicas-esteticas/tracking';
import type { CountryCode } from '@/lib/clinicas-esteticas/types';
import { countries } from '@/lib/clinicas-esteticas/countries';

type Props = {
  countryCode: CountryCode;
  calendarUrl?: string;
};

export function GraciasActions({ countryCode }: Props) {
  const t = useTranslations('ClinicasEsteticas');
  const country = countries[countryCode];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <DualCtas
        className="justify-center"
        whatsappMessage={t('waShort', { country: country.name })}
        onWhatsApp={() =>
          trackEvent('WhatsAppClick', {
            country: countryCode,
            source: 'gracias',
          })
        }
        onSchedule={() =>
          trackEvent('ScheduleStart', {
            country: countryCode,
            source: 'gracias',
          })
        }
      />
    </div>
  );
}
