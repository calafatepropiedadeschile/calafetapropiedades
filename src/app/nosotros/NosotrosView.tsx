'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Shield, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StaticPageContent from '@/components/site/StaticPageContent';
import CtaBanner from '@/components/ui/CtaBanner';
import type { StaticPageView } from '@/features/site-content/static-page';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizedHref } from '@/lib/i18n/localized-href';
import { useSiteSettings } from '@/features/site-content/SiteSettingsProvider';
import { siteConfig } from '@/config/site';

interface Props {
  cmsByLocale: {
    es: StaticPageView | null;
    en: StaticPageView | null;
  };
}

export default function NosotrosView({ cmsByLocale }: Props) {
  const { locale, t } = useI18n();
  const settings = useSiteSettings();
  const isEs = locale === 'es';
  const about = siteConfig.copy;
  const cmsPage = isEs ? cmsByLocale.es : cmsByLocale.en;
  const useCms = Boolean(cmsPage);

  const pillars = [
    {
      index: '01',
      title: isEs ? 'Cartera seleccionada' : 'Curated portfolio',
      text: isEs
        ? 'Presentamos propiedades con información clara, fotos cuidadas y datos útiles para decidir.'
        : 'We present properties with clear information, careful photos, and useful decision-making data.',
      icon: CheckCircle,
    },
    {
      index: '02',
      title: isEs ? 'Gestión transparente' : 'Transparent management',
      text: isEs
        ? 'Ordenamos consultas, visitas y seguimiento comercial desde el panel de administración.'
        : 'We organize inquiries, visits, and commercial follow-up from the admin panel.',
      icon: Shield,
    },
    {
      index: '03',
      title: isEs ? 'Atención directa' : 'Direct attention',
      text: isEs
        ? 'Centralizamos la comunicación para que cada interesado tenga una respuesta rápida y consistente.'
        : 'We centralize communication so every lead receives a fast and consistent response.',
      icon: MessageCircle,
    },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', backgroundColor: 'var(--color-surface-2)', minHeight: '100vh' }}>
        
        {/* HERO SECTION (Estilo Discover) */}
        <section className="section home-discover-section" style={{ borderTop: 'none' }}>
          <div className="container home-discover-grid">
            <div className="discover-image-wrapper">
              <Image
                src={settings.discoverImageUrl}
                alt="Calafate Propiedades Nosotros"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="home-discover-copy">
              {!useCms && (
                <span className="home-discover-eyebrow">
                  {isEs ? about.aboutEyebrow.es : about.aboutEyebrow.en}
                </span>
              )}
              <h1 className="heading-1" style={{ margin: '0 0 var(--space-xs)', color: 'var(--color-dark)', fontWeight: 800 }}>
                {useCms ? cmsPage!.title : siteConfig.name}
              </h1>
              <div className="home-discover-accent" aria-hidden />
              
              {useCms ? (
                <StaticPageContent content={cmsPage!.content} />
              ) : (
                <>
                  <p className="home-discover-text">{isEs ? about.aboutIntro.es : about.aboutIntro.en}</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* PILLARS SECTION (Estilo Services) */}
        {!useCms && (
          <section className="section services-section" aria-labelledby="pillars-section-title">
            <div className="container">
              <div className="services-header scroll-reveal">
                <span className="section-eyebrow">{isEs ? 'NUESTRO MODELO' : 'OUR MODEL'}</span>
                <div className="services-header-grid">
                  <h2 id="pillars-section-title" className="heading-2 services-title">
                    {isEs ? about.aboutModelTitle.es : about.aboutModelTitle.en}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {about.aboutModelParagraphs[isEs ? 'es' : 'en'].map((p, i) => (
                      <p key={i} className="text-muted services-subtitle" style={{ margin: 0, textAlign: 'left' }}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="services-card-grid" role="list">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <li key={pillar.index} className="service-card scroll-reveal" style={{ animationDelay: `${index * 80}ms` }} role="listitem">
                      <div className="service-card-icon-badge" aria-hidden>
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      <h3 className="service-card-title">{pillar.title}</h3>
                      <p className="service-card-description">{pillar.text}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* TEAM SECTION */}
        <section className="section trust-stats-section" style={{ backgroundColor: 'var(--color-surface-2)' }}>
          <div className="container">
            <div className="services-header scroll-reveal">
              <span className="section-eyebrow">{isEs ? 'CONTACTO Y GESTIÓN' : 'CONTACT AND MANAGEMENT'}</span>
              <div className="services-header-grid">
                <h2 className="heading-2 services-title">
                  {isEs ? 'Equipo de atención' : 'Advisory team'}
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-2xl)' }}>
              {siteConfig.offices.map((office) => (
                <div key={office.id} style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-2xl)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-xs)' }}>
                      {isEs ? office.country.es : office.country.en}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-admin)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-dark)', margin: '0 0 4px' }}>
                      {office.contactName}
                    </h3>
                    <p style={{ color: 'var(--color-text-subtle)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      {isEs ? office.role.es : office.role.en}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border-light)' }}>
                    <a href={`mailto:${office.email}`} style={{ color: 'var(--color-text)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="contact-link">
                      <MessageCircle size={16} /> {office.email}
                    </a>
                    <a href={office.phoneHref} style={{ color: 'var(--color-text)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="contact-link">
                      <span style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>+</span> {office.phoneLabel}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <CtaBanner
          variant="subtle"
          eyebrow={t('home.ctaAvailabilityEyebrow')}
          headline={t('home.ctaAvailabilityHeadline')}
          sub={t('home.ctaAvailabilitySub')}
          ctas={[
            { label: t('home.ctaAvailabilityPrimary'), href: localizedHref('/proyectos', locale), primary: true },
            { label: t('home.ctaAvailabilitySecondary'), href: localizedHref('/contacto', locale) },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
