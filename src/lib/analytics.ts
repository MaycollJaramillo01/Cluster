type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Eventos de funnel: Ad → Landing → Calculator → Lead → Appointment */
export function trackEvent(name: string, params: TrackParams = {}) {
  if (typeof window === 'undefined') return;

  const payload = { event: name, ...params };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  try {
    window.gtag?.('event', name, params);
  } catch {
    /* gtag optional */
  }

  try {
    window.fbq?.('trackCustom', name, params);
  } catch {
    /* pixel optional */
  }
}
