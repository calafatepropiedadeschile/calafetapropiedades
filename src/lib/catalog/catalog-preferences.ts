import { siteConfig } from '@/config/site';

export const CATALOG_TYPE_COOKIE = `${siteConfig.storageKeyPrefix}.catalog_type`;
export const CATALOG_ZONE_COOKIE = `${siteConfig.storageKeyPrefix}.catalog_zone`;

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type CatalogPreferenceValues = {
  type: '' | 'terreno' | 'casa';
  zone: string;
};

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

export function readCatalogPreferences(cookieStore: CookieReader): CatalogPreferenceValues {
  const rawType = cookieStore.get(CATALOG_TYPE_COOKIE)?.value?.trim();
  const type = rawType === 'terreno' || rawType === 'casa' ? rawType : '';

  return {
    type,
    zone: cookieStore.get(CATALOG_ZONE_COOKIE)?.value?.trim() ?? '',
  };
}

export function mergeCatalogSearchParams(
  cookiePrefs: CatalogPreferenceValues,
  params: Record<string, string | undefined>,
) {
  return {
    ...params,
    type: params.type ?? (cookiePrefs.type || undefined),
    zone: params.zone ?? (cookiePrefs.zone || undefined),
  };
}

export function persistCatalogPreferencesClient(preferences: Partial<CatalogPreferenceValues>) {
  if (typeof document === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  if (preferences.type !== undefined) {
    const value = preferences.type || '';
    document.cookie = `${CATALOG_TYPE_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  }

  if (preferences.zone !== undefined) {
    const value = preferences.zone || '';
    document.cookie = `${CATALOG_ZONE_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  }

  void fetch('/api/catalog/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(preferences),
    keepalive: true,
  }).catch(() => {
    // Cookie del cliente cubre la sesion actual.
  });
}

export function catalogPreferenceCookieOptions() {
  return {
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
    sameSite: 'lax' as const,
  };
}
