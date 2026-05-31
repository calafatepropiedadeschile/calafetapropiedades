import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCatalog from '@/components/properties/PropertyCatalog';
import { redirect } from 'next/navigation';
import { CATALOG_PAGE_LIMIT, normalizeCatalogFilters } from '@/features/properties/property-filtering';
import { getCatalogPageData } from '@/features/properties/property.service';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getPublishedStaticPageBySlug } from '@/features/site-content/static-page';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { mergeCatalogSearchParams, readCatalogPreferences } from '@/lib/catalog/catalog-preferences';
import { getServerLocale } from '@/lib/i18n/server';
import { translate } from '@/lib/i18n/dictionaries';

const CATALOG_DEFAULT_TITLE = 'Terrenos y loteos en venta';
const CATALOG_DEFAULT_DESCRIPTION =
  'Compara parcelas, terrenos y loteos en Chile por ubicación, superficie, precio y disponibilidad.';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const [siteSeo, cmsPage] = await Promise.all([
    getSiteSeoSettings().catch(() => null),
    getPublishedStaticPageBySlug('propiedades', locale).catch(() => null),
  ]);
  const baseUrl = await resolveCanonicalBaseUrl();
  const title = cmsPage?.seoTitle || CATALOG_DEFAULT_TITLE;
  const description = cmsPage?.seoDescription || CATALOG_DEFAULT_DESCRIPTION;
  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, cmsSlug: 'propiedades' });
  const alternates = buildPageAlternates('/propiedades', {
    baseUrl,
    locale,
    customCanonical: cmsPage?.customCanonical,
    includeEnglish,
  });
  const image = cmsPage?.ogImage || siteSeo?.defaultOgImage || undefined;

  return {
    title,
    description,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export const revalidate = 60;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

function emptyCatalog(params: Awaited<Props['searchParams']>) {
  return {
    filters: normalizeCatalogFilters(params),
    properties: [],
    zoneOptions: [] as string[],
    pagination: { page: 1, totalPages: 0, total: 0, limit: CATALOG_PAGE_LIMIT },
  };
}

interface Props {
  searchParams: Promise<{
    type?: string;
    query?: string;
    zone?: string;
    priceType?: string;
    minPrice?: string;
    maxPrice?: string;
    minSurface?: string;
    minBedrooms?: string;
    minBathrooms?: string;
    hasAvailableLots?: string;
    page?: string;
  }>;
}

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams;

  if (params.priceType === 'arriendo') {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === 'priceType' || value === undefined) continue;
      if (Array.isArray(value)) {
        if (value[0]) query.set(key, value[0]);
      } else {
        query.set(key, value);
      }
    }
    const suffix = query.toString();
    redirect(suffix ? `/arriendos?${suffix}` : '/arriendos');
  }

  const locale = await getServerLocale();
  const cookieStore = await cookies();
  const catalogPreferences = readCatalogPreferences(cookieStore);
  const mergedParams = mergeCatalogSearchParams(catalogPreferences, {
    type: params.type,
    zone: params.zone,
    query: params.query,
    priceType: params.priceType,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minSurface: params.minSurface,
    minBedrooms: params.minBedrooms,
    minBathrooms: params.minBathrooms,
    hasAvailableLots: params.hasAvailableLots,
    page: params.page,
  });

  const catalog = hasDatabaseUrl
    ? await getCatalogPageData(mergedParams, {
        locale,
        preset: { priceType: 'venta' },
      }).catch((error) => {
        console.warn('Skipping property catalog because the datasource is unavailable.', error);
        return emptyCatalog(mergedParams);
      })
    : emptyCatalog(mergedParams);

  const { filters, properties, zoneOptions, pagination } = catalog;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))' }}>
        <section className="section container">
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <h1 className="heading-2 heading-display" style={{ marginBottom: 'var(--space-sm)' }}>
              {translate(locale, 'catalog.pageTitle')}
            </h1>
            <p className="text-muted">
              {translate(locale, 'catalog.pageDescription')}
            </p>
          </div>

          <PropertyCatalog
            properties={properties}
            zoneOptions={zoneOptions}
            initialFilters={filters}
            pagination={pagination}
            showPriceModeTabs
            catalogPriceMode="venta"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
