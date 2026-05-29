import type { TranslationKey } from '@/lib/i18n/dictionaries';

export const PROPERTY_MARKET_REGIONS = [
  'espana_europa',
  'mexico',
  'latam',
  'centroamerica',
  'estados_unidos',
] as const;

export type PropertyMarketRegion = typeof PROPERTY_MARKET_REGIONS[number];

export const PROPERTY_MARKET_REGION_LABELS: Record<PropertyMarketRegion, string> = {
  espana_europa: 'Espana / Europa',
  mexico: 'Mexico',
  latam: 'LATAM',
  centroamerica: 'Centroamerica',
  estados_unidos: 'Estados Unidos',
};

export const PROPERTY_MARKET_REGION_TRANSLATION_KEYS: Record<PropertyMarketRegion, TranslationKey> = {
  espana_europa: 'catalog.marketSpainEurope',
  mexico: 'catalog.marketMexico',
  latam: 'catalog.marketLatam',
  centroamerica: 'catalog.marketCentralAmerica',
  estados_unidos: 'catalog.marketUnitedStates',
};

export const PROPERTY_COUNTRY_OPTIONS = [
  { value: 'Espana', label: 'Espana', marketRegion: 'espana_europa' },
  { value: 'Mexico', label: 'Mexico', marketRegion: 'mexico' },
  { value: 'Paraguay', label: 'Paraguay', marketRegion: 'latam' },
  { value: 'Estados Unidos', label: 'Estados Unidos', marketRegion: 'estados_unidos' },
  { value: 'Costa Rica', label: 'Costa Rica', marketRegion: 'centroamerica' },
  { value: 'Panama', label: 'Panama', marketRegion: 'centroamerica' },
  { value: 'Argentina', label: 'Argentina', marketRegion: 'latam' },
  { value: 'Chile', label: 'Chile', marketRegion: 'latam' },
  { value: 'Colombia', label: 'Colombia', marketRegion: 'latam' },
] as const satisfies Array<{ value: string; label: string; marketRegion: PropertyMarketRegion }>;

export function isPropertyMarketRegion(value: unknown): value is PropertyMarketRegion {
  return typeof value === 'string' && PROPERTY_MARKET_REGIONS.includes(value as PropertyMarketRegion);
}

export function getMarketRegionForCountry(country: string | null | undefined): PropertyMarketRegion {
  const normalizedCountry = country?.trim().toLowerCase();
  const match = PROPERTY_COUNTRY_OPTIONS.find((option) => option.value.toLowerCase() === normalizedCountry);
  return match?.marketRegion ?? 'latam';
}
