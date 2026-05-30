import Link from 'next/link';
import PropertyCatalog from '@/components/properties/PropertyCatalog';
import CtaBanner from '@/components/ui/CtaBanner';
import type { SeoLandingPageConfig } from '@/config/seo-pages';
import type { PropertyCard } from '@/types/property';

interface Props {
  config: SeoLandingPageConfig;
  properties: PropertyCard[];
}

export default function SeoCatalogLanding({ config, properties }: Props) {
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
            {config.title}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '760px' }}>
            {config.description}
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
            Informacion clave
          </h2>
          <ul style={{ display: 'grid', gap: 'var(--space-sm)', margin: 0, paddingLeft: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
            {config.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </aside>
      </div>

      {/* CTA 3: Pre-catálogo — refuerza la intención de búsqueda del usuario SEO */}
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
        properties={properties}
        initialFilters={{
          query: '',
          type: config.filters.type ?? '',
          priceType: config.filters.priceType ?? '',
          marketRegion: config.filters.marketRegion ?? '',
          country: config.filters.country ?? '',
          zone: config.filters.zone ?? '',
        }}
        showPriceModeTabs={false}
      />

      <section style={{ marginTop: 'var(--space-4xl)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {config.faqs.map((faq) => (
            <article key={faq.question}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>{faq.question}</h3>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.7 }}>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
