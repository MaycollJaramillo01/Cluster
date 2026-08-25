'use client';

import { MinimalContactForm } from '@/components/landings/MinimalContactForm';
import type { CountryConfig } from '@/lib/clinicas-esteticas/types';
import { getClinicasCalculatorSnapshot } from '@/lib/clinicas-esteticas/calculatorStore';
import {
  captureUtms,
  getStoredUtms,
  trackEvent,
} from '@/lib/clinicas-esteticas/tracking';

type Props = {
  country: CountryConfig;
};

export function ContactBlock({ country }: Props) {
  return (
    <MinimalContactForm
      meta={{
        vertical: 'clinicas-esteticas',
        country: country.code,
        landingPath: country.path,
      }}
      whatsappMessage={`Hola Cluster Media, vi la landing de clínicas estéticas (${country.name}) y quiero hablar sobre el sistema de conversión.`}
      graciasPath="/clinicas-esteticas/gracias"
      tracking={{
        captureUtms,
        getStoredUtms: () => getStoredUtms() as Record<string, string | undefined>,
        trackEvent: (name, payload) => trackEvent(name as 'Lead', payload),
        getCalculatorSnapshot: getClinicasCalculatorSnapshot,
      }}
    />
  );
}
