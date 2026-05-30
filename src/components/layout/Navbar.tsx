'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { LANGUAGE_OPTIONS, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { siteConfig } from '@/config/site';
import { useRentalsNav } from '@/components/layout/RentalsNavProvider';

export default function Navbar() {
  const { showRentalsLink } = useRentalsNav();
  const [scrolled, setScrolled] = useState(false);
  const [showLangPopover, setShowLangPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const popoverRef = useRef<HTMLDivElement>(null);
  type NavItem = {
    href: string;
    label: string;
    subItems?: { href: string; label: string }[];
  };

  const navItems: NavItem[] = [
    { 
      href: '/comprar', 
      label: t('nav.buy'),
      subItems: [
        { href: '/comprar?type=casa', label: t('property.house') },
        { href: '/comprar?type=terreno', label: t('property.lot') },
      ]
    },
    ...(showRentalsLink ? [{ 
      href: '/arriendos', 
      label: t('nav.rent'),
      subItems: [
        { href: '/arriendos?type=casa', label: t('property.house') },
        { href: '/arriendos?type=terreno', label: t('property.lot') },
      ]
    }] : []),
    { 
      href: '/proyectos', 
      label: t('nav.projects'),
      subItems: [
        { href: '/proyectos?type=terreno', label: 'Parcelas y Loteos' },
        { href: '/proyectos?type=casa', label: 'Casas con Terreno' },
      ]
    },
    { href: '/vender', label: t('nav.sell') },
    { href: '/topografia', label: t('nav.topography') },
  ];

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
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
          {/* Left section: Hamburger (mobile) / Desktop Links */}
          <div className="nav-left">
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

            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.label} className={item.subItems ? 'has-dropdown' : ''}>
                  <Link href={item.href} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                    {item.subItems && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, opacity: 0.7 }}><path d="m6 9 6 6 6-6"/></svg>
                    )}
                  </Link>
                  {item.subItems && (
                    <div className="nav-dropdown">
                      <ul className="nav-dropdown-menu">
                        {item.subItems.map((sub) => (
                          <li key={sub.label}>
                            <Link href={sub.href} className="nav-dropdown-link" onClick={() => setMobileMenuOpen(false)}>
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Center section: Logo */}
          <div className="nav-center">
            <Link 
              href="/" 
              className="nav-logo-link" 
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
              style={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}
            >
              <Image 
                src="/brand/calafate-logo.png" 
                alt={siteConfig.name} 
                width={176}
                height={39}
                className="nav-logo-image"
                priority
              />
            </Link>
          </div>

          {/* Right section: Contact, Language Popover, Sign In button */}
          <div className="nav-right">
            <Link href="/contacto" className="nav-link nav-contact-desktop">{t('nav.contact')}</Link>

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

            <Link href="/admin" className="nav-signin-btn">
              {t('nav.signIn')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contacto" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.contact')}
            </Link>
          </li>
          <li>
            <Link href="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.signIn')}
            </Link>
          </li>
        </ul>
        <div className="mobile-nav-footer">
          <div className="mobile-locale-group" aria-label={t('nav.localeDialog')}>
            <span className="mobile-locale-label">{t('nav.localeDialog')}</span>
            <div className="mobile-locale-actions">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`mobile-locale-btn ${locale === option.value ? 'active' : ''}`}
                  onClick={() => toggleLang(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

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
    </>
  );
}
