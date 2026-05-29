'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PropertyCard as PropertyCardType } from '@/types/property';
import { formatPrice } from '@/lib/utils/formatters';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { siteConfig } from '@/config/site';

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

const PRICE_TYPE_KEYS = {
  venta: 'property.sale',
  alquiler: 'property.rent',
} as const;

export default function PropertyCard({ property }: Props) {
  const { locale, t } = useI18n();
  const {
    slug,
    title,
    price,
    currency,
    bedrooms,
    bathrooms,
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
    <article className="property-card">
      <div className="property-card-image-wrapper">
        <Link href={propertyHref} aria-label={`${t('property.viewDetails')}: ${title}`} style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <Image
            src={coverImage || fallbackImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </Link>
        {status !== 'disponible' ? (
          <div className="property-card-badge">
            {t(PROPERTY_STATUS_KEYS[status])}
          </div>
        ) : (
          <div className="property-card-badge" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
            {t(PRICE_TYPE_KEYS[priceType])}
          </div>
        )}
      </div>
      
      <div className="property-card-content">
        <div className="property-card-price">
          {formatPrice(price, currency)}
        </div>

        <p className="text-xs text-muted" style={{ fontWeight: 800, marginBottom: 'var(--space-xs)', textTransform: 'uppercase' }}>
          {t(PROPERTY_TYPE_KEYS[type])}
        </p>
        
        <div className="property-card-specs">
          {bedrooms && (
            <div className="property-card-spec">
              {bedrooms}<span>{t('property.bedroomsShort')}</span>
            </div>
          )}
          {bathrooms && (
            <div className="property-card-spec">
              {bathrooms}<span>{t('property.bathroomsShort')}</span>
            </div>
          )}
          {area && (
            <div className="property-card-spec">
              {Math.round(area)}<span>m²</span>
            </div>
          )}
        </div>
        
        <div className="property-card-address">
          {zone}
        </div>
        <div className="property-card-city">
          {city}
        </div>
      </div>

      <div className="property-card-footer">
        <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
          {siteConfig.name}
        </span>
        <Link href={propertyHref} className="btn btn-outline btn-sm" style={{ padding: '4px 12px' }}>
          {t('property.viewDetails')}
        </Link>
      </div>
    </article>
  );
}
