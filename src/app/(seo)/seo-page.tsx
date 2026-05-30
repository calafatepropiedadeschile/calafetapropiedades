import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoCatalogLanding from '@/components/seo/SeoCatalogLanding';
import { getSeoLandingPage, seoLandingPages, siteUrl, type SeoLandingKey } from '@/config/seo-pages';
import { getCatalogPageData, type CatalogPageParams } from '@/features/properties/property.service';
import { CATALOG_PAGE_LIMIT, normalizeCatalogFilters } from '@/features/properties/property-filtering';
import { getServerLocale } from '@/lib/i18n/server';
import { getPublishedStaticPageBySlug } from '@/features/site-content/static-page';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

export const revalidate = 60;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export async function metadataForSeoLanding(key: SeoLandingKey): Promise<Metadata> {
  const locale = await getServerLocale();
  const config = getSeoLandingPage(key, locale);
  const canonical = `${siteUrl}${config.path}`;

  return {
    title: config.metadataTitle,
    description: config.metadataDescription,
    alternates: { canonical },
    openGraph: {
      title: config.metadataTitle,
      description: config.metadataDescription,
      url: canonical,
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
  const canonicalBaseUrl = seo?.canonicalBaseUrl ?? siteUrl;
  const canonical = cmsPage?.customCanonical || `${canonicalBaseUrl}${config.path}`;
  const title = cmsPage?.seoTitle || config.metadataTitle;
  const description = cmsPage?.seoDescription || config.metadataDescription;
  const image = cmsPage?.ogImage || seo?.defaultOgImage || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: seo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
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
