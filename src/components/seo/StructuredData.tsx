import { buildCanonicalUrl, getDefaultCanonicalBaseUrl, normalizeCanonicalBaseUrl, normalizeOptionalCanonicalUrl } from '@/config/seo-url';
import JsonLdScript from '@/components/seo/JsonLdScript';
import type { Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';

interface StructuredDataProps {
  property: Property;
  locale: Locale;
  baseUrl?: string | null;
}

export default function StructuredData({ property, locale, baseUrl }: StructuredDataProps) {
  const {
    slug,
    title,
    description,
    price,
    currency,
    address,
    city,
    province,
    country,
    bedrooms,
    bathrooms,
    builtArea,
    area,
    totalArea,
    lotSurfaceM2,
    latitude,
    longitude,
    status,
    createdAt,
    updatedAt,
  } = property;

  const canonicalBaseUrl = normalizeCanonicalBaseUrl(baseUrl || getDefaultCanonicalBaseUrl());
  const canonicalUrl = normalizeOptionalCanonicalUrl(property.customCanonical, canonicalBaseUrl)
    || buildCanonicalUrl(canonicalBaseUrl, `/propiedades/${slug}`, { locale });

  // Map business function
  const businessFunction = 'https://schema.org/SellAction';

  // Map availability
  const availability = status === 'disponible'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // Map residence/accommodation type
  let accommodationType = 'Accommodation';
  if (property.type === 'casa') accommodationType = 'House';
  else if (property.type === 'terreno') accommodationType = 'Landform';

  const images = [
    property.ogImage,
    property.coverImage,
    ...property.images,
  ].filter((image): image is string => Boolean(image));
  const surface = lotSurfaceM2 ?? totalArea ?? builtArea ?? area;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${canonicalUrl}#listing`,
    'name': title,
    'description': description.slice(0, 250),
    'url': canonicalUrl,
    'image': images.length ? images.slice(0, 8) : undefined,
    'datePosted': new Date(createdAt).toISOString(),
    'dateModified': new Date(updatedAt).toISOString(),
    'about': {
      '@type': accommodationType,
      '@id': `${canonicalUrl}#property`,
      'name': title,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': address || '',
        'addressLocality': city,
        'addressRegion': province || '',
        'addressCountry': country || 'CL',
      },
      'geo': latitude != null && longitude != null ? {
        '@type': 'GeoCoordinates',
        latitude,
        longitude,
      } : undefined,
      'numberOfBedrooms': bedrooms ?? undefined,
      'numberOfBathroomsTotal': bathrooms ?? undefined,
      'floorSize': surface ? {
        '@type': 'QuantitativeValue',
        'value': surface,
        'unitCode': 'MTK', // Square meters
      } : undefined,
    },
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': currency,
      'availability': availability,
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': price,
        'priceCurrency': currency,
        'valueAddedTaxIncluded': true,
      },
      'businessFunction': businessFunction,
      'seller': {
        '@type': 'RealEstateAgent',
        '@id': `${canonicalBaseUrl}/#organization`,
        'name': 'Calafate Propiedades',
        'url': canonicalBaseUrl,
      },
    },
  };

  return (
    <JsonLdScript id={`property-${slug}-json-ld`} data={jsonLd} />
  );
}
