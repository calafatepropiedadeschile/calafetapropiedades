'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import PropertySearch from '@/components/properties/PropertySearch';
import HomeFeaturedProperties from '@/components/home/HomeFeaturedProperties';

const MasterplanInteractiveSection = dynamic(
  () => import('@/components/home/MasterplanInteractiveSection'),
  { loading: () => <div className="masterplan-section-placeholder" aria-hidden /> },
);
import TrustStatsSection from '@/components/home/TrustStatsSection';
import ServicesSection from '@/components/home/ServicesSection';
import CtaBanner from '@/components/ui/CtaBanner';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizedHref } from '@/lib/i18n/localized-href';
import { useSiteSettings } from '@/features/site-content/SiteSettingsProvider';
import type { PropertyCard as PropertyCardType } from '@/types/property';

interface Props {
  featured: PropertyCardType[];
  propertyCatalog: PropertyCardType[];
  initialSearchType?: 'terreno' | 'casa';
  initialSearchZone?: string;
  zoneOptions?: string[];
}

export default function HomePageContent({
  featured,
  propertyCatalog,
  initialSearchType,
  initialSearchZone,
  zoneOptions = [],
}: Props) {
  const { locale, t } = useI18n();
  const settings = useSiteSettings();
  const isEn = locale === 'en';

  const discoverEyebrow = isEn ? settings.discoverEyebrowEn : settings.discoverEyebrow;
  const discoverTitle = isEn ? settings.discoverTitleEn : settings.discoverTitle;
  const discoverParagraph1 = isEn ? settings.discoverParagraph1En : settings.discoverParagraph1;
  const discoverParagraph2 = isEn ? settings.discoverParagraph2En : settings.discoverParagraph2;

  return (
    <>
      <div className="home-search-overlay-container">
        <PropertySearch 
          initialType={initialSearchType} 
          initialZone={initialSearchZone} 
          zoneOptions={zoneOptions}
        />
      </div>

      <section className="section container featured-properties-section">
        <header className="home-section-header">
          <h2 className="home-section-title">{t('home.featuredSectionTitle')}</h2>
          <p className="home-section-subtitle text-muted">{t('home.featuredSectionSubtitle')}</p>
        </header>

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
          { label: t('home.ctaAvailabilityPrimary'), href: localizedHref('/proyectos', locale), primary: true },
          { label: t('home.ctaAvailabilitySecondary'), href: localizedHref('/contacto', locale) },
        ]}
        id="cta-catalogo"
      />

      <MasterplanInteractiveSection allProperties={propertyCatalog} />

      <TrustStatsSection properties={propertyCatalog} />

      <ServicesSection />

      <section className="section home-discover-section">
        <div className="container home-discover-grid">
          <div className="discover-image-wrapper">
            <Image
              src={settings.discoverImageUrl}
              alt={`${t('home.discoverImageAlt')} — Calafate Propiedades`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="home-discover-copy">
            <span className="home-discover-eyebrow">{discoverEyebrow}</span>
            <h2 className="home-discover-title">{discoverTitle}</h2>
            <div className="home-discover-accent" aria-hidden />
            <p className="home-discover-text">{discoverParagraph1}</p>
            <p className="home-discover-text home-discover-text--emphasis">{discoverParagraph2}</p>
            <Link href={localizedHref('/contacto', locale)} className="btn btn-primary btn-lg">
              {t('home.discoverCta')}
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
