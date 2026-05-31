import { siteConfig } from '@/config/site';

export type StoredAttribution = {
  landingPath: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  fbclid: string | null;
  capturedAt: string;
};

const STORAGE_KEY = `${siteConfig.storageKeyPrefix}:attribution`;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function isBrowser() {
  return typeof window !== 'undefined';
}

function readStored(): StoredAttribution | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredAttribution;
    const age = Date.now() - new Date(parsed.capturedAt).getTime();
    if (!Number.isFinite(age) || age > TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: StoredAttribution) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function pickUtm(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim();
  return value || null;
}

export function captureAttributionFromLocation() {
  if (!isBrowser()) return;

  const searchParams = new URLSearchParams(window.location.search);
  const hasUtm = UTM_KEYS.some((key) => searchParams.has(key));
  const fbclid = searchParams.get('fbclid')?.trim() || null;
  const existing = readStored();

  if (!hasUtm && !fbclid && existing) {
    return;
  }

  const next: StoredAttribution = {
    landingPath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer?.trim() || existing?.referrer || null,
    utmSource: pickUtm(searchParams, 'utm_source') ?? existing?.utmSource ?? null,
    utmMedium: pickUtm(searchParams, 'utm_medium') ?? existing?.utmMedium ?? null,
    utmCampaign: pickUtm(searchParams, 'utm_campaign') ?? existing?.utmCampaign ?? null,
    utmContent: pickUtm(searchParams, 'utm_content') ?? existing?.utmContent ?? null,
    utmTerm: pickUtm(searchParams, 'utm_term') ?? existing?.utmTerm ?? null,
    fbclid: fbclid ?? existing?.fbclid ?? null,
    capturedAt: new Date().toISOString(),
  };

  writeStored(next);
}

export function getStoredAttribution(): StoredAttribution | null {
  return readStored();
}

export function getAttributionPayload() {
  const stored = getStoredAttribution();

  if (!stored) {
    if (!isBrowser()) {
      return {
        leadSource: 'web_form' as const,
        landingPath: null,
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
        fbclid: null,
      };
    }

    return {
      leadSource: 'web_form' as const,
      landingPath: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer?.trim() || null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      fbclid: null,
    };
  }

  return {
    leadSource: 'web_form' as const,
    landingPath: stored.landingPath,
    referrer: stored.referrer,
    utmSource: stored.utmSource,
    utmMedium: stored.utmMedium,
    utmCampaign: stored.utmCampaign,
    utmContent: stored.utmContent,
    utmTerm: stored.utmTerm,
    fbclid: stored.fbclid,
  };
}
