import type { Prisma, PrismaClient } from '@prisma/client';
import type { PropertyFilters } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
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
  services: true,
  amenities: true,
  images: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PropertySelect;

function buildPublishedPropertyWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const { query, type, priceType, marketRegion, country, zone, minPrice, maxPrice, bedrooms } = filters;
  const textMatch = query
    ? {
        contains: query,
        mode: 'insensitive' as const,
      }
    : undefined;
  const zoneMatch = zone
    ? {
        equals: zone,
      }
    : undefined;

  const and: Prisma.PropertyWhereInput[] = [{ published: true }];

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

  if (marketRegion) {
    and.push({ marketRegion });
  }

  if (country) {
    and.push({ country });
  }

  if (zone) {
    and.push({
      OR: [
        { zoneEs: zoneMatch },
        { zoneEn: zoneMatch },
      ],
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    and.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  if (bedrooms !== undefined) {
    and.push({ bedrooms: { gte: bedrooms } });
  }

  return and.length === 1 ? and[0] : { AND: and };
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
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
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

    async listStaticCatalog(locale: Locale = 'es', limit = 100) {
      const properties = await db.property.findMany({
        where: { published: true },
        select: propertyCardSelect,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });

      return properties.map((p) => mapPropertyCard(p, locale));
    },

    async findPublishedBySlug(slug: string, locale: Locale = 'es') {
      const property = await db.property.findFirst({
        where: { slug, published: true },
        select: propertyDetailSelect,
      });

      return property ? mapProperty(property, locale) : null;
    },

    async listFeatured(locale: Locale = 'es') {
      const properties = await db.property.findMany({
        where: { published: true, featured: true },
        select: propertyCardSelect,
        orderBy: { createdAt: 'desc' },
        take: 6,
      });

      return properties.map((p) => mapPropertyCard(p, locale));
    },

    async listZones(locale: Locale = 'es') {
      const isEn = locale === 'en';
      const zones = await db.property.findMany({
        where: { published: true },
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
