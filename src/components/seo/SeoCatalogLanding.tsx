import Link from 'next/link';
import PropertyCatalog, { type CatalogPagination } from '@/components/properties/PropertyCatalog';
import RentalsEmptyLanding from '@/components/seo/RentalsEmptyLanding';
import CtaBanner from '@/components/ui/CtaBanner';
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
  const description = cmsPage?.seoDescription ?? config.description;

  return (
    <section className="section container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'var(--space-3xl)',
        alignItems: 'start',
        marginBottom: 'var(--space-3xl)',
      }}>
        <div>
          <span style={{
            display: 'block',
            color: 'var(--color-primary)',
            fontSize: '0.78rem',
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
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-xl)' }}>
            <Link href={config.primaryCta.href} className="btn btn-primary">
              {config.primaryCta.label}
            </Link>
            <Link href={config.secondaryCta.href} className="btn btn-outline">
              {config.secondaryCta.label}
            </Link>
          </div>
        </div>

        <aside style={{
          borderLeft: '3px solid var(--color-primary)',
          paddingLeft: 'var(--space-lg)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
            Información clave
          </h2>
          <ul style={{ display: 'grid', gap: 'var(--space-sm)', margin: 0, paddingLeft: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
            {config.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </aside>
      </div>

      {cmsPage?.content ? (
        <div style={{ maxWidth: '860px', margin: '0 0 var(--space-3xl)' }}>
          <StaticPageContent content={cmsPage.content} />
        </div>
      ) : null}

      {showRentalsEmptyLanding ? (
        <RentalsEmptyLanding contactHref={config.secondaryCta.href} />
      ) : showCatalog ? (
        <>
          <CtaBanner
            variant="inline"
            eyebrow="Encuentra tu propiedad"
            headline={`${config.primaryCta.label} — revisa el catálogo actualizado.`}
            sub="Filtra por zona, precio y tipo. Si no encuentras lo que buscas, te asesoramos sin costo."
            ctas={[
              { label: config.primaryCta.label, href: config.primaryCta.href, primary: true },
              { label: 'Consultar disponibilidad', href: '/contacto' },
            ]}
            id="cta-seo-catalogo"
          />

          <PropertyCatalog
            key={JSON.stringify(initialFilters)}
            properties={properties}
            zoneOptions={zoneOptions}
            initialFilters={initialFilters}
            pagination={pagination}
            showPriceModeTabs={isRentalsPage}
            catalogPriceMode={isRentalsPage ? 'arriendo' : 'venta'}
          />
        </>
      ) : (
        <CtaBanner
          variant="inline"
          eyebrow="Consulta comercial"
          headline="Coordinamos arriendos según disponibilidad actual."
          sub="El equipo comercial puede indicarte opciones vigentes, condiciones y zonas. Escríbenos para recibir asesoría."
          ctas={[
            { label: config.primaryCta.label, href: config.primaryCta.href, primary: true },
            { label: config.secondaryCta.label, href: config.secondaryCta.href },
          ]}
          id="cta-seo-arriendos"
        />
      )}

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
