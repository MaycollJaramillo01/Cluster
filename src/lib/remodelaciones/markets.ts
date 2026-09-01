/** Configuración por mercado — 80–90% de la landing es reutilizable. */
export type RemodelacionesMarketId = 'cl' | 'es' | 'mx' | 'pa';

export type RemodelacionesMarket = {
  id: RemodelacionesMarketId;
  country: string;
  currency: string;
  currencyLocale: string;
  term: string;
  industryLabel: string;
  citiesHint: string;
  whatsappMessage: string;
  implementationFromUsd: number | null;
  implementationFromLocal: string | null;
  showMonthly: boolean;
  monthlyFromUsd: number | null;
  videoSrc: string | null;
  privacyPath: string;
};

export const REMODELACIONES_MARKETS: Record<RemodelacionesMarketId, RemodelacionesMarket> = {
  cl: {
    id: 'cl',
    country: 'Chile',
    currency: 'CLP',
    currencyLocale: 'es-CL',
    term: 'remodelación',
    industryLabel: 'empresas de construcción',
    citiesHint: 'Santiago, Valparaíso, Concepción y regiones',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de presupuestos para mi empresa de construcción en Chile.',
    implementationFromUsd: 1000,
    implementationFromLocal: null, 
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/remodelaciones.mp4',
    privacyPath: '/privacidad',
  },
  es: {
    id: 'es',
    country: 'España',
    currency: 'EUR',
    currencyLocale: 'es-ES',
    term: 'reforma',
    industryLabel: 'empresas de construcción y reformas',
    citiesHint: 'Madrid, Barcelona, Valencia y comunidades',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de presupuestos para mi empresa de construcción en España.',
    implementationFromUsd: 1000,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/remodelaciones.mp4',
    privacyPath: '/privacidad',
  },
  mx: {
    id: 'mx',
    country: 'México',
    currency: 'MXN',
    currencyLocale: 'es-MX',
    term: 'remodelación',
    industryLabel: 'empresas de construcción',
    citiesHint: 'CDMX, Monterrey, Guadalajara y estados',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de presupuestos para mi empresa de construcción en México.',
    implementationFromUsd: 1000,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/remodelaciones.mp4',
    privacyPath: '/privacidad',
  },
  pa: {
    id: 'pa',
    country: 'Panamá',
    currency: 'USD',
    currencyLocale: 'es-PA',
    term: 'remodelación',
    industryLabel: 'empresas de construcción',
    citiesHint: 'Panamá, Chiriquí y provincias',
    whatsappMessage:
      'Hola Cluster Media, quiero un diagnóstico de conversión de presupuestos para mi empresa de construcción en Panamá.',
    implementationFromUsd: 1000,
    implementationFromLocal: null,
    showMonthly: false,
    monthlyFromUsd: null,
    videoSrc: '/assets/videos/heroes/remodelaciones.mp4',
    privacyPath: '/privacidad',
  },
};

export const DEFAULT_REMODELACIONES_MARKET: RemodelacionesMarketId = 'cl';

export function getRemodelacionesMarket(
  id?: string | null,
): RemodelacionesMarket {
  if (id && id in REMODELACIONES_MARKETS) {
    return REMODELACIONES_MARKETS[id as RemodelacionesMarketId];
  }
  return REMODELACIONES_MARKETS[DEFAULT_REMODELACIONES_MARKET];
}

export function formatMoney(
  amount: number,
  market: RemodelacionesMarket,
): string {
  try {
    return new Intl.NumberFormat(market.currencyLocale, {
      style: 'currency',
      currency: market.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${market.currency} $${Math.round(amount).toLocaleString('es-CL')}`;
  }
}

export const CALCULATOR_STORAGE_KEY = 'cluster-remodelaciones-calculator';

export type CalculatorSnapshot = {
  budgetsPerMonth: number;
  avgTicket: number;
  closeRate: number;
  budgeted: number;
  closed: number;
  notConverted: number;
};
