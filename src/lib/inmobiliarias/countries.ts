import type { CountryCode, CountryConfig } from './types';
import { site } from '@/lib/site';

export const DEFAULT_COUNTRY: CountryCode = 'do';

export const countries: Record<CountryCode, CountryConfig> = {
  do: {
    code: 'do',
    name: 'República Dominicana',
    currency: 'USD',
    currencySymbol: 'US$',
    locale: 'es-DO',
    ogLocale: 'es_DO',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Punta Cana',
      'Bávaro',
      'Santo Domingo',
      'Santiago',
      'Cap Cana',
      'Otra',
    ],
    portals: ['Portales locales', 'Meta', 'Google', 'Website', 'WhatsApp', 'Instagram'],
    ticketRanges: [
      { label: 'Menos de US$100,000', value: '<100000' },
      { label: 'US$100,000–250,000', value: '100000-250000' },
      { label: 'US$250,000–450,000', value: '250000-450000' },
      { label: 'US$450,000–800,000', value: '450000-800000' },
      { label: 'Más de US$800,000', value: '800000+' },
    ],
    setupFrom: 1500,
    showInternationalBuyer: true,
    legalNote:
      'Los textos de privacidad se adaptan a la normativa local y a las políticas de comunicación comercial aplicables.',
    privacyLabel: 'Privacidad y datos comerciales',
    assignmentExample: {
      lead: 'Apartamento US$450K · Punta Cana · inversión',
      agent: 'Agente – Inversión internacional',
    },
    demo: {
      leads: 286,
      contacted: 241,
      qualified: 128,
      visits: 54,
      negotiations: 17,
      reservations: 8,
      sales: 5,
    },
    path: '/inmobiliarias/do',
  },
  pa: {
    code: 'pa',
    name: 'Panamá',
    currency: 'USD',
    currencySymbol: 'US$',
    locale: 'es-PA',
    ogLocale: 'es_PA',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Ciudad de Panamá',
      'Costa del Este',
      'Punta Pacífica',
      'San Francisco',
      'Coronado',
      'Otra',
    ],
    portals: ['Portales locales', 'Meta', 'Google', 'Website', 'WhatsApp', 'Instagram'],
    ticketRanges: [
      { label: 'Menos de US$150,000', value: '<150000' },
      { label: 'US$150,000–300,000', value: '150000-300000' },
      { label: 'US$300,000–550,000', value: '300000-550000' },
      { label: 'US$550,000–900,000', value: '550000-900000' },
      { label: 'Más de US$900,000', value: '900000+' },
    ],
    setupFrom: 1500,
    showInternationalBuyer: true,
    legalNote:
      'Los textos de privacidad se adaptan a la normativa local de Panamá y a las políticas de comunicación comercial aplicables.',
    privacyLabel: 'Privacidad y datos comerciales',
    assignmentExample: {
      lead: 'Residencial premium · Ciudad de Panamá · inversión',
      agent: 'Agente – Proyectos residenciales',
    },
    demo: {
      leads: 286,
      contacted: 241,
      qualified: 128,
      visits: 54,
      negotiations: 17,
      reservations: 8,
      sales: 5,
    },
    path: '/inmobiliarias/pa',
  },
  cl: {
    code: 'cl',
    name: 'Chile',
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
      'Viña del Mar',
      'Concepción',
      'Otra',
    ],
    portals: ['Portales locales', 'Meta', 'Google', 'Website', 'WhatsApp'],
    ticketRanges: [
      { label: 'Menos de $80.000.000', value: '<80000000' },
      { label: '$80.000.000–150.000.000', value: '80000000-150000000' },
      { label: '$150.000.000–300.000.000', value: '150000000-300000000' },
      { label: '$300.000.000–500.000.000', value: '300000000-500000000' },
      { label: 'Más de $500.000.000', value: '500000000+' },
    ],
    setupFrom: 1_400_000,
    showInternationalBuyer: false,
    legalNote:
      'Los textos de privacidad se adaptan a la normativa chilena vigente para comunicaciones comerciales y tratamiento de datos.',
    privacyLabel: 'Privacidad y datos comerciales',
    assignmentExample: {
      lead: 'Departamento · Las Condes · compra',
      agent: 'Agente – Zona oriente',
    },
    demo: {
      leads: 286,
      contacted: 241,
      qualified: 128,
      visits: 54,
      negotiations: 17,
      reservations: 8,
      sales: 5,
    },
    path: '/inmobiliarias/cl',
  },
  es: {
    code: 'es',
    name: 'España',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    ogLocale: 'es_ES',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Madrid',
      'Barcelona',
      'Valencia',
      'Málaga',
      'Alicante',
      'Sevilla',
      'Otra',
    ],
    portals: ['Idealista', 'Fotocasa', 'Meta', 'Google', 'Website', 'WhatsApp'],
    ticketRanges: [
      { label: 'Menos de €150.000', value: '<150000' },
      { label: '€150.000–300.000', value: '150000-300000' },
      { label: '€300.000–500.000', value: '300000-500000' },
      { label: '€500.000–800.000', value: '500000-800000' },
      { label: 'Más de €800.000', value: '800000+' },
    ],
    setupFrom: 1500,
    showInternationalBuyer: false,
    legalNote:
      'Esta página contempla adaptación RGPD: base legal, consentimiento y minimización de datos en la capa comercial.',
    privacyLabel: 'RGPD y capa comercial',
    assignmentExample: {
      lead: 'Obra nueva · Valencia · residencia',
      agent: 'Agente – Obra nueva',
    },
    demo: {
      leads: 286,
      contacted: 241,
      qualified: 128,
      visits: 54,
      negotiations: 17,
      reservations: 8,
      sales: 5,
    },
    path: '/inmobiliarias/es',
  },
  mx: {
    code: 'mx',
    name: 'México',
    currency: 'MXN',
    currencySymbol: 'MX$',
    locale: 'es-MX',
    ogLocale: 'es_MX',
    whatsappNumber: site.whatsappNumber,
    cities: [
      'Ciudad de México',
      'Guadalajara',
      'Monterrey',
      'Cancún',
      'Querétaro',
      'Mérida',
      'Otra',
    ],
    portals: ['Portales locales', 'Meta', 'Google', 'Website', 'WhatsApp'],
    ticketRanges: [
      { label: 'Menos de MX$2,000,000', value: '<2000000' },
      { label: 'MX$2,000,000–4,500,000', value: '2000000-4500000' },
      { label: 'MX$4,500,000–8,000,000', value: '4500000-8000000' },
      { label: 'MX$8,000,000–15,000,000', value: '8000000-15000000' },
      { label: 'Más de MX$15,000,000', value: '15000000+' },
    ],
    setupFrom: 28_000,
    showInternationalBuyer: false,
    legalNote:
      'Los textos de privacidad se adaptan a la LFPDPPP y a las políticas de comunicación comercial aplicables en México.',
    privacyLabel: 'Privacidad y datos comerciales',
    assignmentExample: {
      lead: 'Residencial · CDMX · compra',
      agent: 'Agente – Zona centro',
    },
    demo: {
      leads: 286,
      contacted: 241,
      qualified: 128,
      visits: 54,
      negotiations: 17,
      reservations: 8,
      sales: 5,
    },
    path: '/inmobiliarias/mx',
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
    maximumFractionDigits: 0,
  }).format(amount);
}
