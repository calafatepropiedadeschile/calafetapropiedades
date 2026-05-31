import { createHash } from 'node:crypto';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

const GRAPH_VERSION = 'v22.0';

export type MetaConversionEventName = 'Lead' | 'Contact' | 'ViewContent';

export interface SendMetaConversionInput {
  eventName: MetaConversionEventName;
  eventId: string;
  eventSourceUrl: string;
  email?: string | null;
  phone?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  fbclid?: string | null;
  customData?: Record<string, string | number>;
}

function hashForMeta(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalizePhoneForMeta(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

export function buildMetaFbcFromClickId(fbclid: string, eventTimeSec = Math.floor(Date.now() / 1000)) {
  return `fb.1.${eventTimeSec}.${fbclid.trim()}`;
}

async function resolveMetaPixelIdForServer(): Promise<string | null> {
  const fromEnv = process.env.META_PIXEL_ID?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (fromEnv) return fromEnv;

  try {
    const seo = await getSiteSeoSettings();
    return seo?.metaPixelId?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function sendMetaConversionEvent(input: SendMetaConversionInput): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const pixelId = await resolveMetaPixelIdForServer();

  if (!accessToken || !pixelId) {
    return;
  }

  const userData: Record<string, string | string[]> = {};

  if (input.email?.trim()) {
    userData.em = [hashForMeta(input.email)];
  }

  const phoneDigits = input.phone ? normalizePhoneForMeta(input.phone) : null;
  if (phoneDigits) {
    userData.ph = [hashForMeta(phoneDigits)];
  }

  if (input.clientIpAddress?.trim()) {
    userData.client_ip_address = input.clientIpAddress.trim();
  }

  if (input.clientUserAgent?.trim()) {
    userData.client_user_agent = input.clientUserAgent.trim();
  }

  if (input.fbp?.trim()) {
    userData.fbp = input.fbp.trim();
  }

  const fbc = input.fbc?.trim()
    || (input.fbclid?.trim() ? buildMetaFbcFromClickId(input.fbclid) : null);

  if (fbc) {
    userData.fbc = fbc;
  }

  const payload: Record<string, unknown> = {
    data: [{
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl,
      user_data: userData,
      ...(input.customData && Object.keys(input.customData).length > 0
        ? { custom_data: input.customData }
        : {}),
    }],
    access_token: accessToken,
  };

  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  if (testCode) {
    payload.test_event_code = testCode;
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn('[Meta CAPI]', response.status, body.slice(0, 500));
  }
}
