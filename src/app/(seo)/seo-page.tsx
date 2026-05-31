import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoCatalogLanding from '@/components/seo/SeoCatalogLanding';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getSeoLandingPage, seoLandingPages, type SeoLandingKey } from '@/config/seo-pages';
import { getCatalogPageData, type CatalogPageParams } from '@/features/properties/property.service';
import { CATALOG_PAGE_LIMIT, normalizeCatalogFilters } from '@/features/properties/property-filtering';
import { getServerLocale } from '@/lib/i18n/server';
import { getPublishedStaticPageBySlug } from '@/features/site-content/static-page';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

export const revalidate = 60;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export async function metadataForSeoLanding(key: SeoLandingKey): Promise<Metadata> {
  const locale = await getServerLocale();
  const config = getSeoLandingPage(key, locale);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();
  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, landingKey: key });
  const alternates = buildPageAlternates(config.path, { baseUrl, locale, includeEnglish });

  return {
    title: config.metadataTitle,
    description: config.metadataDescription,
    alternates,
    openGraph: {
      title: config.metadataTitle,
      description: config.metadataDescription,
      url: alternates.canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.metadataTitle,
      description: config.metadataDescription,
    },
  };
}

export async function generateMetadataForSeoLanding(key: SeoLandingKey): Promise<Metadata> {
  const locale = await getServerLocale();
  const config = getSeoLandingPage(key, locale);
  const [seo, cmsPage] = await Promise.all([
    getSiteSeoSettings().catch(() => null),
    getPublishedStaticPageBySlug(key, locale).catch(() => null),
  ]);
  const canonicalBaseUrl = await resolveCanonicalBaseUrl();
  const includeEnglish = await resolvePageIncludeEnglish({ seo, landingKey: key });
  const alternates = buildPageAlternates(config.path, {
    baseUrl: canonicalBaseUrl,
    locale,
    customCanonical: cmsPage?.customCanonical,
    includeEnglish,
  });
  const title = cmsPage?.seoTitle || config.metadataTitle;
  const description = cmsPage?.seoDescription || config.metadataDescription;
  const image = cmsPage?.ogImage || seo?.defaultOgImage || undefined;

  return {
    title,
    description,
    alternates,
    robots: seo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function SeoLandingPage({
  pageKey,
  searchParams,
}: {
  pageKey: SeoLandingKey;
  searchParams?: Promise<CatalogPageParams>;
}) {
  const locale = await getServerLocale(searchParams ? await searchParams : undefined);
  const config = getSeoLandingPage(pageKey, locale);
  const cmsPage = await getPublishedStaticPageBySlug(pageKey, locale).catch(() => null);
  const params = searchParams ? await searchParams : {};
  const presetFilters = {
    query: '',
    country: 'Chile' as const,
    zone: config.filters.zone ?? '',
    type: config.filters.type ?? '',
    priceType: config.filters.priceType ?? '',
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    hasAvailableLots: config.filters.hasAvailableLots ?? false,
  };

  const catalog = config.showCatalog !== false && hasDatabaseUrl
    ? await getCatalogPageData(params, { preset: presetFilters, locale }).catch((error) => {
        console.warn('Skipping SEO landing catalog because the datasource is unavailable.', error);
        return {
          filters: normalizeCatalogFilters({ ...presetFilters, ...params }),
          properties: [],
          zoneOptions: [],
          pagination: { page: 1, totalPages: 0, total: 0, limit: CATALOG_PAGE_LIMIT },
        };
      })
    : {
        filters: normalizeCatalogFilters({ ...presetFilters, ...params }),
        properties: [],
        zoneOptions: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: CATALOG_PAGE_LIMIT },
      };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))' }}>
        <SeoCatalogLanding
          config={config}
          properties={catalog.properties}
          zoneOptions={catalog.zoneOptions}
          initialFilters={catalog.filters}
          pagination={catalog.pagination}
          cmsPage={cmsPage}
        />
      </main>
      <Footer />
    </>
  );
}
