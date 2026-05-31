import type { PropertyCard, PropertyFilters, PropertyType, PriceType } from '@/types/property';
import { PRICE_TYPES } from './price-type';
import { propertyMatchesZoneFilter } from './property-zone-filters';

export const CATALOG_PAGE_LIMIT = 24;

export type CatalogFilterState = {
  query: string;
  type: PropertyType | '';
  priceType: PriceType | '';
  country: 'Chile';
  zone: string;
  minPrice: string;
  maxPrice: string;
  minSurface: string;
  minBedrooms: string;
  minBathrooms: string;
  hasAvailableLots: boolean;
};

const PROPERTY_TYPES = new Set<PropertyType>(['terreno', 'casa']);
const PRICE_TYPE_SET = new Set<PriceType>(PRICE_TYPES);

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  query: '',
  type: '',
  priceType: '',
  country: 'Chile',
  zone: '',
  minPrice: '',
  maxPrice: '',
  minSurface: '',
  minBedrooms: '',
  minBathrooms: '',
  hasAvailableLots: false,
};

function valueFrom(source: Partial<Record<string, unknown>>, key: string) {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

function parseOptionalEnum<T extends string>(
  raw: string,
  allowed: Set<T>
): T | '' {
  if (!raw) return '';
  return allowed.has(raw as T) ? (raw as T) : '';
}

export function parsePositiveNumber(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

/** Superficie efectiva alineada con `mapPropertyCard` y filtros de BD. */
export function getEffectiveSurfaceM2(property: Pick<PropertyCard, 'lotSurfaceM2' | 'area'>) {
  return property.lotSurfaceM2 ?? property.area ?? 0;
}

export function normalizeCatalogFilters(
  filters: Partial<CatalogFilterState> | Partial<Record<string, unknown>>
): CatalogFilterState {
  const type = valueFrom(filters, 'type');
  const priceType = valueFrom(filters, 'priceType');
  const hasAvailableLots = filters.hasAvailableLots === true || valueFrom(filters, 'hasAvailableLots') === 'true';

  return {
    query: valueFrom(filters, 'query'),
    type: parseOptionalEnum(type, PROPERTY_TYPES),
    priceType: parseOptionalEnum(priceType, PRICE_TYPE_SET),
    country: 'Chile',
    zone: valueFrom(filters, 'zone'),
    minPrice: valueFrom(filters, 'minPrice'),
    maxPrice: valueFrom(filters, 'maxPrice'),
    minSurface: valueFrom(filters, 'minSurface'),
    minBedrooms: valueFrom(filters, 'minBedrooms'),
    minBathrooms: valueFrom(filters, 'minBathrooms'),
    hasAvailableLots,
  };
}

export function parseCatalogPage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

export function catalogFiltersToPropertyFilters(
  filters: CatalogFilterState | Partial<CatalogFilterState>,
  options?: { page?: number; limit?: number }
): PropertyFilters {
  const normalized = normalizeCatalogFilters(filters);

  return {
    query: normalized.query || undefined,
    type: normalized.type || undefined,
    priceType: normalized.priceType || undefined,
    country: normalized.country,
    zone: normalized.zone || undefined,
    minPrice: parsePositiveNumber(normalized.minPrice) ?? undefined,
    maxPrice: parsePositiveNumber(normalized.maxPrice) ?? undefined,
    minSurface: parsePositiveNumber(normalized.minSurface) ?? undefined,
    minBedrooms: parsePositiveNumber(normalized.minBedrooms) ?? undefined,
    minBathrooms: parsePositiveNumber(normalized.minBathrooms) ?? undefined,
    hasAvailableLots: normalized.hasAvailableLots || undefined,
    page: options?.page ?? 1,
    limit: options?.limit ?? CATALOG_PAGE_LIMIT,
  };
}

/** Filtrado en cliente (p. ej. home / masterplan). Misma semántica que `buildPublishedPropertyWhere`. */
export function filterPropertyCards(properties: PropertyCard[], filters: CatalogFilterState) {
  const normalized = normalizeCatalogFilters(filters);
  const query = normalized.query.toLowerCase();
  const minPrice = parsePositiveNumber(normalized.minPrice);
  const maxPrice = parsePositiveNumber(normalized.maxPrice);
  const minSurface = parsePositiveNumber(normalized.minSurface);
  const minBedrooms = parsePositiveNumber(normalized.minBedrooms);
  const minBathrooms = parsePositiveNumber(normalized.minBathrooms);

  return properties.filter((property) => {
    const matchesQuery = !query || [property.title, property.zone, property.city]
      .some((value) => value.toLowerCase().includes(query));

    return (
      matchesQuery &&
      (!normalized.type || property.type === normalized.type) &&
      (!normalized.priceType || property.priceType === normalized.priceType) &&
      property.country === normalized.country &&
      propertyMatchesZoneFilter(property, normalized.zone) &&
      (minPrice === null || property.price >= minPrice) &&
      (maxPrice === null || property.price <= maxPrice) &&
      (minSurface === null || getEffectiveSurfaceM2(property) >= minSurface) &&
      (minBedrooms === null || normalized.type !== 'casa' || (property.bedrooms ?? 0) >= minBedrooms) &&
      (minBathrooms === null || normalized.type !== 'casa' || (property.bathrooms ?? 0) >= minBathrooms) &&
      (!normalized.hasAvailableLots || property.availableLots === null || property.availableLots > 0)
    );
  });
}

export function buildCatalogFilterSearchParams(filters: CatalogFilterState, page?: number) {
  const normalized = normalizeCatalogFilters(filters);
  const params = new URLSearchParams();

  if (normalized.query) params.set('query', normalized.query);
  if (normalized.type) params.set('type', normalized.type);
  if (normalized.priceType) params.set('priceType', normalized.priceType);
  if (normalized.zone) params.set('zone', normalized.zone);
  if (normalized.minPrice) params.set('minPrice', normalized.minPrice);
  if (normalized.maxPrice) params.set('maxPrice', normalized.maxPrice);
  if (normalized.minSurface) params.set('minSurface', normalized.minSurface);
  if (normalized.minBedrooms) params.set('minBedrooms', normalized.minBedrooms);
  if (normalized.minBathrooms) params.set('minBathrooms', normalized.minBathrooms);
  if (normalized.hasAvailableLots) params.set('hasAvailableLots', 'true');
  if (page && page > 1) params.set('page', String(page));

  return params;
}
