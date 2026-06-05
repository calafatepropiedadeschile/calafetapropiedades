import type { ReactNode } from 'react';
import Link from 'next/link';
import { Bed, Bath, CheckCircle2 } from 'lucide-react';
import PropertyLeadPanel from '@/components/marketing/PropertyLeadPanel';
import PropertyGallery from '@/components/properties/PropertyGallery';
import SimilarPropertiesSection from '@/components/properties/SimilarPropertiesSection';
import PropertyCommercialHighlights from '@/components/properties/PropertyCommercialHighlights';
import PropertyDescription from '@/components/properties/PropertyDescription';
import PropertyLandProjectSections from '@/components/properties/PropertyLandProjectSections';
import PropertyExperienceSections from '@/components/properties/PropertyExperienceSections';
import type { Currency, Property, PropertyCard as PropertyCardType } from '@/types/property';
import type { ParsedPropertyDescription } from '@/features/properties/property-description-content';
import { formatArea, formatPropertyPrice } from '@/lib/utils/formatters';
import { isLandParcel, shouldShowPriceFrom } from '@/features/properties/property-land-options';
import type { Locale } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import type { ExchangeRates } from '@/lib/currency/types';
import type { ResolvedGoogleMapLink } from '@/lib/maps/google-maps-resolve';
import { getPropertyVideoWatchPath } from '@/lib/seo/property-media-pages';
import { getYoutubeThumbnailUrl, parseYoutubeVideoId } from '@/lib/seo/youtube';

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

function getOptionalTranslationKey<T extends Record<string, TranslationKey>>(keys: T, value: string) {
  return keys[value as keyof T] ?? null;
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

type Props = {
  property: Property;
  locale: Locale;
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
  similarProperties: PropertyCardType[];
  galleryImages: string[];
  parsedDescription: ParsedPropertyDescription;
  resolvedMap: ResolvedGoogleMapLink | null;
  pagePath: string;
  isProject: boolean;
};

export default function PropertyDetailPageContent({
  property,
  locale,
  displayCurrency,
  exchangeRates,
  similarProperties,
  galleryImages,
  parsedDescription,
  resolvedMap,
  pagePath,
  isProject,
}: Props) {
  const {
    id,
    slug,
    title,
    price,
    priceFrom,
    priceType,
    currency,
    zone,
    city,
    province,
    type,
    status,
    bedrooms,
    bathrooms,
    area,
    totalArea,
    builtArea,
    yearBuilt,
    expenses,
    parking,
    frontage,
    depth,
    zoning,
    amenities,
    lotSurfaceM2,
    totalLots,
    availableLots,
    stageName,
  } = property;

  const t = (key: TranslationKey) => translate(locale, key);
  const showLandSections = isLandParcel(property);
  const youtubeVideoId = parseYoutubeVideoId(property.youtubeUrl);
  const videoWatchHref = youtubeVideoId ? getPropertyVideoWatchPath(slug) : null;
  const videoThumbnailUrl = youtubeVideoId ? getYoutubeThumbnailUrl(youtubeVideoId) : null;
  const typeKey = getOptionalTranslationKey(PROPERTY_TYPE_KEYS, type);
  const priceTypeKey = getOptionalTranslationKey(PRICE_TYPE_KEYS, priceType);
  const statusKey = getOptionalTranslationKey(PROPERTY_STATUS_KEYS, status);

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
    detailSpec('property.zone', zone),
  ].filter(hasDetailSpec);

  return (
    <main lang={locale} className="pdp-main" style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', backgroundColor: 'var(--color-surface-2)', minHeight: '100vh' }}>
      <section className="container section-padding" style={{ paddingBottom: 'var(--space-4xl)', paddingTop: 'var(--space-2xl)' }}>
        <div className="property-detail-layout">
          <div>
            {isProject ? (
              <p className="property-detail-eyebrow">{t('property.projectBadge')}</p>
            ) : null}

            <PropertyGallery
              images={galleryImages}
              title={title}
              locale={locale}
              videoWatchHref={videoWatchHref}
              videoThumbnailUrl={videoThumbnailUrl}
            />

            <div className="pdp-info-block">
              <h1 className="pdp-hero-title">{title}</h1>

              <div className="pdp-price-location-row">
                <div className="pdp-price-location-meta">
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
                </div>
              </div>

              {(priceTypeKey || statusKey) ? (
                <div className="pdp-hero-badges">
                  {priceTypeKey ? (
                    <span className="pdp-badge pdp-badge--primary">
                      {t(priceTypeKey)}
                    </span>
                  ) : null}
                  {statusKey ? (
                    <span className="pdp-badge pdp-badge--secondary">
                      {t(statusKey)}
                    </span>
                  ) : null}
                </div>
              ) : null}

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
              showSpanishFallbackNotice={locale === 'en' && property.descriptionContentLocale === 'es'}
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

            {isProject ? (
              <div className="property-detail-project-links">
                <Link href="/proyectos" className="btn btn-outline btn-sm">
                  {t('property.viewMoreProjects')}
                </Link>
              </div>
            ) : null}
          </div>

          <aside className="property-contact-panel">
            <div className="floating-contact-card">
              <PropertyLeadPanel
                propertyId={id}
                propertyTitle={title}
                propertySlug={slug}
                locale={locale}
                pageLabel={pagePath}
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
  );
}
