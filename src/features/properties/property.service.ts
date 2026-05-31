import { unstable_cache } from 'next/cache';
import { getPrismaClient } from '@/lib/db/prisma';
import type { PropertyFilters, PropertyCard, PaginatedResponse, Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { createPropertyRepository, type PropertyRepository } from './property.repository';
import {
  catalogFiltersToPropertyFilters,
  CATALOG_PAGE_LIMIT,
  DEFAULT_CATALOG_FILTERS,
  normalizeCatalogFilters,
  parseCatalogPage,
  type CatalogFilterState,
} from './property-filtering';

export function createPropertyService(repository: PropertyRepository) {
  return {
    listPublished(filters: PropertyFilters, locale: Locale = 'es'): Promise<PaginatedResponse<PropertyCard>> {
      return repository.listPublished(filters, locale);
    },
    listStaticCatalog(locale: Locale = 'es'): Promise<PropertyCard[]> {
      return repository.listStaticCatalog(locale);
    },
    findPublishedBySlug(slug: string, locale: Locale = 'es', showUnpublished = false): Promise<Property | null> {
      return repository.findPublishedBySlug(slug, locale, showUnpublished);
    },
    listFeatured(locale: Locale = 'es'): Promise<PropertyCard[]> {
      return repository.listFeatured(locale);
    },
    listZones(locale: Locale = 'es'): Promise<string[]> {
      return repository.listZones(locale);
    },
    listSimilar(propertyId: string, locale: Locale = 'es'): Promise<PropertyCard[]> {
      return repository.listSimilar(propertyId, locale);
    },
  };
}

export async function getProperties(filters: PropertyFilters, locale: Locale = 'es'): Promise<PaginatedResponse<PropertyCard>> {
  const filtersKey = JSON.stringify(filters);
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listPublished(filters, locale);
    },
    ['properties-list-v4', filtersKey, locale],
    { revalidate: 60, tags: ['properties'] }
  )();
}

export async function getStaticPropertyCatalog(locale: Locale = 'es'): Promise<PropertyCard[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listStaticCatalog(locale);
    },
    ['properties-static-catalog-v4', locale],
    { revalidate: 3600, tags: ['properties'] }
  )();
}

export async function getStaticPropertyBySlug(slug: string, locale: Locale = 'es'): Promise<Property | null> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, false);
    },
    ['property-static-detail-v4', slug, locale],
    { revalidate: 3600, tags: ['properties', `property-${slug}`] }
  )();
}

export async function getPropertyBySlug(slug: string, locale: Locale = 'es', showUnpublished = false): Promise<Property | null> {
  if (showUnpublished) {
    const db = getPrismaClient();
    return createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, true);
  }
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, false);
    },
    ['property-detail-v4', slug, locale],
    { revalidate: 3600, tags: ['properties', `property-${slug}`] }
  )();
}

export async function getFeaturedProperties(locale: Locale = 'es'): Promise<PropertyCard[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listFeatured(locale);
    },
    ['featured-properties-v4', locale],
    { revalidate: 300, tags: ['properties'] }
  )();
}

export async function getSimilarProperties(propertyId: string, slug: string, locale: Locale = 'es'): Promise<PropertyCard[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listSimilar(propertyId, locale);
    },
    ['similar-properties-v4', propertyId, locale],
    { revalidate: 3600, tags: ['properties', `property-${slug}`] }
  )();
}

export async function getZones(locale: Locale = 'es'): Promise<string[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listZones(locale);
    },
    ['property-zones-v1', locale],
    { revalidate: 300, tags: ['properties'] }
  )();
}

export type CatalogPageParams = Record<string, string | string[] | undefined>;

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function paramsToCatalogSearchRecord(params: CatalogPageParams) {
  const record: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    record[key] = paramValue(value);
  }
  return record;
}

export async function getCatalogPageData(
  rawParams: CatalogPageParams,
  options?: { preset?: Partial<CatalogFilterState>; locale?: Locale }
) {
  const locale = options?.locale ?? 'es';
  const params = paramsToCatalogSearchRecord(rawParams);
  const filters = normalizeCatalogFilters({
    ...DEFAULT_CATALOG_FILTERS,
    ...options?.preset,
    ...params,
  });
  const page = parseCatalogPage(params.page);
  const propertyFilters = catalogFiltersToPropertyFilters(filters, {
    page,
    limit: CATALOG_PAGE_LIMIT,
  });

  const [catalog, zoneOptions] = await Promise.all([
    getProperties(propertyFilters, locale),
    getZones(locale),
  ]);

  return {
    filters,
    properties: catalog.data,
    zoneOptions,
    pagination: {
      page: catalog.page,
      totalPages: catalog.totalPages,
      total: catalog.total,
      limit: catalog.limit,
    },
  };
}
