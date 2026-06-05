import JsonLdScript from '@/components/seo/JsonLdScript';
import { buildCanonicalUrl, getDefaultCanonicalBaseUrl, normalizeCanonicalBaseUrl } from '@/config/seo-url';
import { getPreferredProjectCanonicalPath } from '@/lib/seo/project-landings';
import type { PropertyCard } from '@/types/property';

type Props = {
  name: string;
  description: string;
  path: string;
  properties: PropertyCard[];
  baseUrl?: string | null;
  id?: string;
};

export default function SeoCollectionStructuredData({
  name,
  description,
  path,
  properties,
  baseUrl,
  id = 'collection-json-ld',
}: Props) {
  if (!properties.length) return null;

  const canonicalBaseUrl = normalizeCanonicalBaseUrl(baseUrl || getDefaultCanonicalBaseUrl());
  const pageUrl = buildCanonicalUrl(canonicalBaseUrl, path);

  return (
    <JsonLdScript
      id={id}
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url: pageUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: properties.map((property, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: property.title,
            url: buildCanonicalUrl(canonicalBaseUrl, getPreferredProjectCanonicalPath(property.slug)),
          })),
        },
      }}
    />
  );
}
