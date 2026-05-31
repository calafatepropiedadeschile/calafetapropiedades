import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Ruler, CheckCircle2, Heart } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyLeadPanel from '@/components/marketing/PropertyLeadPanel';
import PropertyGallery from '@/components/properties/PropertyGallery';
import SimilarPropertiesSection from '@/components/properties/SimilarPropertiesSection';
import { getPropertyBySlug, getSimilarProperties } from '@/features/properties/property.service';
import { formatArea, formatPropertyPrice } from '@/lib/utils/formatters';
import PropertyCommercialHighlights from '@/components/properties/PropertyCommercialHighlights';
import PropertyDescription from '@/components/properties/PropertyDescription';
import PropertyLandProjectSections from '@/components/properties/PropertyLandProjectSections';
import PropertyExperienceSections from '@/components/properties/PropertyExperienceSections';
import { parsePropertyDescription } from '@/features/properties/property-description-content';
import { isLandParcel, shouldShowPriceFrom } from '@/features/properties/property-land-options';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { isSupportedLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getExchangeRates } from '@/lib/currency/exchange-rates';
import { getServerCurrency, getServerLocale } from '@/lib/i18n/server';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import { auth } from '@/lib/auth/auth';
import StructuredData from '@/components/seo/StructuredData';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { getResolvedGoogleMapsLink } from '@/lib/maps/google-maps-resolve';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const PROPERTY_TYPE_KEYS = {
  casa: 'property.house',
  apartamento: 'property.apartment',
  local: 'property.retail',
  oficina: 'property.office',
  terreno: 'property.lot',
} as const satisfies Record<string, TranslationKey>;

const PROPERTY_STATUS_KEYS = {
  disponible: 'property.available',
  vendido: 'property.sold',
  alquilado: 'property.rented',
} as const satisfies Record<string, TranslationKey>;

const PRICE_TYPE_KEYS = {
  venta: 'property.forSale',
  arriendo: 'property.forRent',
} as const satisfies Record<string, TranslationKey>;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
}

async function resolvePageLocale(search?: { lang?: string }): Promise<Locale> {
  if (isSupportedLocale(search?.lang)) {
    return search.lang;
  }

  return getServerLocale(search);
}

async function getSafePropertyBySlug(slug: string, locale: Locale, showUnpublished = false) {
  try {
    return await getPropertyBySlug(slug, locale, showUnpublished);
  } catch (error) {
    console.error(`Unable to load property detail for slug "${slug}".`, error);
    return null;
  }
}

function getOptionalTranslationKey<T extends Record<string, TranslationKey>>(keys: T, value: string) {
  return keys[value as keyof T] ?? null;
}

function isValidImageSource(src: string) {
  if (src.startsWith('/')) return true;

  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function cleanImageSources(images: string[]) {
  return images
    .map((image) => image.trim())
    .filter((image) => image.length > 0 && isValidImageSource(image));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  if (!hasDatabaseUrl) return { title: 'Propiedad no encontrada' };

  const { slug } = await params;
  const search = await searchParams;
  const locale = await resolvePageLocale(search);

  // Read session context for admin preview of draft properties
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  const property = await getSafePropertyBySlug(slug, locale, isAdmin);
  if (!property) return { title: 'Propiedad no encontrada' };
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  // Use dynamic override fields or fallback to translation-aware intelligent defaults
  const seoTitle = locale === 'en' 
    ? (property.seoTitleEn || property.seoTitleEs || property.title)
    : (property.seoTitleEs || property.title);

  const seoDescription = locale === 'en'
    ? (property.seoDescriptionEn || property.seoDescriptionEs || property.description.slice(0, 160))
    : (property.seoDescriptionEs || property.description.slice(0, 160));

  const alternates = buildPageAlternates(`/propiedades/${slug}`, {
    baseUrl,
    locale,
    customCanonical: property.customCanonical,
  });
  const ogImageUrl = property.ogImage || property.coverImage || siteSeo?.defaultOgImage || '';

  return {
    title: seoTitle,
    description: seoDescription,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: alternates.canonical,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

function formatVisibleAddress(address: string | null, visibility: string, zone: string, city: string, province: string | null) {
  const locationTail = [zone, city, province].filter(Boolean).join(', ');

  if (!address || visibility === 'zona') {
    return locationTail;
  }

  if (visibility === 'aproximada') {
    return [address.replace(/\s+\d+\w*(?:[-/]\d+\w*)?$/, ''), locationTail].filter(Boolean).join(', ');
  }

  return [address, locationTail].filter(Boolean).join(', ');
}

function getAmenityTranslationKey(slug: string): TranslationKey {
  const camel = slug.replace(/[_-]([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  const capitalized = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `property.amenity${capitalized}` as TranslationKey;
}

function detailSpec(labelKey: TranslationKey, value: ReactNode | null) {
  return { labelKey, value };
}

function hasDetailSpec(spec: ReturnType<typeof detailSpec>): spec is { labelKey: TranslationKey; value: ReactNode } {
  return spec.value !== null;
}

export default async function PropertyDetailPage({ params, searchParams }: Props) {
  if (!hasDatabaseUrl) notFound();

  const { slug } = await params;
  const search = await searchParams;
  const [locale, displayCurrency, exchangeRates] = await Promise.all([
    resolvePageLocale(search),
    getServerCurrency(),
    getExchangeRates(),
  ]);

  // Authenticate session to preview draft properties
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  const property = await getSafePropertyBySlug(slug, locale, isAdmin);

  if (!property) notFound();
  const siteSeo = await getSiteSeoSettings().catch(() => null);

  const similarProperties = await getSimilarProperties(property.id, slug, locale).catch((error) => {
    console.error(`Unable to load similar properties for slug "${slug}".`, error);
    return [];
  });

  const {
    id, title, description, price, priceFrom, priceType, currency, zone, city, address, province, addressVisibility,
    type, status, bedrooms, bathrooms, area, totalArea, builtArea, yearBuilt,
    expenses, parking, frontage, depth, zoning, amenities, images, coverImage,
    lotSurfaceM2, totalLots, availableLots, stageName,
  } = property;

  const allImages = coverImage && isValidImageSource(coverImage)
    ? [coverImage, ...images.filter((img) => img !== coverImage)]
    : images;
  const fallbackImage = getSiteImageUrl(
    'site/property-detail-fallback.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop'
  );
  const cleanGalleryImages = cleanImageSources(allImages);
  const galleryImages = cleanGalleryImages.length > 0 ? cleanGalleryImages : [fallbackImage];
  const typeKey = getOptionalTranslationKey(PROPERTY_TYPE_KEYS, type);
  const priceTypeKey = getOptionalTranslationKey(PRICE_TYPE_KEYS, priceType);
  const statusKey = getOptionalTranslationKey(PROPERTY_STATUS_KEYS, status);
  const spanishHref = `/propiedades/${slug}`;
  const englishHref = `/propiedades/${slug}?lang=en`;
  const t = (key: TranslationKey) => translate(locale, key);
  const parsedDescription = parsePropertyDescription(description);
  const showLandSections = isLandParcel(property);
  const resolvedMap = property.mapUrl?.trim()
    ? await getResolvedGoogleMapsLink(property.mapUrl)
    : null;

  const specs = [
    detailSpec('property.type', typeKey ? t(typeKey) : type),
    detailSpec('property.bedrooms', bedrooms != null ? `${bedrooms}` : null),
    detailSpec('property.bathrooms', bathrooms != null ? `${bathrooms}` : null),
    detailSpec('property.builtArea', builtArea || area ? formatArea(builtArea ?? area) : null),
    detailSpec('property.totalArea', totalArea ? formatArea(totalArea) : null),
    detailSpec('property.totalArea', lotSurfaceM2 ? formatArea(lotSurfaceM2) : null),
    detailSpec('property.status', availableLots != null ? `${availableLots} lotes disponibles` : null),
    detailSpec('property.status', totalLots != null ? `${totalLots} lotes totales` : null),
    detailSpec('property.mode', stageName),
    detailSpec('property.parking', parking != null ? `${parking}` : null),
    detailSpec('property.year', yearBuilt != null ? `${yearBuilt}` : null),
    detailSpec('property.expenses', expenses != null ? formatPropertyPrice(expenses, currency, { locale, displayCurrency, rates: exchangeRates }) : null),
    detailSpec('property.mode', priceTypeKey ? t(priceTypeKey) : priceType),
    detailSpec('property.status', statusKey ? t(statusKey) : status),
    detailSpec('property.zone', zone),
  ].filter(hasDetailSpec);

  return (
    <>
      <Navbar />
      <main lang={locale} className="pdp-main" style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', backgroundColor: 'var(--color-surface-2)', minHeight: '100vh' }}>
        <section className="container section-padding" style={{ paddingBottom: 'var(--space-4xl)', paddingTop: 'var(--space-2xl)' }}>
          <div className="property-detail-layout">
            <div>
              {/* Modern Gallery is now INSIDE the left column */}
              <PropertyGallery images={galleryImages} title={title} locale={locale} youtubeUrl={property.youtubeUrl} />

              <div className="pdp-info-block">
                {/* Título + Favorito */}
                <div className="pdp-hero-title-row">
                  <h1 className="pdp-hero-title">{title}</h1>
                  <button className="pdp-save-btn" aria-label="Guardar propiedad">
                    <Heart size={24} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Precio + Ubicación + Badges en fila */}
                <div className="pdp-price-location-row">
                  <span className="pdp-price-display">
                    {formatPropertyPrice(price, currency, {
                      priceFrom: shouldShowPriceFrom({ priceFrom, type, currency }),
                      locale,
                      priceType,
                      displayCurrency,
                      rates: exchangeRates,
                    })}
                  </span>
                  <span className="pdp-location-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {[zone, city, province].filter(Boolean).join(', ')}
                  </span>
                  <div className="pdp-badges-inline">
                    <span className="pdp-badge pdp-badge--primary">
                      {priceTypeKey ? t(priceTypeKey) : priceType}
                    </span>
                    {statusKey && (
                      <span className="pdp-badge pdp-badge--secondary">
                        {t(statusKey)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de specs con iconos y separadores */}
                <div className="pdp-specs-bar">
                  {(builtArea || area) ? (
                    <div className="pdp-spec-pill">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                      <span><strong>{Math.round(builtArea ?? area ?? 0)} m²</strong> {t('property.livingArea')}</span>
                    </div>
                  ) : null}
                  {lotSurfaceM2 ? (
                    <>
                      <span className="pdp-spec-divider" aria-hidden />
                      <div className="pdp-spec-pill">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 3 3 6 3"/><polyline points="18 3 21 3 21 6"/><polyline points="21 18 21 21 18 21"/><polyline points="6 21 3 21 3 18"/><rect x="7" y="7" width="10" height="10"/></svg>
                        <span><strong>{Math.round(lotSurfaceM2)} m²</strong> {t('property.lotSurface')}</span>
                      </div>
                    </>
                  ) : null}
                  {bedrooms ? (
                    <>
                      <span className="pdp-spec-divider" aria-hidden />
                      <div className="pdp-spec-pill">
                        <Bed size={20} strokeWidth={1.5} aria-hidden />
                        <span><strong>{bedrooms}</strong> {t('property.bedrooms')}</span>
                      </div>
                    </>
                  ) : null}
                  {bathrooms ? (
                    <>
                      <span className="pdp-spec-divider" aria-hidden />
                      <div className="pdp-spec-pill">
                        <Bath size={20} strokeWidth={1.5} aria-hidden />
                        <span><strong>{bathrooms}</strong> {t('property.bathrooms')}</span>
                      </div>
                    </>
                  ) : null}
                  {availableLots != null ? (
                    <>
                      <span className="pdp-spec-divider" aria-hidden />
                      <div className="pdp-spec-pill">
                        <CheckCircle2 size={20} strokeWidth={1.5} aria-hidden />
                        <span><strong>{availableLots}</strong> {t('property.lotsAvailable')}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <PropertyCommercialHighlights
                property={property}
                locale={locale}
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
                title={t('property.commercialSnapshot')}
              />

              <PropertyDescription
                parsed={parsedDescription}
                sectionTitle={t('property.about')}
                hint={showLandSections ? t('property.descriptionHint') : undefined}
              />

              {!showLandSections && (
                <PropertyExperienceSections
                  property={property}
                  locale={locale}
                  resolvedMap={resolvedMap}
                />
              )}

              {showLandSections ? (
                <>
                  <h2 className="property-technical-heading">{t('property.technicalDetailsBelow')}</h2>
                  <PropertyLandProjectSections
                    property={property}
                    locale={locale}
                    showTopHighlights={false}
                    resolvedMap={resolvedMap}
                  />
                </>
              ) : (
                <>
                  <section className="pdp-section-block">
                    <h2 className="pdp-section-title">{t('property.mainDetails')}</h2>
                    <div className="detail-specs-grid">
                      {specs.map((spec, index) => (
                        <div key={`${spec.labelKey}-${index}`} className="detail-spec-item">
                          <span className="detail-spec-label">{t(spec.labelKey)}</span>
                          <span className="detail-spec-value">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {(frontage || depth || zoning) && (
                    <section className="pdp-section-block">
                      <h2 className="pdp-section-title">{t('property.landDetails')}</h2>
                      <div className="detail-specs-grid">
                        {frontage && (
                          <div className="detail-spec-item">
                            <span className="detail-spec-label">{t('property.frontage')}</span>
                            <span className="detail-spec-value">{frontage} m</span>
                          </div>
                        )}
                        {depth && (
                          <div className="detail-spec-item">
                            <span className="detail-spec-label">{t('property.depth')}</span>
                            <span className="detail-spec-value">{depth} m</span>
                          </div>
                        )}
                        {zoning && (
                          <div className="detail-spec-item">
                            <span className="detail-spec-label">{t('property.zoning')}</span>
                            <span className="detail-spec-value">{zoning}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {amenities.length > 0 && (
                    <section className="pdp-section-block">
                      <h2 className="pdp-section-title">{t('property.amenities')}</h2>
                      <div className="pdp-amenities-grid">
                        {amenities.map((amenity) => (
                          <div key={amenity} className="pdp-amenity-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                            <span>{t(getAmenityTranslationKey(amenity))}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

            </div>

            <aside className="property-contact-panel">
              <div className="floating-contact-card">
                <PropertyLeadPanel
                  propertyId={id}
                  propertyTitle={title}
                  propertySlug={slug}
                  locale={locale}
                  pageLabel={`/propiedades/${slug}`}
                />
              </div>
            </aside>
          </div>
        </section>

        <SimilarPropertiesSection
          properties={similarProperties}
          property={property}
          locale={locale}
        />
      </main>
      <StructuredData property={property} locale={locale} baseUrl={siteSeo?.canonicalBaseUrl} />
      <BreadcrumbStructuredData
        baseUrl={siteSeo?.canonicalBaseUrl}
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Propiedades', path: '/propiedades' },
          { name: title, path: `/propiedades/${slug}` },
        ]}
      />
      <Footer />
    </>
  );
}
