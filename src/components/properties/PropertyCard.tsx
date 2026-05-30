'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Home, Ruler, Layers, CheckCircle2 } from 'lucide-react';
import type { PropertyCard as PropertyCardType } from '@/types/property';
import { formatArea, formatPropertyPrice } from '@/lib/utils/formatters';
import { shouldShowPriceFrom } from '@/features/properties/property-land-options';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Props {
  property: PropertyCardType;
}

const PROPERTY_TYPE_KEYS = {
  casa: 'property.house',
  terreno: 'property.lot',
} as const;

export default function PropertyCard({ property }: Props) {
  const { locale, t } = useI18n();
  const {
    slug,
    title,
    price,
    currency,
    bedrooms,
    area,
    city,
    zone,
    coverImage,
    type,
    status,
    availableLots,
    priceFrom,
    lotSurfaceM2,
    priceType,
  } = property;
  
  const fallbackImage = getSiteImageUrl(
    'site/property-fallback.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
  );
  
  const propertyHref = locale === 'en' ? `/propiedades/${slug}?lang=en` : `/propiedades/${slug}`;
  const effectiveArea = lotSurfaceM2 ?? area;
  const statusLabel = status === 'disponible'
    ? t('property.available')
    : priceType === 'arriendo'
      ? t('property.rented')
      : t('property.sold');

  return (
    <article className="property-card-modern">
      {/* Background Image */}
      <div className="property-card-image-bg">
        <Image
          src={coverImage || fallbackImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Top Floating Badges */}
      <div className="property-card-badges-top">
        <span className="badge-pill">
          <Home size={14} />
          {t(PROPERTY_TYPE_KEYS[type])}
        </span>
        <span className={`property-card-state ${status === 'disponible' ? 'is-available' : 'is-sold'}`}>
          {statusLabel}
        </span>
      </div>

      {/* Floating Content Card */}
      <div className="property-card-floating-content">
        <div className="property-card-price">
          {formatPropertyPrice(price, currency, {
            priceFrom: shouldShowPriceFrom({ priceFrom, type, currency }),
            locale,
            priceType,
          })}
        </div>
        
        <h3 className="property-card-title">
          <Link href={propertyHref}>{title}</Link>
        </h3>
        
        <p className="property-card-location">
          {zone}, {city}
        </p>

        {/* Specs Row */}
        <div className="property-card-specs-row">
          {bedrooms ? (
            <span className="spec-item">
              <Layers size={14} />
              <span>{bedrooms} {t('property.bedrooms')}</span>
            </span>
          ) : null}
          {effectiveArea ? (
            <span className="spec-item">
              <Ruler size={14} />
              <span>{formatArea(Math.round(effectiveArea))}</span>
            </span>
          ) : null}
          {availableLots != null ? (
            <span className="spec-item">
              <CheckCircle2 size={14} />
              <span>{availableLots} disp.</span>
            </span>
          ) : null}
        </div>

        {/* Action Button */}
        <Link href={propertyHref} className="btn-more-details" tabIndex={-1}>
          {t('property.viewDetails')}
        </Link>
      </div>
    </article>
  );
}
