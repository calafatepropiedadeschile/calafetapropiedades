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
    <section className="trust-stats-section" aria-labelledby="trust-section-title">
      <div className="container trust-stats-inner">
        <div className="trust-stats-header scroll-reveal">
          <span className="trust-stats-eyebrow">{t('trust.eyebrow')}</span>
          <h2 id="trust-section-title" className="trust-stats-title">
            {t('trust.title')}
          </h2>
          <p className="trust-stats-subtitle">{t('trust.subtitle')}</p>
          <div className="trust-stats-cta-buttons">
            <Link href={localizedHref('/proyectos', locale)} className="btn btn-primary btn-lg">
              {t('trust.primaryCta')}
            </Link>
            <Link href={localizedHref('/contacto', locale)} className="btn btn-outline btn-lg">
              {t('trust.secondaryCta')}
            </Link>
          </div>
        </div>

        <div className="trust-stats-grid" aria-label={t('trust.gridLabel')}>
          {reviewItems.map((item, index) => {
            const Icon = STEP_ICONS[index] ?? MapPin;
            return (
              <article
                key={item.title}
                className="trust-stat-card scroll-reveal"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="trust-stat-icon" aria-hidden>
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="trust-stat-label">{item.title}</h3>
                <p className="trust-stat-sublabel">{item.description}</p>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
