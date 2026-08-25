/** Configuración por mercado — landing reutilizable para clínicas dentales. */
export type ClinicasDentalesMarketId = 'pa' | 'cl' | 'es' | 'mx';

export type ClinicasDentalesMarket = {
  id: ClinicasDentalesMarketId;
  country: string;
  currency: string;
  currencyLocale: string;
  citiesHint: string;
  whatsappMessage: string;
  /** Defaults calculadora */
  defaultValoraciones: number;
  defaultPctPresupuesto: number;
  defaultTicket: number;
  defaultPctAceptacion: number;
  ticketRanges: { value: string; label: string }[];
  implementationFromUsd: number | null;
  implementationFromLocal: string | null;
  showMonthly: boolean;
  monthlyFromUsd: number | null;
  videoSrc: string | null;
  privacyPath: string;
};

export const CLINICAS_DENTALES_MARKETS: Record<
  ClinicasDentalesMarketId,
  ClinicasDentalesMarket
> = {
  pa: {
    id: 'pa',
    country: 'Panamá',
    currency: 'USD',
    currencyLocale: 'es-PA',
    citiesHint: 'Ciudad de Panamá, Chiriquí y provincias',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de tratamientos para mi clínica dental en Panamá.',
    defaultValoraciones: 80,
    defaultPctPresupuesto: 60,
    defaultTicket: 2500,
    defaultPctAceptacion: 35,
    ticketRanges: [
      { value: 'lt1k', label: 'Menos de US$1.000' },
      { value: '1to3k', label: 'US$1.000–3.000' },
      { value: '3to6k', label: 'US$3.000–6.000' },
      { value: '6to10k', label: 'US$6.000–10.000' },
      { value: 'gt10k', label: 'Más de US$10.000' },
    ],
    implementationFromUsd: 1500,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/clinicas-dentales.mp4',
    privacyPath: '/privacidad',
  },
  cl: {
    id: 'cl',
    country: 'Chile',
    currency: 'CLP',
    currencyLocale: 'es-CL',
    citiesHint: 'Santiago, Valparaíso, Concepción y regiones',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de tratamientos para mi clínica dental en Chile.',
    defaultValoraciones: 80,
    defaultPctPresupuesto: 60,
    defaultTicket: 2_200_000,
    defaultPctAceptacion: 35,
    ticketRanges: [
      { value: 'lt1m', label: 'Menos de $1.000.000' },
      { value: '1to3m', label: '$1.000.000–3.000.000' },
      { value: '3to6m', label: '$3.000.000–6.000.000' },
      { value: '6to10m', label: '$6.000.000–10.000.000' },
      { value: 'gt10m', label: 'Más de $10.000.000' },
    ],
    implementationFromUsd: 1500,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/clinicas-dentales.mp4',
    privacyPath: '/privacidad',
  },
  es: {
    id: 'es',
    country: 'España',
    currency: 'EUR',
    currencyLocale: 'es-ES',
    citiesHint: 'Madrid, Barcelona, Valencia y comunidades',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de tratamientos para mi clínica dental en España.',
    defaultValoraciones: 80,
    defaultPctPresupuesto: 60,
    defaultTicket: 2500,
    defaultPctAceptacion: 35,
    ticketRanges: [
      { value: 'lt1k', label: 'Menos de €1.000' },
      { value: '1to3k', label: '€1.000–3.000' },
      { value: '3to6k', label: '€3.000–6.000' },
      { value: '6to10k', label: '€6.000–10.000' },
      { value: 'gt10k', label: 'Más de €10.000' },
    ],
    implementationFromUsd: 1500,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/clinicas-dentales.mp4',
    privacyPath: '/privacidad',
  },
  mx: {
    id: 'mx',
    country: 'México',
    currency: 'MXN',
    currencyLocale: 'es-MX',
    citiesHint: 'CDMX, Monterrey, Guadalajara y estados',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de tratamientos para mi clínica dental en México.',
    defaultValoraciones: 80,
    defaultPctPresupuesto: 60,
    defaultTicket: 45_000,
    defaultPctAceptacion: 35,
    ticketRanges: [
      { value: 'lt20k', label: 'Menos de $20.000 MXN' },
      { value: '20to50k', label: '$20.000–50.000 MXN' },
      { value: '50to100k', label: '$50.000–100.000 MXN' },
      { value: '100to200k', label: '$100.000–200.000 MXN' },
      { value: 'gt200k', label: 'Más de $200.000 MXN' },
    ],
    implementationFromUsd: 1500,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/clinicas-dentales.mp4',
    privacyPath: '/privacidad',
  },
};

export const DEFAULT_CLINICAS_DENTALES_MARKET: ClinicasDentalesMarketId = 'pa';

export function getClinicasDentalesMarket(
  id?: string | null,
): ClinicasDentalesMarket {
  if (id && id in CLINICAS_DENTALES_MARKETS) {
    return CLINICAS_DENTALES_MARKETS[id as ClinicasDentalesMarketId];
  }
  return CLINICAS_DENTALES_MARKETS[DEFAULT_CLINICAS_DENTALES_MARKET];
}

export function formatMoney(
  amount: number,
  market: ClinicasDentalesMarket,
): string {
  try {
    return new Intl.NumberFormat(market.currencyLocale, {
      style: 'currency',
      currency: market.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${market.currency} ${Math.round(amount).toLocaleString('es')}`;
  }
}

export const CALCULATOR_STORAGE_KEY = 'cluster-clinicas-dentales-calculator';

export type CalculatorSnapshot = {
  valoraciones: number;
  pctPresupuesto: number;
  avgTicket: number;
  pctAceptacion: number;
  tratamientosPresupuestados: number;
  valorPresupuestado: number;
  valorConvertido: number;
  valorNoConvertido: number;
};
