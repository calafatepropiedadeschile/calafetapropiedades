import type { Property } from '@/types/property';
import PropertyExperienceSections from '@/components/properties/PropertyExperienceSections';
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

      <PropertyExperienceSections property={property} locale={locale} />

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



      {summary.hasCommercialTerms && (
        <section style={{ marginTop: 'var(--space-3xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
          <SectionTitle>{t('property.commercialTerms')}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {property.paymentTerms && (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px' }}>
                <span className="detail-spec-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary)' }}>{t('property.paymentTermsLabel')}</span>
                <div className="detail-spec-value" style={{ color: 'var(--color-dark)' }}>
                  {property.paymentTerms.split('\n').filter(t => t.trim()).length > 1 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      {property.paymentTerms.split('\n').filter(t => t.trim()).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <span>{property.paymentTerms}</span>
                  )}
                </div>
              </div>
            )}
            {property.availabilityNotes && (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px' }}>
                <span className="detail-spec-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary)' }}>{t('property.availabilityLabel')}</span>
                <div className="detail-spec-value" style={{ color: 'var(--color-dark)' }}>
                  {property.availabilityNotes.split('\n').filter(t => t.trim()).length > 1 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      {property.availabilityNotes.split('\n').filter(t => t.trim()).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <span>{property.availabilityNotes}</span>
                  )}
                </div>
              </div>
            )}
            {property.commercialNotes && (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px' }}>
                <span className="detail-spec-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-primary)' }}>{t('property.commercialNotesLabel')}</span>
                <div className="detail-spec-value" style={{ color: 'var(--color-dark)' }}>
                  {property.commercialNotes.split('\n').filter(t => t.trim()).length > 1 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      {property.commercialNotes.split('\n').filter(t => t.trim()).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <span>{property.commercialNotes}</span>
                  )}
                </div>
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
