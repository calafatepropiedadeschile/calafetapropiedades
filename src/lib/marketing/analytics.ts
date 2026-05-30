type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtagEvent(eventName: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params ?? {});
}

function metaEvent(eventName: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, params ?? {});
}

export function trackWhatsAppClick(context?: AnalyticsParams) {
  gtagEvent('whatsapp_click', context);
  metaEvent('Contact', context);
}

export function trackGenerateLead(context?: AnalyticsParams) {
  gtagEvent('generate_lead', context);
  metaEvent('Lead', context);
}

export function trackContactSubmit(context?: AnalyticsParams) {
  gtagEvent('contact_submit', context);
  metaEvent('Contact', context);
}

export function trackConversionThankYou(context?: AnalyticsParams) {
  gtagEvent('conversion_thank_you', context);
  metaEvent('Lead', context);
}
