'use client';

import Link from 'next/link';
import Image from 'next/image';
import PropertySearch from '@/components/properties/PropertySearch';
import HomeFeaturedProperties from '@/components/home/HomeFeaturedProperties';
import MasterplanInteractiveSection from '@/components/home/MasterplanInteractiveSection';
import TrustStatsSection from '@/components/home/TrustStatsSection';
import ServicesSection from '@/components/home/ServicesSection';
import CtaBanner from '@/components/ui/CtaBanner';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { siteConfig } from '@/config/site';
import type { PropertyCard as PropertyCardType } from '@/types/property';

interface Props {
  featured: PropertyCardType[];
  propertyCatalog: PropertyCardType[];
  initialSearchType: 'terreno' | 'casa';
  initialSearchZone: string;
}

export default function HomePageContent({
  featured,
  propertyCatalog,
  initialSearchType,
  initialSearchZone,
}: Props) {
  const { t } = useI18n();

  const guideActions = [
    {
      title: t('home.actionBuyTitle'),
      description: t('home.actionBuyDescription'),
      href: '/proyectos',
      cta: t('home.actionBuyCta'),
    },
    {
      title: t('home.actionSellTitle'),
      description: t('home.actionSellDescription'),
      href: '/vender',
      cta: t('home.actionSellCta'),
    },
    {
      title: t('home.actionTopoTitle'),
      description: t('home.actionTopoDescription'),
      href: '/topografia',
      cta: t('home.actionTopoCta'),
    },
  ];

  return (
    <>
      <div className="home-search-overlay-container">
        <PropertySearch initialType={initialSearchType} initialZone={initialSearchZone} />
      </div>

      <section className="section container featured-properties-section">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 800, color: 'var(--color-dark)', lineHeight: '1.2', margin: '0 0 var(--space-xs)' }}>
            {t('home.featuredSectionTitle')}
          </h2>
          <p className="text-muted" style={{ maxWidth: '740px', margin: 'var(--space-xs) auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            {t('home.featuredSectionSubtitle')}
          </p>
        </div>

        {featured.length > 0 ? (
          <HomeFeaturedProperties properties={featured} />
        ) : (
          <div className="empty-state">
            <h3>{t('home.catalogEmptyTitle')}</h3>
            <p>{t('home.catalogEmptyCopy')}</p>
          </div>
        )}
      </section>

      <CtaBanner
        variant="subtle"
        eyebrow={t('home.ctaAvailabilityEyebrow')}
        headline={t('home.ctaAvailabilityHeadline')}
        sub={t('home.ctaAvailabilitySub')}
        ctas={[
          { label: t('home.ctaAvailabilityPrimary'), href: '/proyectos', primary: true },
          { label: t('home.ctaAvailabilitySecondary'), href: '/contacto' },
        ]}
        id="cta-catalogo"
      />

      <MasterplanInteractiveSection allProperties={propertyCatalog} />

      <TrustStatsSection />

      <section className="section container guide-section">
        <div className="guide-grid">
          {guideActions.map((action) => (
            <div key={action.href} className="guide-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{action.title}</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--space-lg)', flex: 1 }}>{action.description}</p>
              <Link href={action.href} className="btn btn-outline" style={{ width: 'fit-content' }}>{action.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <ServicesSection />

      <CtaBanner
        variant="dark"
        eyebrow={t('home.ctaAdvisoryEyebrow')}
        headline={t('home.ctaAdvisoryHeadline')}
        sub={t('home.ctaAdvisorySub')}
        ctas={[
          { label: t('home.ctaAdvisoryPrimary'), href: '/contacto', primary: true },
          { label: t('home.ctaAdvisorySecondary'), href: '/terrenos' },
        ]}
        id="cta-asesoria"
      />

      <section className="section" style={{ backgroundColor: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', padding: 'var(--space-4xl) 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 'var(--space-3xl)', alignItems: 'center' }}>
          <div style={{ position: 'relative', height: '480px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }} className="discover-image-wrapper">
            <Image
              src={siteConfig.copy.discover.imageUrl}
              alt={`${t('home.discoverImageAlt')} — ${siteConfig.name}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div>
              <span style={{
                color: 'var(--color-primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: 'var(--space-xs)',
              }}>
                {t('home.discoverEyebrow')}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--color-text)',
                fontWeight: 800,
                margin: 0,
                lineHeight: '1.2',
              }}>
                {t('home.discoverTitle')}
              </h2>
              <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-primary)', marginTop: 'var(--space-md)', borderRadius: '2px' }} />
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
              {t('home.discoverParagraph1')}
            </p>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0, fontWeight: 500 }}>
              {t('home.discoverParagraph2')}
            </p>

            <div style={{ marginTop: 'var(--space-sm)' }}>
              <Link href="/contacto" className="btn btn-primary btn-lg" style={{ width: 'fit-content' }}>
                {t('home.discoverCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
