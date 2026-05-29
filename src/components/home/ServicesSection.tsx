'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { buildMailto, siteConfig } from '@/config/site';

const SERVICES = [
  {
    titleKey: 'home.serviceBuyTitle' as TranslationKey,
    descriptionKey: 'home.serviceBuyDescription' as TranslationKey,
    index: '01',
    iconType: 'buy',
  },
  {
    titleKey: 'home.serviceSellTitle' as TranslationKey,
    descriptionKey: 'home.serviceSellDescription' as TranslationKey,
    index: '02',
    iconType: 'sell',
  },
  {
    titleKey: 'home.serviceInvestTitle' as TranslationKey,
    descriptionKey: 'home.serviceInvestDescription' as TranslationKey,
    index: '03',
    iconType: 'invest',
  },
  {
    titleKey: 'home.serviceMarketingTitle' as TranslationKey,
    descriptionKey: 'home.serviceMarketingDescription' as TranslationKey,
    index: '04',
    iconType: 'marketing',
  },
  {
    titleKey: 'home.serviceAdvisoryTitle' as TranslationKey,
    descriptionKey: 'home.serviceAdvisoryDescription' as TranslationKey,
    index: '05',
    iconType: 'advisory',
  },
  {
    titleKey: 'home.serviceInternationalTitle' as TranslationKey,
    descriptionKey: 'home.serviceInternationalDescription' as TranslationKey,
    index: '06',
    iconType: 'international',
  },
];

function ServiceIcon({ type, className = "service-icon" }: { type: string; className?: string }) {
  if (type === 'buy') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <circle cx="12" cy="13" r="3" />
        <path d="m14 15 2.5 2.5" />
      </svg>
    );
  }
  if (type === 'sell') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'invest') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3" />
        <path d="M15 8h3.7V11.7" />
      </svg>
    );
  }
  if (type === 'marketing') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  if (type === 'advisory') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="8" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="16" cy="10" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function ServicesSection() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Active service details
  const activeService = SERVICES[activeIndex];
  const advisoryHref = buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.advisorySubject);

  // Handle scroll on mobile carousel to update active index for dots
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.clientWidth;
    if (itemWidth > 0) {
      const index = Math.round(scrollLeft / itemWidth);
      if (index >= 0 && index < SERVICES.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  // Scroll mobile carousel to index when a dot is clicked
  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    if (carouselRef.current) {
      const container = carouselRef.current;
      const itemWidth = container.clientWidth;
      container.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="section services-section">
      <div className="container">
        {/* Header section identical to original structure for SEO & branding */}
        <div className="services-header">
          <span className="section-eyebrow">{t('home.servicesEyebrow')}</span>
          <div className="services-header-grid">
            <h2 className="heading-2 services-title">
              {t('home.servicesTitle')}
            </h2>
            <p className="text-muted services-subtitle">
              {t('home.servicesSubtitle')}
            </p>
          </div>
        </div>

        {/* Desktop interactive tabs layout */}
        <div className="services-desktop-layout">
          <div className="services-sidebar-tabs">
            {SERVICES.map((service, idx) => (
              <button
                key={service.index}
                className={`service-tab-item ${idx === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
              >
                <span className="service-tab-num">{service.index}</span>
                <span className="service-tab-title">{t(service.titleKey)}</span>
                <svg className="service-tab-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="services-showcase-container">
            <div className="services-showcase-card animate-fade-in" key={activeIndex}>
              <div className="showcase-card-header">
                <span className="showcase-index">{activeService.index}</span>
                <div className="showcase-icon-badge">
                  <ServiceIcon type={activeService.iconType} className="showcase-icon-svg" />
                </div>
              </div>
              <h3 className="showcase-title">{t(activeService.titleKey)}</h3>
              <p className="showcase-description">{t(activeService.descriptionKey)}</p>
              
              <div className="showcase-footer">
                <Link 
                  href={advisoryHref}
                  className="showcase-cta-link"
                >
                  <span>{t('home.servicesCtaButton')}</span>
                  <svg className="showcase-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Carousel with snap scrolling */}
        <div className="services-mobile-layout">
          <div 
            className="services-mobile-carousel" 
            ref={carouselRef}
            onScroll={handleScroll}
          >
            {SERVICES.map((service) => (
              <div key={service.index} className="services-mobile-card">
                <div className="mobile-card-header">
                  <span className="mobile-card-num">{service.index}</span>
                  <div className="mobile-card-icon-badge">
                    <ServiceIcon type={service.iconType} className="mobile-card-icon-svg" />
                  </div>
                </div>
                <h3 className="mobile-card-title">{t(service.titleKey)}</h3>
                <p className="mobile-card-desc">{t(service.descriptionKey)}</p>
                <div className="mobile-card-footer">
                  <Link 
                    href={advisoryHref}
                    className="mobile-card-cta"
                  >
                    <span>{t('home.servicesCtaButton')}</span>
                    <svg className="mobile-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator dots for Mobile Swipe Carousel */}
          <div className="services-carousel-dots">
            {SERVICES.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => scrollToCard(idx)}
                aria-label={`Ir al servicio ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Call-To-Action remains identical to original for high conversion */}
        <div className="services-cta">
          <div>
            <h3>{t('home.servicesCtaTitle')}</h3>
            <p>{t('home.servicesCtaDescription')}</p>
          </div>
          <Link href={advisoryHref} className="btn btn-primary btn-lg">
            {t('home.servicesCtaButton')}
          </Link>
        </div>
      </div>
    </section>
  );
}
