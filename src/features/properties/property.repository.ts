import type { Prisma, PrismaClient } from '@prisma/client';
import type { PropertyFilters } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { getPropertyZoneFilterValues } from './property-zone-filters';
import { normalizeCatalogFilters, parsePositiveNumber } from './property-filtering';
import { mapProperty, mapPropertyCard } from './property.mapper';

type PropertyDbClient = PrismaClient | Prisma.TransactionClient;

const propertyCardSelect = {
  id: true,
  slug: true,
  titleEs: true,
  titleEn: true,
  price: true,
  priceType: true,
  currency: true,
  zoneEs: true,
  zoneEn: true,
  cityEs: true,
  cityEn: true,
  country: true,
  marketRegion: true,
  type: true,
  status: true,
  featured: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  totalArea: true,
  builtArea: true,
  lotSurfaceM2: true,
  totalLots: true,
  availableLots: true,
  coverImage: true,
} satisfies Prisma.PropertySelect;

const propertyDetailSelect = {
  id: true,
  slug: true,
  titleEs: true,
  titleEn: true,
  descriptionEs: true,
  descriptionEn: true,
  price: true,
  priceType: true,
  currency: true,
  zoneEs: true,
  zoneEn: true,
  cityEs: true,
  cityEn: true,
  address: true,
  province: true,
  country: true,
  marketRegion: true,
  postalCode: true,
  addressVisibility: true,
  latitude: true,
  longitude: true,
  type: true,
  status: true,
  published: true,
  featured: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  totalArea: true,
  builtArea: true,
  yearBuilt: true,
  expenses: true,
  parking: true,
  internalCode: true,
  agentName: true,
  agentPhone: true,
  agentEmail: true,
  frontage: true,
  depth: true,
  zoning: true,
  mapUrl: true,
  virtualTourUrl: true,
  youtubeUrl: true,
  sortOrder: true,
  agentId: true,
  agent: {
    select: {
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
    },
  },
  lotSurfaceM2: true,
  totalLots: true,
  availableLots: true,
  stageName: true,
  paymentTerms: true,
  commissionPercent: true,
  operationalExpenses: true,
  reservationAmount: true,
  waterStatus: true,
  electricityStatus: true,
  accessType: true,
  roadType: true,
  hasOwnRol: true,
  availabilityNotes: true,
  commercialNotes: true,
  distanceHighlights: true,
  services: true,
  amenities: true,
  images: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
  seoTitleEs: true,
  seoTitleEn: true,
  seoDescriptionEs: true,
  seoDescriptionEn: true,
  customCanonical: true,
  ogImage: true,
} satisfies Prisma.PropertySelect;

function buildPublishedPropertyWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const normalizedFilters = normalizeCatalogFilters({
    ...filters,
    minPrice: filters.minPrice?.toString(),
    maxPrice: filters.maxPrice?.toString(),
    minSurface: filters.minSurface?.toString(),
  });
  const { query, type, priceType, country, zone, minPrice, maxPrice, minSurface, hasAvailableLots } = normalizedFilters;
  const textMatch = query
    ? {
        contains: query,
        mode: 'insensitive' as const,
      }
    : undefined;
  const and: Prisma.PropertyWhereInput[] = [
    { published: true },
    { country: 'Chile' },
    { type: { in: ['terreno', 'casa'] } },
    {
      OR: [
        { coverImage: null },
        { coverImage: { not: { startsWith: 'https://images.unsplash.com' } } },
      ],
    },
  ];

  if (query) {
    and.push({
      OR: [
        { titleEs: textMatch },
        { titleEn: textMatch },
        { descriptionEs: textMatch },
        { descriptionEn: textMatch },
        { zoneEs: textMatch },
        { zoneEn: textMatch },
        { cityEs: textMatch },
        { cityEn: textMatch },
        { country: textMatch },
        { type: textMatch },
      ],
    });
  }

  if (type) {
    and.push({ type });
  }

  if (priceType) {
    and.push({ priceType });
  }

  if (country) {
    and.push({ country });
  }

  if (zone) {
    const zoneValues = getPropertyZoneFilterValues(zone);
    and.push({
      OR: zoneValues.flatMap((zoneValue) => [
        { zoneEs: { equals: zoneValue } },
        { zoneEn: { equals: zoneValue } },
        { cityEs: { equals: zoneValue } },
        { cityEn: { equals: zoneValue } },
      ]),
    });
  }

  const minPriceValue = parsePositiveNumber(minPrice);
  const maxPriceValue = parsePositiveNumber(maxPrice);

  if (minPriceValue !== null || maxPriceValue !== null) {
    and.push({
      price: {
        ...(minPriceValue !== null && { gte: minPriceValue }),
        ...(maxPriceValue !== null && { lte: maxPriceValue }),
      },
    });
  }

  const minSurfaceValue = parsePositiveNumber(minSurface);

  if (minSurfaceValue !== null) {
    and.push({
      OR: [
        { lotSurfaceM2: { gte: minSurfaceValue } },
        { totalArea: { gte: minSurfaceValue } },
        { area: { gte: minSurfaceValue } },
        { builtArea: { gte: minSurfaceValue } },
      ],
    });
  }

  if (filters.marketRegion) {
    and.push({ marketRegion: filters.marketRegion });
  }

  if (hasAvailableLots) {
    and.push({
      OR: [
        { availableLots: { gt: 0 } },
        { availableLots: null },
      ],
    });
  }

  return { AND: and };
}

export function createPropertyRepository(db: PropertyDbClient) {
  return {
    async listPublished(filters: PropertyFilters, locale: Locale = 'es') {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 9;
      const where = buildPublishedPropertyWhere(filters);

      const [total, properties] = await Promise.all([
        db.property.count({ where }),
        db.property.findMany({
          where,
          select: propertyCardSelect,
          orderBy: [{ sortOrder: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return {
        data: properties.map((p) => mapPropertyCard(p, locale)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async listStaticCatalog(locale: Locale = 'es', limit = 500) {
      const properties = await db.property.findMany({
        where: buildPublishedPropertyWhere({ priceType: 'venta', country: 'Chile' }),
        select: propertyCardSelect,
        orderBy: [{ sortOrder: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });

      return properties.map((p) => mapPropertyCard(p, locale));
    },

    async findPublishedBySlug(slug: string, locale: Locale = 'es', showUnpublished = false) {
      const property = await db.property.findFirst({
        where: showUnpublished ? { slug } : { slug, published: true },
        select: propertyDetailSelect,
      });

      return property ? mapProperty(property, locale) : null;
    },

    async listFeatured(locale: Locale = 'es') {
      const properties = await db.property.findMany({
        where: {
          AND: [
            buildPublishedPropertyWhere({ priceType: 'venta', country: 'Chile' }),
            { featured: true },
          ],
        },
        select: propertyCardSelect,
        orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        take: 3,
      });

      return properties.map((p) => mapPropertyCard(p, locale));
    },

    async listZones(locale: Locale = 'es') {
      const isEn = locale === 'en';
      const zones = await db.property.findMany({
        where: buildPublishedPropertyWhere({ country: 'Chile' }),
        select: { zoneEs: true, zoneEn: true },
        orderBy: { zoneEs: 'asc' },
      });

      const uniqueZones = new Set<string>();
      for (const z of zones) {
        const val = isEn && z.zoneEn ? z.zoneEn : z.zoneEs;
        if (val) uniqueZones.add(val);
      }
      return Array.from(uniqueZones).sort();
    },
  };
}

export type PropertyRepository = ReturnType<typeof createPropertyRepository>;
