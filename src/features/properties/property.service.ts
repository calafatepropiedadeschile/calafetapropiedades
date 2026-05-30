import { unstable_cache } from 'next/cache';
import { withDatabaseRole } from '@/lib/db/rls';
import { getPrismaClient } from '@/lib/db/prisma';
import type { PropertyFilters, PropertyCard, PaginatedResponse, Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { createPropertyRepository, type PropertyRepository } from './property.repository';

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
  };
}

export async function getProperties(filters: PropertyFilters, locale: Locale = 'es'): Promise<PaginatedResponse<PropertyCard>> {
  const filtersKey = JSON.stringify(filters);
  return unstable_cache(
    async () => withDatabaseRole(
      'public',
      async (db) => createPropertyService(createPropertyRepository(db)).listPublished(filters, locale)
    ),
    ['properties-list-v3', filtersKey, locale],
    { revalidate: 60, tags: ['properties'] }
  )();
}

export async function getStaticPropertyCatalog(locale: Locale = 'es'): Promise<PropertyCard[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listStaticCatalog(locale);
    },
    ['properties-static-catalog-v3', locale],
    { revalidate: 3600, tags: ['properties'] }
  )();
}

export async function getStaticPropertyBySlug(slug: string, locale: Locale = 'es'): Promise<Property | null> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, false);
    },
    ['property-static-detail-v3', slug, locale],
    { revalidate: 3600, tags: ['properties', `property-${slug}`] }
  )();
}

export async function getPropertyBySlug(slug: string, locale: Locale = 'es', showUnpublished = false): Promise<Property | null> {
  if (showUnpublished) {
    return withDatabaseRole(
      'public',
      async (db) => createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, true)
    );
  }
  return unstable_cache(
    async () => withDatabaseRole(
      'public',
      async (db) => createPropertyService(createPropertyRepository(db)).findPublishedBySlug(slug, locale, false)
    ),
    ['property-detail-v3', slug, locale],
    { revalidate: 3600, tags: ['properties', `property-${slug}`] }
  )();
}

export async function getFeaturedProperties(locale: Locale = 'es'): Promise<PropertyCard[]> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return createPropertyService(createPropertyRepository(db)).listFeatured(locale);
    },
    ['featured-properties-v3', locale],
    { revalidate: 300, tags: ['properties'] }
  )();
}

export async function getZones(locale: Locale = 'es'): Promise<string[]> {
  return withDatabaseRole(
    'public',
    async (db) => createPropertyService(createPropertyRepository(db)).listZones(locale)
  );
}
