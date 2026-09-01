'use client';

import { useTranslations } from 'next-intl';
import { MinimalContactForm } from '@/components/landings/MinimalContactForm';
import type { CountryConfig } from '@/lib/inmobiliarias/types';
import { getInmobiliariasCalculatorSnapshot } from '@/lib/inmobiliarias/calculatorStore';
import {
  captureUtms,
  getStoredUtms,
  trackEvent,
} from '@/lib/inmobiliarias/tracking';

type Props = {
  country: CountryConfig;
};

export function ContactBlock({ country }: Props) {
  const t = useTranslations('Inmobiliarias');

  return (
    <MinimalContactForm
      meta={{
        vertical: 'inmobiliarias',
        country: country.code,
        landingPath: country.path,
      }}
      whatsappMessage={t('waLanding', { country: country.name })}
      graciasPath="/inmobiliarias/gracias"
      tracking={{
        captureUtms,
        getStoredUtms: () => getStoredUtms() as Record<string, string | undefined>,
        trackEvent: (name, payload) => trackEvent(name as 'Lead', payload),
        getCalculatorSnapshot: getInmobiliariasCalculatorSnapshot,
      }}
    />
  );
}
