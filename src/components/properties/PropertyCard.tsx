'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PropertyCard as PropertyCardType } from '@/types/property';
import { formatPrice } from '@/lib/utils/formatters';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Props {
  property: PropertyCardType;
}

const PROPERTY_TYPE_KEYS = {
  casa: 'property.house',
  apartamento: 'property.apartment',
  local: 'property.retail',
  oficina: 'property.office',
  terreno: 'property.lot',
} as const;

const PROPERTY_STATUS_KEYS = {
  disponible: 'property.available',
  vendido: 'property.sold',
  alquilado: 'property.rented',
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
    priceType,
    status
  } = property;
  const fallbackImage = getSiteImageUrl(
    'site/property-fallback.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
  );
  const propertyHref = locale === 'en' ? `/propiedades/${slug}?lang=en` : `/propiedades/${slug}`;

  return (
    <article className="property-card-flat">
      <div className="property-card-flat-image-wrapper">
        <Link href={propertyHref} aria-label={`${t('property.viewDetails')}: ${title}`} style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <Image
            src={coverImage || fallbackImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </Link>
        {status !== 'disponible' && (
          <div className="property-card-status-badge">
            {t(PROPERTY_STATUS_KEYS[status])}
          </div>
        )}
      </div>
      
      <div className="property-card-flat-content">
        <h3 className="property-card-flat-title">
          <Link href={propertyHref}>{title}</Link>
        </h3>
        
        <div className="property-card-flat-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', color: 'var(--color-primary)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>{zone}, {city}</span>
        </div>

        <p className="property-card-flat-tagline">
          {bedrooms ? `${bedrooms} ${t('property.bedroomsShort')} • ` : ''}
          {type ? `${t(PROPERTY_TYPE_KEYS[type])}` : ''}
          {area ? ` • ${Math.round(area)}m²` : ''}
        </p>
        
        <div className="property-card-flat-price">
          {formatPrice(price, currency)}
          {priceType === 'alquiler' && <span className="price-period-flat"> / {t('property.periodMonth')}</span>}
        </div>
      </div>
    </article>
  );
}
