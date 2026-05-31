import PropertyCatalog, { type CatalogPagination } from '@/components/properties/PropertyCatalog';
import FaqStructuredData from '@/components/seo/FaqStructuredData';
import RentalsEmptyLanding from '@/components/seo/RentalsEmptyLanding';
import SeoServiceLandingSections from '@/components/seo/SeoServiceLandingSections';
import StaticPageContent from '@/components/site/StaticPageContent';
import type { SeoLandingPageConfig } from '@/config/seo-pages';
import type { StaticPageView } from '@/features/site-content/static-page';
import type { CatalogFilterState } from '@/features/properties/property-filtering';
import type { PropertyCard } from '@/types/property';

interface Props {
  config: SeoLandingPageConfig;
  properties: PropertyCard[];
  zoneOptions: string[];
  initialFilters: CatalogFilterState;
  pagination: CatalogPagination;
  cmsPage?: StaticPageView | null;
}

export default function SeoCatalogLanding({
  config,
  properties,
  zoneOptions,
  initialFilters,
  pagination,
  cmsPage,
}: Props) {
  const showCatalog = config.showCatalog !== false;
  const isRentalsPage = config.filters.priceType === 'arriendo';
  const hasRentalInventory = pagination.total > 0;
  const showRentalsEmptyLanding = showCatalog && isRentalsPage && !hasRentalInventory;
  const title = cmsPage?.title ?? config.title;
  const description = config.description;

  return (
    <section className="section container">
      <div style={{ 
        marginBottom: 'var(--space-2xl)'
      }}>
        <div>
          <span style={{ 
            display: 'block',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-sm)',
          }}>
            {config.eyebrow}
          </span>
          <h1 className="heading-2 heading-display" style={{ marginBottom: 'var(--space-md)' }}>
            {title}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '760px' }}>
            {description}
          </p>
        </div>
      </div>

      {cmsPage?.content ? (
        <div style={{ maxWidth: '860px', margin: '0 0 var(--space-3xl)' }}>
          <StaticPageContent content={cmsPage.content} />
        </div>
      ) : null}

      {showRentalsEmptyLanding ? (
        <RentalsEmptyLanding contactHref={config.secondaryCta.href} />
      ) : showCatalog ? (
        <PropertyCatalog
          properties={properties}
          zoneOptions={zoneOptions}
          initialFilters={initialFilters}
          pagination={pagination}
          showPriceModeTabs={isRentalsPage}
          catalogPriceMode={isRentalsPage ? 'arriendo' : 'venta'}
        />
      ) : (
        <SeoServiceLandingSections config={config} />
      )}

      <FaqStructuredData faqs={config.faqs} />

      <section style={{ marginTop: 'var(--space-4xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {config.faqs.map((faq) => (
            <details 
              key={faq.question}
              style={{
                borderBottom: '1px solid var(--color-border-light)',
                paddingBottom: 'var(--space-sm)',
              }}
            >
              <summary style={{ 
                fontSize: '1rem', 
                fontWeight: 800, 
                cursor: 'pointer',
                color: 'var(--color-dark)',
                padding: 'var(--space-sm) 0',
              }}>
                {faq.question}
              </summary>
              <p className="text-muted" style={{ margin: 0, paddingBottom: 'var(--space-sm)', lineHeight: 1.7 }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
