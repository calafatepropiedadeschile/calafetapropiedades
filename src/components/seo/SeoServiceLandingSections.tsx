import Link from 'next/link';
import CtaBanner from '@/components/ui/CtaBanner';
import type { SeoLandingPageConfig } from '@/config/seo-pages';

interface Props {
  config: SeoLandingPageConfig;
}

export default function SeoServiceLandingSections({ config }: Props) {
  const banner = config.ctaBanner ?? {
    eyebrow: config.eyebrow,
    headline: config.title,
    sub: config.description,
  };

  return (
    <div className="seo-service-landing">
      <div className="seo-service-landing__hero-ctas">
        <Link href={config.primaryCta.href} className="btn btn-primary">
          {config.primaryCta.label}
        </Link>
        <Link href={config.secondaryCta.href} className="btn btn-outline">
          {config.secondaryCta.label}
        </Link>
      </div>

      {config.highlights.length > 0 && (
        <section className="seo-service-landing__block" aria-labelledby="seo-service-highlights-title">
          <h2 id="seo-service-highlights-title" className="seo-service-landing__heading">
            {config.highlightsTitle ?? 'Por qué trabajar con nosotros'}
          </h2>
          <ul className="seo-service-highlights">
            {config.highlights.map((item) => (
              <li key={item} className="seo-service-highlights__item">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {config.serviceSections?.map((section) => (
        <section
          key={section.title}
          className="seo-service-landing__block"
          aria-labelledby={`seo-service-section-${section.title}`}
        >
          <h2 id={`seo-service-section-${section.title}`} className="seo-service-landing__heading">
            {section.title}
          </h2>
          <ul className="seo-service-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <CtaBanner
        variant="inline"
        eyebrow={banner.eyebrow}
        headline={banner.headline}
        sub={banner.sub}
        ctas={[
          { label: config.primaryCta.label, href: config.primaryCta.href, primary: true },
          { label: config.secondaryCta.label, href: config.secondaryCta.href },
        ]}
        id="cta-seo-service"
      />

      {config.relatedCatalog ? (
        <aside className="seo-service-related" aria-labelledby="seo-service-related-title">
          <h2 id="seo-service-related-title" className="seo-service-landing__heading">
            {config.relatedCatalog.title}
          </h2>
          <p className="text-muted seo-service-related__description">
            {config.relatedCatalog.description}
          </p>
          <Link href={config.relatedCatalog.href} className="btn btn-outline">
            {config.relatedCatalog.linkLabel}
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
