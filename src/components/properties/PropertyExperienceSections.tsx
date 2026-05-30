import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import dynamic from 'next/dynamic';
import { isEmbeddableMapUrl } from '@/lib/maps/google-maps-embed';

const PropertyGoogleMapEmbed = dynamic(() => import('@/components/properties/PropertyGoogleMapEmbed'));
const PropertyMapClient = dynamic(() => import('@/components/properties/PropertyMapClient'));
const VirtualTour = dynamic(() => import('@/components/properties/VirtualTour'));

interface Props {
  property: Property;
  locale: Locale;
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

export default function PropertyExperienceSections({ property, locale }: Props) {
  const t = (key: TranslationKey) => translate(locale, key);
  const hasTour = Boolean(property.virtualTourUrl?.trim());
  const hasMapLink = isEmbeddableMapUrl(property.mapUrl);
  const hasCoordinates = property.latitude != null && property.longitude != null;

  if (!hasTour && !hasMapLink && !hasCoordinates) {
    return null;
  }

  return (
    <div className="property-experience-widgets">
      {hasTour && property.virtualTourUrl && (
        <SectionBlock
          title={t('property.virtualTourSection')}
          description={t('property.virtualTourSectionHint')}
        >
          <div className="property-widget-frame property-widget-frame--tour">
            <VirtualTour
              src={property.virtualTourUrl}
              title={`${t('property.virtualTourSection')} — ${property.title}`}
            />
          </div>
          <div className="property-widget-embed__footer">
            <Link
              href={property.virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              {t('property.viewTour360')}
            </Link>
          </div>
        </SectionBlock>
      )}

      {(hasMapLink || hasCoordinates) && (
        <SectionBlock
          title={t('property.mapSection')}
          description={t('property.mapSectionHint')}
        >
          {hasCoordinates && property.latitude != null && property.longitude != null && (
            <div className={hasMapLink ? 'property-widget-map-stack' : undefined}>
              <PropertyMapClient
                lat={property.latitude}
                lng={property.longitude}
                title={property.title}
              />
            </div>
          )}
          {hasMapLink && property.mapUrl && (
            <PropertyGoogleMapEmbed
              mapUrl={property.mapUrl}
              openLabel={t('property.viewOnMap')}
            />
          )}
        </SectionBlock>
      )}
    </div>
  );
}
