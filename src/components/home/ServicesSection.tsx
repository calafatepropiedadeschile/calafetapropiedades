'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { buildMailto, siteConfig } from '@/config/site';
import { localizedNavHref } from '@/lib/i18n/localized-href';
import CtaBanner from '@/components/ui/CtaBanner';

const SERVICES: Array<{
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  iconType: 'buy' | 'sell' | 'invest' | 'marketing' | 'advisory' | 'international';
  href: string;
}> = [
  {
    titleKey: 'home.serviceBuyTitle',
    descriptionKey: 'home.serviceBuyDescription',
    iconType: 'buy',
    href: '/comprar',
  },
  {
    titleKey: 'home.serviceInvestTitle',
    descriptionKey: 'home.serviceInvestDescription',
    iconType: 'invest',
    href: '/proyectos',
  },
  {
    titleKey: 'home.serviceSellTitle',
    descriptionKey: 'home.serviceSellDescription',
    iconType: 'sell',
    href: '/vender',
  },
  {
    titleKey: 'home.serviceAdvisoryTitle',
    descriptionKey: 'home.serviceAdvisoryDescription',
    iconType: 'advisory',
    href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.advisorySubject),
  },
  {
    titleKey: 'home.serviceMarketingTitle',
    descriptionKey: 'home.serviceMarketingDescription',
    iconType: 'marketing',
    href: '/contacto',
  },
  {
    titleKey: 'home.serviceInternationalTitle',
    descriptionKey: 'home.serviceInternationalDescription',
    iconType: 'international',
    href: '/topografia',
  },
];

function ServiceIcon({ type }: { type: string }) {
  const className = 'service-card-icon-svg';

  if (type === 'buy') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    );
  }
  if (type === 'sell') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'invest') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'marketing') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'advisory') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicesSection() {
  const { locale, t } = useI18n();
  const advisoryHref = buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.advisorySubject);

  return (
    <section className="section services-section" aria-labelledby="services-section-title">
      <div className="container">
        <div className="services-header">
          <span className="section-eyebrow">{t('home.servicesEyebrow')}</span>
          <div className="services-header-grid">
            <h2 id="services-section-title" className="heading-2 services-title">
              {t('home.servicesTitle')}
            </h2>
            <p className="text-muted services-subtitle">
              {t('home.servicesSubtitle')}
            </p>
          </div>
        </div>

        <ul className="services-card-grid" role="list">
          {SERVICES.map((service) => (
            <li key={service.titleKey} className="service-card" role="listitem">
              <div className="service-card-icon-badge" aria-hidden>
                <ServiceIcon type={service.iconType} />
              </div>
              <h3 className="service-card-title">{t(service.titleKey)}</h3>
              <p className="service-card-description">{t(service.descriptionKey)}</p>
              <Link
                href={localizedNavHref(service.href, locale)}
                className="service-card-link"
              >
                {t('home.servicesCtaButton')} &rarr;
              </Link>
            </li>
          ))}
        </ul>

        <div className="services-bottom-cta">
          <CtaBanner
            variant="subtle"
            headline={t('home.servicesCtaTitle')}
            sub={t('home.servicesCtaDescription')}
            ctas={[
              { label: t('home.servicesCtaButton'), href: advisoryHref, primary: true },
              { label: t('home.ctaAvailabilitySecondary'), href: localizedNavHref('/contacto', locale) },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
