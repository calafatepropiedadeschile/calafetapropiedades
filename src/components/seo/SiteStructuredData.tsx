import JsonLdScript from '@/components/seo/JsonLdScript';
import { buildCanonicalUrl, normalizeCanonicalBaseUrl } from '@/config/seo-url';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';
import type { SiteSettingsPayload } from '@/features/site-content/site-settings';
import {
  resolveOrganizationAreaServed,
  resolveOrganizationPostalAddress,
} from '@/lib/seo/organization-schema';

type SiteStructuredDataProps = {
  seo: SiteSeoSettingsView | null;
  settings: SiteSettingsPayload;
  baseUrl: string;
};

function normalizeSocialUrl(url: string) {
  try {
    const parsed = new URL(url);
    const hasSpecificProfile = parsed.pathname.replaceAll('/', '').length > 0;
    return hasSpecificProfile ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export default function SiteStructuredData({ seo, settings, baseUrl }: SiteStructuredDataProps) {
  const canonicalBaseUrl = normalizeCanonicalBaseUrl(baseUrl);
  const siteName = seo?.siteName || 'Calafate Propiedades';
  const description = seo?.defaultDescriptionEs || 'Parcelas, terrenos y loteos seleccionados en Chile.';
  const logoUrl = buildCanonicalUrl(canonicalBaseUrl, '/brand/calafate-logo.png');
  const sameAs = [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.linkedinUrl,
  ]
    .map(normalizeSocialUrl)
    .filter((url): url is string => Boolean(url));

  const postalAddress = resolveOrganizationPostalAddress(settings);
  const areaServed = resolveOrganizationAreaServed(seo?.serviceAreas);

  const graph = [
    {
      '@type': 'RealEstateAgent',
      '@id': `${canonicalBaseUrl}/#organization`,
      name: siteName,
      url: canonicalBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
      image: seo?.defaultOgImage || logoUrl,
      description,
      email: settings.primaryEmail,
      telephone: settings.primaryPhone,
      address: {
        '@type': 'PostalAddress',
        ...postalAddress,
      },
      areaServed,
      knowsAbout: [
        'Parcelas en Chile',
        'Terrenos en el sur de Chile',
        'Loteos y proyectos de parcelación',
        'Propiedades rurales',
        'Valdivia',
        'Los Muermos',
        'Puerto Montt',
        'Región del Maule',
        'San Rafael',
      ],
      sameAs: sameAs.length ? sameAs : undefined,
    },
    {
      '@type': 'WebSite',
      '@id': `${canonicalBaseUrl}/#website`,
      url: canonicalBaseUrl,
      name: siteName,
      description,
      publisher: { '@id': `${canonicalBaseUrl}/#organization` },
      relatedLink: [
        buildCanonicalUrl(canonicalBaseUrl, '/sobre-calafate'),
        buildCanonicalUrl(canonicalBaseUrl, '/llms.txt'),
        buildCanonicalUrl(canonicalBaseUrl, '/llms-full.txt'),
      ],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${buildCanonicalUrl(canonicalBaseUrl, '/propiedades')}?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <JsonLdScript
      id="site-json-ld"
      data={{
        '@context': 'https://schema.org',
        '@graph': graph,
      }}
    />
  );
}
