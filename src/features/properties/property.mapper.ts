import type { Currency, PriceType, Property, PropertyCard, PropertyStatus, PropertyType } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { getMarketRegionForCountry, isPropertyMarketRegion } from './property-markets';

type PropertyRecord = {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string | null;
  descriptionEs?: string;
  descriptionEn?: string | null;
  price: number;
  priceType: string;
  currency: string;
  zoneEs: string;
  zoneEn: string | null;
  cityEs: string;
  cityEn: string | null;
  address?: string | null;
  province?: string | null;
  country?: string | null;
  marketRegion?: string | null;
  postalCode?: string | null;
  addressVisibility?: string;
  latitude?: number | null;
  longitude?: number | null;
  type: string;
  status: string;
  published?: boolean;
  featured: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  totalArea?: number | null;
  builtArea?: number | null;
  yearBuilt?: number | null;
  expenses?: number | null;
  parking?: number | null;
  internalCode?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  agentEmail?: string | null;
  frontage?: number | null;
  depth?: number | null;
  zoning?: string | null;
  services?: string;
  amenities?: string;
  images?: string;
  coverImage: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  seoTitleEs?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionEs?: string | null;
  seoDescriptionEn?: string | null;
  customCanonical?: string | null;
  ogImage?: string | null;
};

function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapPropertyCard(property: PropertyRecord, locale: Locale = 'es'): PropertyCard {
  const isEn = locale === 'en';
  return {
    id: property.id,
    slug: property.slug,
    title: (isEn && property.titleEn) ? property.titleEn : property.titleEs,
    price: property.price,
    priceType: property.priceType as PriceType,
    currency: property.currency as Currency,
    zone: (isEn && property.zoneEn) ? property.zoneEn : property.zoneEs,
    city: (isEn && property.cityEn) ? property.cityEn : property.cityEs,
    country: property.country ?? null,
    marketRegion: isPropertyMarketRegion(property.marketRegion) ? property.marketRegion : getMarketRegionForCountry(property.country),
    type: property.type as PropertyType,
    status: property.status as PropertyStatus,
    featured: property.featured,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.builtArea ?? property.totalArea ?? property.area,
    coverImage: property.coverImage,
  };
}

export function mapProperty(property: PropertyRecord, locale: Locale = 'es'): Property {
  const isEn = locale === 'en';
  return {
    ...mapPropertyCard(property, locale),
    description: (isEn && property.descriptionEn) ? property.descriptionEn : (property.descriptionEs ?? ''),
    address: property.address ?? null,
    province: property.province ?? null,
    country: property.country ?? null,
    marketRegion: isPropertyMarketRegion(property.marketRegion) ? property.marketRegion : getMarketRegionForCountry(property.country),
    postalCode: property.postalCode ?? null,
    addressVisibility: property.addressVisibility === 'exacta' || property.addressVisibility === 'aproximada' ? property.addressVisibility : 'zona',
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    published: property.published ?? false,
    parking: property.parking ?? null,
    totalArea: property.totalArea ?? null,
    builtArea: property.builtArea ?? property.area ?? null,
    yearBuilt: property.yearBuilt ?? null,
    expenses: property.expenses ?? null,
    internalCode: property.internalCode ?? null,
    agentName: property.agentName ?? null,
    agentPhone: property.agentPhone ?? null,
    agentEmail: property.agentEmail ?? null,
    frontage: property.frontage ?? null,
    depth: property.depth ?? null,
    zoning: property.zoning ?? null,
    services: parseJsonField<string[]>(property.services, []),
    amenities: parseJsonField<string[]>(property.amenities, []),
    images: parseJsonField<string[]>(property.images, []),
    createdAt: property.createdAt ?? new Date(0),
    updatedAt: property.updatedAt ?? new Date(0),
    seoTitleEs: property.seoTitleEs ?? null,
    seoTitleEn: property.seoTitleEn ?? null,
    seoDescriptionEs: property.seoDescriptionEs ?? null,
    seoDescriptionEn: property.seoDescriptionEn ?? null,
    customCanonical: property.customCanonical ?? null,
    ogImage: property.ogImage ?? null,
  };
}
