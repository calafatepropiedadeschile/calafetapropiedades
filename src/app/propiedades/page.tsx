import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import TranslatedText from '@/components/i18n/TranslatedText';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCatalog from '@/components/properties/PropertyCatalog';
import { redirect } from 'next/navigation';
import { CATALOG_PAGE_LIMIT, normalizeCatalogFilters } from '@/features/properties/property-filtering';
import { getCatalogPageData } from '@/features/properties/property.service';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';
import { mergeCatalogSearchParams, readCatalogPreferences } from '@/lib/catalog/catalog-preferences';

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = siteSeo?.canonicalBaseUrl ?? 'https://calafetapropiedades.vercel.app';
  const title = 'Terrenos y loteos en venta';
  const description = 'Compara parcelas, terrenos y loteos en Chile por ubicacion, superficie, precio y disponibilidad.';

  return {
    title,
    description,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates: { canonical: `${baseUrl}/propiedades` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/propiedades`,
      images: siteSeo?.defaultOgImage ? [{ url: siteSeo.defaultOgImage }] : [],
    },
    twitter: {
      card: siteSeo?.defaultOgImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: siteSeo?.defaultOgImage ? [siteSeo.defaultOgImage] : [],
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
    hasAvailableLots: params.hasAvailableLots,
    page: params.page,
  });

  const catalog = hasDatabaseUrl
    ? await getCatalogPageData(mergedParams, {
        locale: DEFAULT_LOCALE,
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
              <TranslatedText id="catalog.pageTitle" />
            </h1>
            <p className="text-muted">
              <TranslatedText id="catalog.pageDescription" />
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
