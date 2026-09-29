const HUMAN_COST_USD = 560;

const countryCurrencies: Record<string, { currency: string; locale: string }> = {
  AR: { currency: 'ARS', locale: 'es-AR' },
  BO: { currency: 'BOB', locale: 'es-BO' },
  BR: { currency: 'BRL', locale: 'pt-BR' },
  BZ: { currency: 'BZD', locale: 'es-BZ' },
  CA: { currency: 'CAD', locale: 'en-CA' },
  CL: { currency: 'CLP', locale: 'es-CL' },
  CO: { currency: 'COP', locale: 'es-CO' },
  CR: { currency: 'CRC', locale: 'es-CR' },
  CU: { currency: 'CUP', locale: 'es-CU' },
  DO: { currency: 'DOP', locale: 'es-DO' },
  EC: { currency: 'USD', locale: 'es-EC' },
  ES: { currency: 'EUR', locale: 'es-ES' },
  GT: { currency: 'GTQ', locale: 'es-GT' },
  GY: { currency: 'GYD', locale: 'en-GY' },
  HN: { currency: 'HNL', locale: 'es-HN' },
  HT: { currency: 'HTG', locale: 'fr-HT' },
  JM: { currency: 'JMD', locale: 'en-JM' },
  MX: { currency: 'MXN', locale: 'es-MX' },
  NI: { currency: 'NIO', locale: 'es-NI' },
  PA: { currency: 'USD', locale: 'es-PA' },
  PE: { currency: 'PEN', locale: 'es-PE' },
  PR: { currency: 'USD', locale: 'es-PR' },
  PY: { currency: 'PYG', locale: 'es-PY' },
  SR: { currency: 'SRD', locale: 'nl-SR' },
  SV: { currency: 'USD', locale: 'es-SV' },
  TT: { currency: 'TTD', locale: 'en-TT' },
  US: { currency: 'USD', locale: 'en-US' },
  UY: { currency: 'UYU', locale: 'es-UY' },
  VE: { currency: 'VES', locale: 'es-VE' },
};

export type AgentPriceReference = {
  amount: number;
  currency: string;
  locale: string;
};

export async function getAgentPriceReference(countryCode?: string | null): Promise<AgentPriceReference> {
  const country = countryCurrencies[countryCode?.toUpperCase() ?? ''];
  if (!country) return { amount: HUMAN_COST_USD, currency: 'USD', locale: 'en-US' };
  if (country.currency === 'USD') return { amount: HUMAN_COST_USD, ...country };

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error('Exchange rate request failed');

    const data = (await response.json()) as { result?: string; rates?: Record<string, number> };
    const rate = data.result === 'success' ? data.rates?.[country.currency] : undefined;
    if (!rate || !Number.isFinite(rate)) throw new Error('Exchange rate unavailable');

    return { amount: Math.round(HUMAN_COST_USD * rate), ...country };
  } catch {
    return { amount: HUMAN_COST_USD, currency: 'USD', locale: 'en-US' };
  }
}
