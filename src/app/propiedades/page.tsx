import type { Metadata } from 'next';
import TranslatedText from '@/components/i18n/TranslatedText';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCatalog from '@/components/properties/PropertyCatalog';
import { getStaticPropertyCatalog } from '@/features/properties/property.service';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { isPropertyMarketRegion } from '@/features/properties/property-markets';
import type { PriceType, PropertyType } from '@/types/property';

export const metadata: Metadata = {
  title: 'Propiedades',
  description: 'Explora nuestro catalogo completo de propiedades.',
};

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function getSafePropertyCatalog() {
  if (!hasDatabaseUrl) return [];

  try {
    return await getStaticPropertyCatalog(DEFAULT_LOCALE);
  } catch (error) {
    console.warn('Skipping property catalog because the datasource is unavailable.', error);
    return [];
  }
}

interface Props {
  searchParams: Promise<{
    type?: string;
    query?: string;
    zone?: string;
    priceType?: string;
    marketRegion?: string;
    country?: string;
  }>;
}

const PROPERTY_TYPES = new Set<PropertyType>(['casa', 'apartamento', 'local', 'oficina', 'terreno']);
const PRICE_TYPES = new Set<PriceType>(['venta', 'alquiler']);

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams;
  const properties = await getSafePropertyCatalog();
  const type = PROPERTY_TYPES.has(params.type as PropertyType) ? params.type as PropertyType : '';
  const priceType = PRICE_TYPES.has(params.priceType as PriceType) ? params.priceType as PriceType : 'venta';
  const marketRegion = isPropertyMarketRegion(params.marketRegion) ? params.marketRegion : '';

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
            initialFilters={{
              query: params.query ?? '',
              type,
              priceType,
              marketRegion,
              country: params.country ?? '',
              zone: params.zone ?? '',
            }}
            showPriceModeTabs
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
