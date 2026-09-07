const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

export type UtmPayload = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const STORAGE_KEY = 'cm_clinicas_utm';

export function captureUtms(): UtmPayload {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const found: UtmPayload = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch {
      /* ignore */
    }
  }
  return getStoredUtms();
}

export function getStoredUtms(): UtmPayload {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmPayload;
  } catch {
    return {};
  }
}

export type TrackEventName =
  | 'PageView'
  | 'Scroll50'
  | 'CalculatorStart'
  | 'CalculatorComplete'
  | 'VideoPlay'
  | 'FormStart'
  | 'Lead'
  | 'QualifiedLead'
  | 'WhatsAppClick'
  | 'ScheduleStart'
  | 'AppointmentBooked'
  | 'QuizStart'
  | 'QuizStep'
  | 'QuizComplete';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: TrackEventName,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;
  const data = { event: name, ...payload, ...getStoredUtms() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  }
  if (typeof window.fbq === 'function') {
    const metaMap: Partial<Record<TrackEventName, string>> = {
      PageView: 'PageView',
      Lead: 'Lead',
      ScheduleStart: 'Schedule',
      AppointmentBooked: 'Schedule',
      WhatsAppClick: 'Contact',
    };
    const mapped = metaMap[name];
    if (mapped) window.fbq('track', mapped, payload);
  }
}
