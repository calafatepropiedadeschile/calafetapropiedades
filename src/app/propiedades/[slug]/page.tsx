import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Ruler, CheckCircle2, Heart } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyLeadPanel from '@/components/marketing/PropertyLeadPanel';
import PropertyGallery from '@/components/properties/PropertyGallery';
import { getPropertyBySlug } from '@/features/properties/property.service';
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
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

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
  const baseUrl = siteSeo?.canonicalBaseUrl ?? 'https://calafetapropiedades.vercel.app';

  // Use dynamic override fields or fallback to translation-aware intelligent defaults
  const seoTitle = locale === 'en' 
    ? (property.seoTitleEn || property.seoTitleEs || property.title)
    : (property.seoTitleEs || property.title);

  const seoDescription = locale === 'en'
    ? (property.seoDescriptionEn || property.seoDescriptionEs || property.description.slice(0, 160))
    : (property.seoDescriptionEs || property.description.slice(0, 160));

  const canonicalUrl = property.customCanonical || `${baseUrl}/propiedades/${slug}${locale === 'en' ? '?lang=en' : ''}`;
  const ogImageUrl = property.ogImage || property.coverImage || siteSeo?.defaultOgImage || '';

  return {
    title: seoTitle,
    description: seoDescription,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
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
              <PropertyGallery images={galleryImages} title={title} locale={locale} />

              <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="pdp-hero-header">
                  <div className="pdp-hero-title-row">
                    <h1 className="pdp-hero-title">{title}</h1>
                    <button className="pdp-save-btn" aria-label="Guardar propiedad">
                      <Heart size={28} strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  <div className="pdp-hero-price">
                    {formatPropertyPrice(price, currency, {
                      priceFrom: shouldShowPriceFrom({ priceFrom, type, currency }),
                      locale,
                      priceType,
                      displayCurrency,
                      rates: exchangeRates,
                    })}
                  </div>

                  <div className="pdp-hero-badges">
                    <span className="pdp-hero-badge pdp-hero-badge--primary">
                      {priceTypeKey ? t(priceTypeKey) : priceType}
                    </span>
                    {statusKey && (
                      <span className="pdp-hero-badge pdp-hero-badge--secondary">
                        {t(statusKey)}
                      </span>
                    )}
                  </div>

                  <div className="pdp-hero-specs-inline">
                    <span className="pdp-hero-spec-item">
                      {[province, city, zone].filter(Boolean).join(', ')}
                    </span>
                    {(builtArea || area) ? (
                      <>
                        <span className="pdp-hero-spec-dot">•</span>
                        <span className="pdp-hero-spec-item">{Math.round(builtArea ?? area ?? 0)} m²</span>
                      </>
                    ) : null}
                    {lotSurfaceM2 ? (
                      <>
                        <span className="pdp-hero-spec-dot">•</span>
                        <span className="pdp-hero-spec-item">{Math.round(lotSurfaceM2)} m² {t('property.lotSurface')}</span>
                      </>
                    ) : null}
                    {bedrooms ? (
                      <>
                        <span className="pdp-hero-spec-dot">•</span>
                        <span className="pdp-hero-spec-item">{bedrooms} {t('property.bedrooms')}</span>
                      </>
                    ) : null}
                    {bathrooms ? (
                      <>
                        <span className="pdp-hero-spec-dot">•</span>
                        <span className="pdp-hero-spec-item">{bathrooms} {t('property.bathrooms')}</span>
                      </>
                    ) : null}
                    {availableLots != null ? (
                      <>
                        <span className="pdp-hero-spec-dot">•</span>
                        <span className="pdp-hero-spec-item">{availableLots} disp.</span>
                      </>
                    ) : null}
                  </div>
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
                <PropertyExperienceSections property={property} locale={locale} />
              )}

              {showLandSections ? (
                <>
                  <h2 className="property-technical-heading">{t('property.technicalDetailsBelow')}</h2>
                  <PropertyLandProjectSections property={property} locale={locale} showTopHighlights={false} />
                </>
              ) : (
                <>
                  <section style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                      {t('property.mainDetails')}
                    </h2>
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
                    <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        {t('property.landDetails')}
                      </h2>
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
                    <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        {t('property.amenities')}
                      </h2>
                      <div className="amenities-grid">
                        {amenities.map((amenity) => (
                          <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.9375rem' }}>
                            <span style={{ color: 'var(--color-primary)' }}>+</span>{' '}
                            {t(getAmenityTranslationKey(amenity))}
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
      </main>
      <StructuredData property={property} locale={locale} baseUrl={siteSeo?.canonicalBaseUrl} />
      <Footer />
    </>
  );
}
