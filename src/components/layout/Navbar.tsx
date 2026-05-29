'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LANGUAGE_OPTIONS, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { buildMailto, siteConfig } from '@/config/site';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showLangPopover, setShowLangPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const ticking = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sellHref = buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowLangPopover(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function toggleLang(newLang: Locale) {
    setLocale(newLang);
    setShowLangPopover(false);
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner container">
          <a href={siteConfig.contact.primaryPhoneHref} className="nav-phone" aria-label={`Llamar a ${siteConfig.name}`}>
            {siteConfig.contact.primaryPhoneLabel}
          </a>
          <ul className="nav-links">
            <li><Link href="/propiedades?priceType=venta" className="nav-link">{t('nav.buy')}</Link></li>
            <li><Link href="/propiedades?priceType=alquiler" className="nav-link">{t('nav.rent')}</Link></li>
            <li><Link href="/propiedades?priceType=venta&marketRegion=mexico" className="nav-link">Preventas Mexico</Link></li>
            <li><Link href={sellHref} className="nav-link">{t('nav.sell')}</Link></li>
            <li><Link href="/propiedades" className="nav-link">{t('nav.properties')}</Link></li>
            <li><Link href="/contacto" className="nav-link">{t('nav.contact')}</Link></li>
          </ul>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
            <div className="social-links">
              <a href={siteConfig.contact.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={siteConfig.contact.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href={siteConfig.contact.social.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
              </a>
            </div>

            <div style={{ position: 'relative' }} ref={popoverRef}>
              <button
                className="globe-btn"
                onClick={() => setShowLangPopover(!showLangPopover)}
                aria-expanded={showLangPopover}
                aria-label={t('nav.localeDialog')}
                title={t('nav.localeDialog')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </button>

              {showLangPopover && (
                <div className="lang-popover animate-fade-in">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className="lang-row"
                      onClick={() => toggleLang(option.value)}
                    >
                      <span className="lang-label">{option.label}</span>
                      <label className="switch" aria-hidden="true">
                        <input type="checkbox" checked={locale === option.value} readOnly tabIndex={-1} />
                        <span className="slider"></span>
                      </label>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburguer Mobile Button */}
            <button
              className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <Link href="/propiedades?priceType=venta" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.buy')}
            </Link>
          </li>
          <li>
            <Link href="/propiedades?priceType=alquiler" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.rent')}
            </Link>
          </li>
          <li>
            <Link href="/propiedades?priceType=venta&marketRegion=mexico" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Preventas Mexico
            </Link>
          </li>
          <li>
            <Link href={sellHref} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.sell')}
            </Link>
          </li>
          <li>
            <Link href="/propiedades" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.properties')}
            </Link>
          </li>
          <li>
            <Link href="/contacto" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.contact')}
            </Link>
          </li>
        </ul>
        <div className="mobile-nav-footer">
          <div className="mobile-social-links">
            <a href={siteConfig.contact.social.instagram} target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href={siteConfig.contact.social.linkedin} target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="LinkedIn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href={siteConfig.contact.social.facebook} target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className={`secondary-logo-header ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="secondary-logo-inner container">
          <Link 
            href="/" 
            className="secondary-logo-link" 
            aria-label={siteConfig.name}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                const heroEl = document.getElementById('hero');
                if (heroEl) {
                  heroEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
          >
            <span className="secondary-logo-red">{siteConfig.logo.primary}</span>
            <span className="secondary-logo-dark">{siteConfig.logo.secondary}</span>
          </Link>
        </div>
      </div>
    </>
  );
}
