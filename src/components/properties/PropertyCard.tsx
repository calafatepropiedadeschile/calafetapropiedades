'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Ruler, Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { PropertyCard as PropertyCardType } from '@/types/property';
import { useExchangeRates } from '@/lib/currency/ExchangeRatesProvider';
import { formatArea } from '@/lib/utils/formatters';
import { shouldShowPriceFrom } from '@/features/properties/property-land-options';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizedHref } from '@/lib/i18n/localized-href';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
const PROPERTY_CARD_INFO_REVEAL_MS = 300;

interface Props {
  property: PropertyCardType;
}

const PROPERTY_TYPE_KEYS = {
  casa: 'property.house',
  terreno: 'property.lot',
} as const;

export default function PropertyCard({ property }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [infoRevealed, setInfoRevealed] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { locale, t } = useI18n();
  const { formatPropertyPriceForUser } = useExchangeRates();
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
  
  const propertyHref = localizedHref(`/propiedades/${slug}`, locale);
  const showCardInfo = infoRevealed || prefersReducedMotion;
  const effectiveArea = lotSurfaceM2 ?? area;
  const statusLabel = status === 'disponible'
    ? t('property.available')
    : priceType === 'arriendo'
      ? t('property.rented')
      : t('property.sold');

  useEffect(() => {
    if (prefersReducedMotion) return;

    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        revealTimerRef.current = setTimeout(() => {
          setInfoRevealed(true);
        }, PROPERTY_CARD_INFO_REVEAL_MS);
      },
      { threshold: 0.3, rootMargin: '0px 0px -5% 0px' },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <article ref={cardRef} className={`property-card-modern${isClosed ? ' is-closed' : ''}`}>
      {/* Background Image */}
      <div className="property-card-image-bg">
        <Image
          src={coverImage || fallbackImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={68}
          loading="lazy"
        />
      </div>

      {/* Top Floating Badges */}
      <div className="property-card-badges-top">
        <span className="badge-pill">
          <Home size={14} />
          {t(PROPERTY_TYPE_KEYS[type])}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`property-card-state ${status === 'disponible' ? 'is-available' : 'is-sold'}`}>
            {statusLabel}
          </span>
          {/* Toggle Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsClosed(!isClosed);
            }}
            className="property-card-toggle-btn"
            aria-label={isClosed ? "Mostrar detalles" : "Ocultar detalles"}
          >
            {isClosed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Floating Content Card */}
      <div className={`property-card-floating-content${showCardInfo ? ' is-revealed' : ''}`}>
        <h3 className="property-card-title">
          <Link href={propertyHref}>{title}</Link>
        </h3>

        <p className="property-card-location">
          {zone}, {city}
        </p>

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

        <div className="property-card-price">
          {formatPropertyPriceForUser(price, currency, {
            priceFrom: shouldShowPriceFrom({ priceFrom, type, currency }),
            priceType,
          })}
        </div>

        <Link href={propertyHref} className="btn btn-outline btn-sm property-card-cta" tabIndex={-1}>
          {t('property.viewDetails')}
        </Link>
      </div>
    </article>
  );
}
