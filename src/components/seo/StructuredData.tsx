import { buildCanonicalUrl, getDefaultCanonicalBaseUrl, normalizeCanonicalBaseUrl, normalizeOptionalCanonicalUrl } from '@/config/seo-url';
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
    status,
    createdAt,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': title,
    'description': description.slice(0, 250),
    'url': canonicalUrl,
    'datePosted': new Date(createdAt).toISOString(),
    'about': {
      '@type': accommodationType,
      'name': title,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': address || '',
        'addressLocality': city,
        'addressRegion': province || '',
        'addressCountry': country || 'CL',
      },
      'numberOfBedrooms': bedrooms ?? undefined,
      'numberOfBathroomsTotal': bathrooms ?? undefined,
      'floorSize': (builtArea || area) ? {
        '@type': 'QuantitativeValue',
        'value': builtArea ?? area,
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
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
