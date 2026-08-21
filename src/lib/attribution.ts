/** Atribución de landings verticales (UTM + origen) — sin preguntar al usuario. */

export type LandingAttribution = {
  vertical: string;
  country: string;
  landing: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  gclid: string;
  fbclid: string;
};

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

export function readLandingAttribution(input: {
  vertical: string;
  country: string;
  landing: string;
}): LandingAttribution {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)?.trim() || '']),
  ) as Record<(typeof UTM_KEYS)[number], string>;

  const source =
    utm.utm_source ||
    (utm.gclid ? 'google-ads' : '') ||
    (utm.fbclid ? 'meta-ads' : '') ||
    'direct';

  return {
    vertical: input.vertical,
    country: input.country,
    landing: input.landing,
    source,
    ...utm,
  };
}

export function formatAttributionBlock(attr: LandingAttribution): string {
  return [
    `Vertical: ${attr.vertical}`,
    `País: ${attr.country}`,
    `Landing: ${attr.landing}`,
    `Source: ${attr.source}`,
    `utm_source: ${attr.utm_source || '—'}`,
    `utm_medium: ${attr.utm_medium || '—'}`,
    `utm_campaign: ${attr.utm_campaign || '—'}`,
    `utm_content: ${attr.utm_content || '—'}`,
    `utm_term: ${attr.utm_term || '—'}`,
    `gclid: ${attr.gclid || '—'}`,
    `fbclid: ${attr.fbclid || '—'}`,
  ].join('\n');
}
