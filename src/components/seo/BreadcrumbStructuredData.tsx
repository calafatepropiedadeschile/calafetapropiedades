import JsonLdScript from '@/components/seo/JsonLdScript';
import { buildCanonicalUrl, getDefaultCanonicalBaseUrl, normalizeCanonicalBaseUrl } from '@/config/seo-url';

type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbStructuredDataProps = {
  items: BreadcrumbItem[];
  baseUrl?: string | null;
  id?: string;
};

export default function BreadcrumbStructuredData({
  items,
  baseUrl,
  id = 'breadcrumb-json-ld',
}: BreadcrumbStructuredDataProps) {
  const canonicalBaseUrl = normalizeCanonicalBaseUrl(baseUrl || getDefaultCanonicalBaseUrl());
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: buildCanonicalUrl(canonicalBaseUrl, item.path),
  }));

  return (
    <JsonLdScript
      id={id}
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      }}
    />
  );
}
