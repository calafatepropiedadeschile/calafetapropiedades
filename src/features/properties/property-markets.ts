import type { TranslationKey } from '@/lib/i18n/dictionaries';

export const PROPERTY_MARKET_REGIONS = [
  'latam',
] as const;

export type PropertyMarketRegion = typeof PROPERTY_MARKET_REGIONS[number];

export const PROPERTY_MARKET_REGION_LABELS: Record<PropertyMarketRegion, string> = {
  latam: 'Chile',
};

export const PROPERTY_MARKET_REGION_TRANSLATION_KEYS: Record<PropertyMarketRegion, TranslationKey> = {
  latam: 'catalog.marketLatam',
};

export const PROPERTY_COUNTRY_OPTIONS = [
  { value: 'Chile', label: 'Chile', marketRegion: 'latam' },
] as const satisfies Array<{ value: string; label: string; marketRegion: PropertyMarketRegion }>;

export function isPropertyMarketRegion(value: unknown): value is PropertyMarketRegion {
  return typeof value === 'string' && PROPERTY_MARKET_REGIONS.includes(value as PropertyMarketRegion);
}

export function getMarketRegionForCountry(country: string | null | undefined): PropertyMarketRegion {
  const normalizedCountry = country?.trim().toLowerCase();
  const match = PROPERTY_COUNTRY_OPTIONS.find((option) => option.value.toLowerCase() === normalizedCountry);
  return match?.marketRegion ?? 'latam';
}
