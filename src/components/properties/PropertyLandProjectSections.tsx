import Link from 'next/link';
import type { Property } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import { formatArea } from '@/lib/utils/formatters';
import {
  buildLandProjectHighlights,
  getLandProjectSummary,
} from '@/features/properties/property-land-project';
import {
  getLandFeatureLabel,
  isLandProject,
} from '@/features/properties/property-land-options';
import PropertyMapClient from '@/components/properties/PropertyMapClient';

interface Props {
  property: Property;
  locale: Locale;
  showProjectBadge?: boolean;
  /** Oculta la grilla superior cuando la ficha ya muestra PropertyCommercialHighlights */
  showTopHighlights?: boolean;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
      {children}
    </h2>
  );
}

export default function PropertyLandProjectSections({
  property,
  locale,
  showProjectBadge = true,
  showTopHighlights = true,
}: Props) {
  const t = (key: TranslationKey) => translate(locale, key);
  const summary = getLandProjectSummary(property);
  const highlights = buildLandProjectHighlights(property);

  if (!summary.isLand) return null;

  return (
    <>
      {showProjectBadge && isLandProject(property) && (
        <span className="badge" style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          marginBottom: 'var(--space-md)',
          display: 'inline-block',
        }}>
          {t('property.projectBadge')}
        </span>
      )}

      {(summary.hasTour || summary.hasMapLink) && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
          {property.virtualTourUrl && (
            <Link href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              {t('property.viewTour360')}
            </Link>
          )}
          {property.mapUrl && (
            <Link href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              {t('property.viewOnMap')}
            </Link>
          )}
        </div>
      )}

      {showTopHighlights && highlights.length > 0 && (
        <section style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="detail-specs-grid">
            {highlights.map((item) => (
              <div key={item.id} className="detail-spec-item">
                <span className="detail-spec-label">{t(item.labelKey)}</span>
                <span className="detail-spec-value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(summary.hasCoordinates || property.mapUrl) && (
        <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
          <SectionTitle>{t('property.location')}</SectionTitle>
          {summary.hasCoordinates && property.latitude != null && property.longitude != null && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <PropertyMapClient lat={property.latitude} lng={property.longitude} title={property.title} />
            </div>
          )}
          {property.mapUrl && (
            <Link href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              {t('property.viewOnMap')}
            </Link>
          )}
        </section>
      )}

      {summary.hasLandSpecs && (
        <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
          <SectionTitle>{t('property.landDetails')}</SectionTitle>
          <div className="detail-specs-grid">
            {property.lotSurfaceM2 && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.lotSurface')}</span>
                <span className="detail-spec-value">{formatArea(property.lotSurfaceM2)}</span>
              </div>
            )}
            {property.waterStatus && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.waterLabel')}</span>
                <span className="detail-spec-value">{property.waterStatus}</span>
              </div>
            )}
            {property.electricityStatus && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.electricityLabel')}</span>
                <span className="detail-spec-value">{property.electricityStatus}</span>
              </div>
            )}
            {property.roadType && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.roadLabel')}</span>
                <span className="detail-spec-value">{property.roadType}</span>
              </div>
            )}
            {property.accessType && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.accessLabel')}</span>
                <span className="detail-spec-value">{property.accessType}</span>
              </div>
            )}
            {property.hasOwnRol && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">Rol</span>
                <span className="detail-spec-value">Rol propio</span>
              </div>
            )}
            {property.services.length > 0 && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">{t('property.services')}</span>
                <span className="detail-spec-value">
                  {property.services.map((service, index) => (
                    <span key={service}>
                      {getLandFeatureLabel(service, 'service', t)}
                      {index < property.services.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          {property.amenities.length > 0 && (
            <div className="amenities-grid" style={{ marginTop: 'var(--space-lg)' }}>
              {property.amenities.map((amenity) => (
                <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.9375rem' }}>
                  <span style={{ color: 'var(--color-primary)' }}>+</span>
                  {getLandFeatureLabel(amenity, 'amenity', t)}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {summary.hasCommercialTerms && (
        <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
          <SectionTitle>{t('property.commercialTerms')}</SectionTitle>
          <div className="detail-specs-grid">
            {property.paymentTerms && (
              <div className="detail-spec-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-spec-label">{t('property.paymentTermsLabel')}</span>
                <span className="detail-spec-value" style={{ whiteSpace: 'pre-line' }}>{property.paymentTerms}</span>
              </div>
            )}
            {property.availabilityNotes && (
              <div className="detail-spec-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-spec-label">{t('property.availabilityLabel')}</span>
                <span className="detail-spec-value" style={{ whiteSpace: 'pre-line' }}>{property.availabilityNotes}</span>
              </div>
            )}
            {property.commercialNotes && (
              <div className="detail-spec-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-spec-label">{t('property.commercialNotesLabel')}</span>
                <span className="detail-spec-value" style={{ whiteSpace: 'pre-line' }}>{property.commercialNotes}</span>
              </div>
            )}
          </div>

          {property.distanceHighlights.length > 0 && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                {t('property.connectivity')}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
                {property.distanceHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  );
}
