'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Layers, MapPin, Ruler } from 'lucide-react';
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

const PROPERTY_STATUS_KEYS = {
  disponible: 'property.available',
  vendido: 'property.sold',
} as const;

const PRICE_TYPE_KEYS = {
  venta: 'property.forSale',
  arriendo: 'property.forRent',
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
    totalLots,
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
  const statusLabel = status === 'vendido' && priceType === 'arriendo'
    ? t('property.rented')
    : t(PROPERTY_STATUS_KEYS[status]);
  const availabilityLabel = availableLots != null
    ? `${availableLots} disponibles`
    : statusLabel;
  const priceTypeKey = PRICE_TYPE_KEYS[priceType as keyof typeof PRICE_TYPE_KEYS];

  return (
    <article className="property-card-flat">
      <div className="property-card-flat-image-wrapper">
        <Link href={propertyHref} aria-label={`${t('property.viewDetails')}: ${title}`} className="property-card-image-link">
          <Image
            src={coverImage || fallbackImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        <div className={`property-card-status-badge ${status === 'disponible' ? 'is-available' : ''}`}>
          {availabilityLabel}
        </div>
      </div>

      <div className="property-card-flat-content">
        <div className="property-card-cardtop">
          <span className="property-card-type">{t(PROPERTY_TYPE_KEYS[type])}</span>
          <span className="property-card-code">
            {priceTypeKey ? t(priceTypeKey) : 'Chile'}
          </span>
        </div>

        <h3 className="property-card-flat-title">
          <Link href={propertyHref}>{title}</Link>
        </h3>

        <div className="property-card-flat-location">
          <MapPin size={15} aria-hidden="true" />
          <span>{zone}, {city}</span>
        </div>

        <div className="property-card-spec-grid" aria-label="Datos principales">
          {effectiveArea ? (
            <span className="property-card-spec">
              <Ruler size={15} aria-hidden="true" />
              <strong>{formatArea(Math.round(effectiveArea))}</strong>
              <small>{type === 'terreno' ? t('property.lotSurface') : t('property.totalArea')}</small>
            </span>
          ) : null}
          {totalLots != null ? (
            <span className="property-card-spec">
              <Layers size={15} aria-hidden="true" />
              <strong>{totalLots}</strong>
              <small>{t('property.totalLots')}</small>
            </span>
          ) : null}
          {availableLots != null ? (
            <span className="property-card-spec">
              <CheckCircle2 size={15} aria-hidden="true" />
              <strong>{availableLots}</strong>
              <small>{t('property.availableLots')}</small>
            </span>
          ) : null}
          {bedrooms ? (
            <span className="property-card-spec">
              <Layers size={15} aria-hidden="true" />
              <strong>{bedrooms}</strong>
              <small>{t('property.bedrooms')}</small>
            </span>
          ) : null}
        </div>

        <div className="property-card-footer">
          <div className="property-card-flat-price">
            {formatPropertyPrice(price, currency, {
              priceFrom: shouldShowPriceFrom({ priceFrom, type, currency }),
              locale,
              priceType,
            })}
          </div>
          <Link className="property-card-detail-link" href={propertyHref}>
            <span>{t('property.viewDetails')}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
