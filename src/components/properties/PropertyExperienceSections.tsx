'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import dynamic from 'next/dynamic';
import type { ResolvedGoogleMapLink } from '@/lib/maps/google-maps-resolve';
import { hasExternalMapUrl } from '@/lib/maps/google-maps-embed';
import { getPropertyVirtualTourWatchPath } from '@/lib/seo/property-media-pages';

const PropertyGoogleMapEmbed = dynamic(() => import('@/components/properties/PropertyGoogleMapEmbed'), {
  ssr: false,
  loading: () => <div style={{ height: 300, background: '#f5f5f5', borderRadius: 12 }} className="skeleton-pulse" />,
});

interface Props {
  property: Property;
  locale: Locale;
  resolvedMap?: ResolvedGoogleMapLink | null;
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="property-widget-section">
      <h2 className="property-widget-section__title">{title}</h2>
      {description && (
        <p className="text-muted property-widget-section__description">{description}</p>
      )}
      {children}
    </section>
  );
}

export default function PropertyExperienceSections({
  property,
  locale,
  resolvedMap = null,
}: Props) {
  const t = (key: TranslationKey) => translate(locale, key);
  const tourUrl = property.virtualTourUrl?.trim() ?? '';
  const mapUrl = property.mapUrl?.trim() ?? '';
  const hasTour = Boolean(tourUrl);
  const hasMapLink = hasExternalMapUrl(mapUrl);

  const mapEmbedUrl = resolvedMap?.embedUrl ?? null;

  const mapFallbackHint = locale === 'en'
    ? 'We could not embed this map link. Open Google Maps for the exact location.'
    : 'No pudimos incrustar este enlace de mapa. Abre Google Maps para ver la ubicación exacta.';

  if (!hasTour && !hasMapLink) {
    return null;
  }

  return (
    <div className="property-experience-widgets">
      {hasTour && (
        <SectionBlock
          title={t('property.virtualTourSection')}
          description={t('property.virtualTourSectionHint')}
        >
          <div className="property-tour-cta">
            <p className="property-tour-cta__text">{t('property.virtualTourWatchTeaser')}</p>
            <div className="property-tour-cta__actions">
              <Link
                href={getPropertyVirtualTourWatchPath(property.slug)}
                className="btn btn-primary btn-sm"
              >
                {t('property.openVirtualTourWatchPage')}
              </Link>
              <Link
                href={tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                {t('property.viewTour360')}
              </Link>
            </div>
          </div>
        </SectionBlock>
      )}

      {hasMapLink && (
        <SectionBlock
          title={t('property.mapSection')}
          description={t('property.mapSectionHint')}
        >
          <PropertyGoogleMapEmbed
            mapUrl={mapUrl}
            embedSrc={mapEmbedUrl}
            openLabel={t('property.viewOnMap')}
            fallbackHint={mapFallbackHint}
          />
        </SectionBlock>
      )}
    </div>
  );
}
