'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function TrustStatsSection() {
  const { t } = useI18n();

  const reviewItems = [
    { step: '01', title: t('trust.step1Title'), description: t('trust.step1Description') },
    { step: '02', title: t('trust.step2Title'), description: t('trust.step2Description') },
    { step: '03', title: t('trust.step3Title'), description: t('trust.step3Description') },
    { step: '04', title: t('trust.step4Title'), description: t('trust.step4Description') },
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
            <Link href="/proyectos" className="btn btn-primary btn-lg">
              {t('trust.primaryCta')}
            </Link>
            <Link href="/contacto" className="btn btn-outline btn-lg">
              {t('trust.secondaryCta')}
            </Link>
          </div>
        </div>

        <div className="trust-stats-grid" aria-label={t('trust.gridLabel')}>
          {reviewItems.map((item, index) => (
            <div
              key={item.step}
              className="trust-stat-card scroll-reveal"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="trust-stat-number">{item.step}</span>
              <div>
                <h3 className="trust-stat-label">{item.title}</h3>
                <p className="trust-stat-sublabel">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="trust-stats-cta scroll-reveal" aria-label={t('trust.asideKicker')}>
          <span className="trust-stats-cta-kicker">{t('trust.asideKicker')}</span>
          <p className="trust-stats-cta-text">{t('trust.asideText')}</p>
        </aside>
      </div>
    </section>
  );
}
