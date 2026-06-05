import Link from 'next/link';
import PropertyCatalog, { type CatalogPagination } from '@/components/properties/PropertyCatalog';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import FaqStructuredData from '@/components/seo/FaqStructuredData';
import RentalsEmptyLanding from '@/components/seo/RentalsEmptyLanding';
import SeoCollectionStructuredData from '@/components/seo/SeoCollectionStructuredData';
import SeoSellLanding from '@/components/seo/SeoSellLanding';
import SeoServiceLandingSections from '@/components/seo/SeoServiceLandingSections';
import StaticPageContent from '@/components/site/StaticPageContent';
import type { SeoLandingFaq, SeoLandingPageConfig } from '@/config/seo-pages';
import type { StaticPageView } from '@/features/site-content/static-page';
import type { CatalogFilterState } from '@/features/properties/property-filtering';
import type { PropertyCard } from '@/types/property';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  config: SeoLandingPageConfig;
  properties: PropertyCard[];
  zoneOptions: string[];
  initialFilters: CatalogFilterState;
  pagination: CatalogPagination;
  cmsPage?: StaticPageView | null;
  locale?: Locale;
  canonicalBaseUrl?: string | null;
}

function SeoFaqAnswer({ faq }: { faq: SeoLandingFaq }) {
  return (
    <>
      <p className="text-muted" style={{ margin: 0, paddingBottom: faq.links?.length ? 'var(--space-sm)' : 'var(--space-sm)', lineHeight: 1.7 }}>
        {faq.answer}
      </p>
      {faq.links && faq.links.length > 0 ? (
        <p style={{ margin: 0, paddingBottom: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {faq.links.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
              {link.label}
            </Link>
          ))}
        </p>
      ) : null}
    </>
  );
}

export default function SeoCatalogLanding({
  config,
  properties,
  zoneOptions,
  initialFilters,
  pagination,
  cmsPage,
  locale = 'es',
  canonicalBaseUrl,
}: Props) {
  if (config.layout === 'sell') {
    return <SeoSellLanding config={config} cmsPage={cmsPage} locale={locale} />;
  }

  const showCatalog = config.showCatalog !== false;
  const isRentalsPage = config.filters.priceType === 'arriendo';
  const hasRentalInventory = pagination.total > 0;
  const showRentalsEmptyLanding = showCatalog && isRentalsPage && !hasRentalInventory;
  const title = cmsPage?.title ?? config.title;
  const description = config.description;
  const breadcrumbItems = [
    { name: locale === 'en' ? 'Home' : 'Inicio', path: '/' },
    ...(config.breadcrumbParent
      ? [{ name: config.breadcrumbParent.label, path: config.breadcrumbParent.href }]
      : []),
    { name: title, path: config.path },
  ];

  return (
    <section className="section container">
      <BreadcrumbStructuredData items={breadcrumbItems} baseUrl={canonicalBaseUrl} />
      <SeoCollectionStructuredData
        name={title}
        description={description}
        path={config.path}
        properties={properties}
        baseUrl={canonicalBaseUrl}
      />

      <nav className="seo-catalog-breadcrumb" aria-label={locale === 'en' ? 'Breadcrumb' : 'Ruta de navegación'}>
        <ol className="seo-catalog-breadcrumb__list">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.path} className="seo-catalog-breadcrumb__item">
                {isLast ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="seo-catalog-landing__hero">
        <div>
          <span className="seo-catalog-landing__eyebrow">{config.eyebrow}</span>
          <h1 className="heading-2 heading-display seo-catalog-landing__title">{title}</h1>
          <p className="text-muted seo-catalog-landing__description">{description}</p>
        </div>

        <div className="seo-service-landing__hero-ctas">
          <Link href={config.primaryCta.href} className="btn btn-primary">
            {config.primaryCta.label}
          </Link>
          <Link href={config.secondaryCta.href} className="btn btn-outline">
            {config.secondaryCta.label}
          </Link>
        </div>
      </div>

      {config.highlights.length > 0 ? (
        <section className="seo-service-landing__block seo-catalog-landing__highlights" aria-labelledby="seo-catalog-highlights-title">
          <h2 id="seo-catalog-highlights-title" className="seo-service-landing__heading">
            {config.highlightsTitle ?? (locale === 'en' ? 'Why work with us' : 'Por qué trabajar con nosotros')}
          </h2>
          <ul className="seo-service-highlights">
            {config.highlights.map((item) => (
              <li key={item} className="seo-service-highlights__item">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cmsPage?.content ? (
        <div className="seo-catalog-landing__cms">
          <StaticPageContent content={cmsPage.content} />
        </div>
      ) : null}

      {config.relatedPages && config.relatedPages.links.length > 0 ? (
        <section className="seo-catalog-related" aria-labelledby="seo-catalog-related-title">
          <h2 id="seo-catalog-related-title" className="seo-service-landing__heading">
            {config.relatedPages.title}
          </h2>
          <ul className="seo-catalog-related__grid">
            {config.relatedPages.links.map((link) => (
              <li key={link.href} className="seo-catalog-related__card">
                <Link href={link.href} className="seo-catalog-related__link">
                  <span className="seo-catalog-related__label">{link.label}</span>
                  {link.description ? (
                    <span className="seo-catalog-related__description">{link.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
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

      <section className="seo-catalog-faq" aria-labelledby="seo-catalog-faq-title">
        <h2 id="seo-catalog-faq-title" className="seo-service-landing__heading">
          {locale === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes'}
        </h2>
        <div className="seo-catalog-faq__list">
          {config.faqs.map((faq) => (
            <details key={faq.question} className="seo-catalog-faq__item">
              <summary className="seo-catalog-faq__question">{faq.question}</summary>
              <SeoFaqAnswer faq={faq} />
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
