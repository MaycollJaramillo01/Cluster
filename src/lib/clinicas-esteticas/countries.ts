import type { CountryCode, CountryConfig } from './types';
import { site } from '@/lib/site';

export const DEFAULT_COUNTRY: CountryCode = 'pa';

export const countries: Record<CountryCode, CountryConfig> = {
  pa: {
    code: 'pa',
    name: 'Panamá',
    demonym: 'panameñas',
    currency: 'USD',
    currencySymbol: 'US$',
    locale: 'es-PA',
    ogLocale: 'es_PA',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Ciudad de Panamá',
      'San Francisco',
      'Costa del Este',
      'Punta Pacífica',
      'Clayton',
      'Otra',
    ],
    ticketRanges: [
      { label: 'Menos de US$200', value: '<200' },
      { label: 'US$200–500', value: '200-500' },
      { label: 'US$500–1,000', value: '500-1000' },
      { label: 'US$1,000–2,500', value: '1000-2500' },
      { label: 'Más de US$2,500', value: '2500+' },
    ],
    setupFrom: 1500,
    monthlyFrom: undefined,
    legalNote:
      'Los textos de privacidad se adaptan a la normativa local de Panamá y a las políticas de comunicación comercial aplicables.',
    privacyLabel: 'Privacidad y datos comerciales',
    financingEnabled: true,
    demo: {
      adSpend: 2800,
      consultations: 142,
      appointments: 68,
      attended: 54,
      treatments: 31,
      revenue: 46500,
    },
    path: '/clinicas-esteticas/pa',
  },
  cl: {
    code: 'cl',
    name: 'Chile',
    demonym: 'chilenas',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    ogLocale: 'es_CL',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Santiago',
      'Las Condes',
      'Providencia',
      'Vitacura',
      'Ñuñoa',
      'Viña del Mar',
      'Concepción',
      'Otra',
    ],
    ticketRanges: [
      { label: 'Menos de $150.000', value: '<150000' },
      { label: '$150.000–400.000', value: '150000-400000' },
      { label: '$400.000–800.000', value: '400000-800000' },
      { label: '$800.000–1.500.000', value: '800000-1500000' },
      { label: 'Más de $1.500.000', value: '1500000+' },
    ],
    setupFrom: 1_400_000,
    monthlyFrom: undefined,
    legalNote:
      'Los textos de privacidad se adaptan a la normativa chilena vigente para comunicaciones comerciales y tratamiento de datos.',
    privacyLabel: 'Privacidad y datos comerciales',
    financingEnabled: true,
    demo: {
      adSpend: 2_500_000,
      consultations: 142,
      appointments: 68,
      attended: 54,
      treatments: 31,
      revenue: 42_000_000,
    },
    path: '/clinicas-esteticas/cl',
  },
  es: {
    code: 'es',
    name: 'España',
    demonym: 'españolas',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    ogLocale: 'es_ES',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Madrid',
      'Barcelona',
      'Valencia',
      'Sevilla',
      'Málaga',
      'Bilbao',
      'Otra',
    ],
    ticketRanges: [
      { label: 'Menos de €150', value: '<150' },
      { label: '€150–400', value: '150-400' },
      { label: '€400–800', value: '400-800' },
      { label: '€800–1.500', value: '800-1500' },
      { label: 'Más de €1.500', value: '1500+' },
    ],
    setupFrom: 1500,
    monthlyFrom: undefined,
    legalNote:
      'Esta página contempla adaptación RGPD: base legal, consentimiento y minimización de datos en la capa comercial.',
    privacyLabel: 'RGPD y separación clínica/comercial',
    financingEnabled: true,
    demo: {
      adSpend: 2400,
      consultations: 142,
      appointments: 68,
      attended: 54,
      treatments: 31,
      revenue: 38500,
    },
    path: '/clinicas-esteticas/es',
  },
  mx: {
    code: 'mx',
    name: 'México',
    demonym: 'mexicanas',
    currency: 'MXN',
    currencySymbol: 'MX$',
    locale: 'es-MX',
    ogLocale: 'es_MX',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Ciudad de México',
      'Guadalajara',
      'Monterrey',
      'Puebla',
      'Querétaro',
      'Mérida',
      'Otra',
    ],
    ticketRanges: [
      { label: 'Menos de MX$3,000', value: '<3000' },
      { label: 'MX$3,000–8,000', value: '3000-8000' },
      { label: 'MX$8,000–15,000', value: '8000-15000' },
      { label: 'MX$15,000–30,000', value: '15000-30000' },
      { label: 'Más de MX$30,000', value: '30000+' },
    ],
    setupFrom: 28_000,
    monthlyFrom: undefined,
    legalNote:
      'Los textos de privacidad se adaptan a la LFPDPPP y a las políticas de comunicación comercial aplicables en México.',
    privacyLabel: 'Privacidad y datos comerciales',
    financingEnabled: true,
    demo: {
      adSpend: 48_000,
      consultations: 142,
      appointments: 68,
      attended: 54,
      treatments: 31,
      revenue: 775_000,
    },
    path: '/clinicas-esteticas/mx',
  },
};

export const countryCodes = Object.keys(countries) as CountryCode[];

export function isCountryCode(value: string): value is CountryCode {
  return value in countries;
}

export function getCountry(code?: string | null): CountryConfig {
  if (code && isCountryCode(code)) return countries[code];
  return countries[DEFAULT_COUNTRY];
}

export function formatMoney(amount: number, country: CountryConfig): string {
  return new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency,
    maximumFractionDigits: country.currency === 'CLP' ? 0 : 0,
  }).format(amount);
}
