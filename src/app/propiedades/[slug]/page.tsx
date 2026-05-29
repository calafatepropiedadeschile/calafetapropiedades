import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LeadForm from '@/components/forms/LeadForm';
import PropertyGallery from '@/components/properties/PropertyGallery';
import { getPropertyBySlug } from '@/features/properties/property.service';
import { formatPrice, formatArea } from '@/lib/utils/formatters';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { isSupportedLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';

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
  alquiler: 'property.forRent',
} as const satisfies Record<string, TranslationKey>;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
}

function getLocaleFromParam(value: string | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

async function getSafePropertyBySlug(slug: string, locale: Locale) {
  try {
    return await getPropertyBySlug(slug, locale);
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
  const locale = getLocaleFromParam(search?.lang);
  const property = await getSafePropertyBySlug(slug, locale);
  if (!property) return { title: 'Propiedad no encontrada' };

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      images: property.coverImage ? [property.coverImage] : [],
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
  const camel = slug.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  const capitalized = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `property.amenity${capitalized}` as TranslationKey;
}

function getServiceTranslationKey(slug: string): TranslationKey {
  const camel = slug.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  const capitalized = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `property.service${capitalized}` as TranslationKey;
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
  const locale = getLocaleFromParam(search?.lang);
  const property = await getSafePropertyBySlug(slug, locale);

  if (!property) notFound();

  const {
    id, title, description, price, priceType, currency, zone, city, address, province, addressVisibility,
    type, status, bedrooms, bathrooms, area, totalArea, builtArea, yearBuilt,
    expenses, parking, frontage, depth, zoning, services, amenities, images, coverImage,
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

  const specs = [
    detailSpec('property.type', typeKey ? t(typeKey) : type),
    detailSpec('property.bedrooms', bedrooms != null ? `${bedrooms}` : null),
    detailSpec('property.bathrooms', bathrooms != null ? `${bathrooms}` : null),
    detailSpec('property.builtArea', builtArea || area ? formatArea(builtArea ?? area) : null),
    detailSpec('property.totalArea', totalArea ? formatArea(totalArea) : null),
    detailSpec('property.parking', parking != null ? `${parking}` : null),
    detailSpec('property.year', yearBuilt != null ? `${yearBuilt}` : null),
    detailSpec('property.expenses', expenses != null ? formatPrice(expenses, currency) : null),
    detailSpec('property.mode', priceTypeKey ? t(priceTypeKey) : priceType),
    detailSpec('property.status', statusKey ? t(statusKey) : status),
    detailSpec('property.zone', zone),
  ].filter(hasDetailSpec);

  return (
    <>
      <Navbar />
      <main lang={locale} style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', backgroundColor: 'var(--color-surface-2)', minHeight: '100vh' }}>
        <section className="container" style={{ paddingTop: 'var(--space-md)' }}>
          <PropertyGallery images={galleryImages} title={title} locale={locale} />
        </section>

        <section className="container section-padding" style={{ paddingBottom: 'var(--space-4xl)' }}>
          <div className="property-detail-layout">
            <div>
              <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="detail-badges">
                  <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                    {priceTypeKey ? t(priceTypeKey) : priceType}
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-dark)', border: '1px solid var(--color-border)' }}>
                    {statusKey ? t(statusKey) : status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }} aria-label="Idioma de la publicacion">
                  <Link
                    href={spanishHref}
                    className={`btn btn-sm ${locale === 'es' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Espanol
                  </Link>
                  <Link
                    href={englishHref}
                    className={`btn btn-sm ${locale === 'en' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    English
                  </Link>
                </div>
                <h1 className="detail-price">
                  {formatPrice(price, currency)}
                </h1>
                <div className="property-card-specs detail-inline-specs">
                  {bedrooms && <div className="property-card-spec">{bedrooms}<span>{t('property.bedroomsShort')}</span></div>}
                  {bathrooms && <div className="property-card-spec">{bathrooms}<span>{t('property.bathroomsShort')}</span></div>}
                  {(builtArea || area) && <div className="property-card-spec">{Math.round(builtArea ?? area ?? 0)}<span>m²</span></div>}
                  {totalArea && <div className="property-card-spec">{formatArea(totalArea)}<span>{t('property.total')}</span></div>}
                </div>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>
                  {formatVisibleAddress(address, addressVisibility, zone, city, province)}
                </p>
              </div>

              <section style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                  {t('property.about')}
                </h2>
                <div className="text-muted" style={{ lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                  {description}
                </div>
              </section>

              <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                  {t('property.mainDetails')}
                </h2>
                <div className="detail-specs-grid">
                  {specs.map((spec) => (
                    <div key={spec.labelKey} className="detail-spec-item">
                      <span className="detail-spec-label">{t(spec.labelKey)}</span>
                      <span className="detail-spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {(frontage || depth || zoning || services.length > 0) && (
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
                    {services.length > 0 && (
                      <div className="detail-spec-item">
                        <span className="detail-spec-label">{t('property.services')}</span>
                        <span className="detail-spec-value">
                          {services.map((service, idx) => (
                            <span key={service}>
                              {t(getServiceTranslationKey(service))}
                              {idx < services.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </span>
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

            </div>

            <aside className="property-contact-panel">
              <LeadForm propertyId={id} propertyTitle={title} locale={locale} />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
