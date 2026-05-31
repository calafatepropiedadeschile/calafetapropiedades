type AnalyticsParams = Record<string, string | number | boolean | string[] | undefined>;

type MetaTrackOptions = {
  eventID?: string;
};

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

function metaEvent(eventName: string, params?: AnalyticsParams, options?: MetaTrackOptions) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  if (options?.eventID) {
    window.fbq('track', eventName, params ?? {}, { eventID: options.eventID });
    return;
  }

  window.fbq('track', eventName, params ?? {});
}

export function trackViewContent(context: {
  content_id: string;
  content_name: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) {
  gtagEvent('view_item', {
    item_id: context.content_id,
    item_name: context.content_name,
    value: context.value,
    currency: context.currency,
  });

  metaEvent('ViewContent', {
    content_ids: [context.content_id],
    content_name: context.content_name,
    content_type: 'product',
    content_category: context.content_category,
    value: context.value,
    currency: context.currency,
  });
}

export function trackWhatsAppClick(context?: AnalyticsParams) {
  gtagEvent('whatsapp_click', context);
  metaEvent('Contact', context);
}

export function trackGenerateLead(context?: AnalyticsParams, options?: MetaTrackOptions) {
  gtagEvent('generate_lead', context);
  metaEvent('Lead', context, options);
}

export function trackContactSubmit(context?: AnalyticsParams, options?: MetaTrackOptions) {
  gtagEvent('contact_submit', context);
  metaEvent('Contact', context, options);
}

export function trackConversionThankYou(
  context?: AnalyticsParams,
  options?: MetaTrackOptions & { conversionType?: 'lead' | 'contacto' },
) {
  gtagEvent('conversion_thank_you', context);

  const metaEventName = options?.conversionType === 'contacto' ? 'Contact' : 'Lead';
  metaEvent(metaEventName, context, options);
}
