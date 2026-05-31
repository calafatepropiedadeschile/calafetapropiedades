'use client';

import Link from 'next/link';
import { MapPin, ClipboardCheck, Compass, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizedHref } from '@/lib/i18n/localized-href';
import type { PropertyCard } from '@/types/property';

const STEP_ICONS = [MapPin, ClipboardCheck, Compass, MessageCircle] as const;


interface Props {
  properties: PropertyCard[];
}

export default function TrustStatsSection({ properties }: Props) {
  const { locale, t } = useI18n();

  const reviewItems = [
    { title: t('trust.step1Title'), description: t('trust.step1Description') },
    { title: t('trust.step2Title'), description: t('trust.step2Description') },
    { title: t('trust.step3Title'), description: t('trust.step3Description') },
    { title: t('trust.step4Title'), description: t('trust.step4Description') },
  ];

  return (
    <section className="section services-section" aria-labelledby="trust-section-title">
      <div className="container">
        <div className="services-header scroll-reveal">
          <span className="section-eyebrow">{t('trust.eyebrow')}</span>
          <div className="services-header-grid">
            <h2 id="trust-section-title" className="heading-2 services-title">
              {t('trust.title')}
            </h2>
            <p className="text-muted services-subtitle">{t('trust.subtitle')}</p>
          </div>
        </div>

        <ul className="services-card-grid" role="list" aria-label={t('trust.gridLabel')}>
          {reviewItems.map((item, index) => {
            const Icon = STEP_ICONS[index] ?? MapPin;
            return (
              <li
                key={item.title}
                className="service-card scroll-reveal"
                style={{ animationDelay: `${index * 80}ms` }}
                role="listitem"
              >
                <div className="service-card-icon-badge" aria-hidden>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="service-card-title">{item.title}</h3>
                <p className="service-card-description">{item.description}</p>
              </li>
            );
          })}
        </ul>



      </div>
    </section>
  );
}
