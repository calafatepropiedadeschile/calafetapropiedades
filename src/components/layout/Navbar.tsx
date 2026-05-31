'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, X, Home, Key, Map, DollarSign, Mountain, Info, MessageCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useExchangeRates } from '@/lib/currency/ExchangeRatesProvider';
import { formatMoney } from '@/lib/currency/format-money';
import { formatTranslation } from '@/lib/i18n/dictionaries';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, type Locale, type SupportedCurrency } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { buildMailto, siteConfig } from '@/config/site';
import { useRentalsNav } from '@/components/layout/RentalsNavProvider';
import { useSiteSettings } from '@/features/site-content/SiteSettingsProvider';

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: { href: string; label: string }[];
};

function NavSocialLinks({
  className = '',
  linkClassName = 'social-link',
}: {
  className?: string;
  linkClassName?: string;
}) {
  const { instagramUrl, facebookUrl, linkedinUrl } = useSiteSettings();

  const links = [
    {
      href: instagramUrl,
      label: 'Instagram',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      href: facebookUrl,
      label: 'Facebook',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
        </svg>
      ),
    },
    {
      href: linkedinUrl,
      label: 'LinkedIn',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.1c0-1.7-.03-3.88-2.37-3.88-2.37 0-2.73 1.85-2.73 3.76V24h-4V8z" />
        </svg>
      ),
    },
  ].filter((link) => Boolean(link.href));

  if (links.length === 0) return null;

  return (
    <div className={`social-links ${className}`.trim()}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

function NavMenuLinks({
  items,
  className,
  onItemClick,
}: {
  items: NavItem[];
  className: string;
  onItemClick?: () => void;
}) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href} className={item.subItems ? 'has-dropdown' : ''}>
          <Link href={item.href} className="nav-link" onClick={onItemClick}>
            {item.label}
            {item.subItems ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: 6, opacity: 0.7 }}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            ) : null}
          </Link>
          {item.subItems ? (
            <div className="nav-dropdown">
              <ul className="nav-dropdown-menu">
                {item.subItems.map((sub) => (
                  <li key={sub.href}>
                    <Link href={sub.href} className="nav-dropdown-link" onClick={onItemClick}>
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function Navbar() {
  const { showRentalsLink } = useRentalsNav();
  const { primaryPhone, primaryPhoneHref } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [showLangPopover, setShowLangPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, currency, setLocale, setCurrency, t } = useI18n();
  const { rates } = useExchangeRates();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const comprarItem = useMemo<NavItem>(() => ({
    href: '/comprar',
    label: t('nav.buy'),
    icon: <Home size={20} strokeWidth={1.5} />,
    subItems: [
      { href: '/comprar?type=casa', label: t('property.house') },
      { href: '/comprar?type=terreno', label: t('property.lot') },
    ],
  }), [t]);

  const arriendosItem = useMemo<NavItem>(() => ({
    href: '/arriendos',
    label: t('nav.rent'),
    icon: <Key size={20} strokeWidth={1.5} />,
    subItems: [
      { href: '/arriendos?type=casa', label: t('property.house') },
      { href: '/arriendos?type=terreno', label: t('property.lot') },
    ],
  }), [t]);

  const proyectosItem = useMemo<NavItem>(() => ({
    href: '/proyectos',
    label: t('nav.projects'),
    icon: <Map size={20} strokeWidth={1.5} />,
    subItems: [
      { href: '/proyectos?type=terreno', label: t('common.projectsLots') },
      { href: '/proyectos?type=casa', label: t('common.projectsHouses') },
    ],
  }), [t]);

  const venderItem = useMemo<NavItem>(() => ({
    href: '/vender',
    label: t('nav.sell'),
    icon: <DollarSign size={20} strokeWidth={1.5} />,
  }), [t]);

  const topografiaItem = useMemo<NavItem>(() => ({
    href: '/topografia',
    label: t('nav.topography'),
    icon: <Mountain size={20} strokeWidth={1.5} />,
  }), [t]);

  const contactoItem = useMemo<NavItem>(() => ({
    href: '/contacto',
    label: t('nav.contact'),
    icon: <MessageCircle size={20} strokeWidth={1.5} />,
  }), [t]);

  const nosotrosItem = useMemo<NavItem>(() => ({
    href: '/nosotros',
    label: t('nav.about'),
    icon: <Info size={20} strokeWidth={1.5} />,
  }), [t]);

  /** Siempre 3 ítems a la izquierda y 3 a la derecha del logo. */
  const navItems = useMemo<NavItem[]>(
    () => (showRentalsLink
      ? [proyectosItem, comprarItem, arriendosItem, venderItem, topografiaItem]
      : [proyectosItem, comprarItem, venderItem, topografiaItem]),
    [showRentalsLink, proyectosItem, comprarItem, arriendosItem, venderItem, topografiaItem],
  );

  const navItemsMobile = useMemo(
    () => [...navItems, nosotrosItem, contactoItem],
    [navItems, nosotrosItem, contactoItem],
  );

  const closeMobileMenu = () => setMobileMenuOpen(false);

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

  function selectCurrency(nextCurrency: SupportedCurrency) {
    setCurrency(nextCurrency);
    setShowLangPopover(false);
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-topbar">
          <div className="nav-topbar-inner container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav-topbar-left" style={{ display: 'flex', alignItems: 'center' }}>
              <a
                href={primaryPhoneHref}
                className="nav-topbar-link nav-topbar-phone"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                aria-label={formatTranslation(locale, 'nav.callAria', {
                  phone: primaryPhone,
                })}
              >
                <Phone size={14} aria-hidden />
                <span>{primaryPhone}</span>
              </a>
            </div>

            <div className="nav-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 0 }}>
                <NavSocialLinks linkClassName="nav-topbar-link" />
              </div>

              <Link href="/contacto" className="nav-topbar-link" style={{ marginLeft: 'var(--space-md)' }}>{t('nav.contact')}</Link>
            </div>
          </div>
        </div>
        <div className="nav-mainbar">
          <div className="nav-inner container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* 1. LOGO (Izquierda) */}
            <div className="nav-logo-container" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
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
              >
                <Image
                  src="/brand/calafate-logo.png"
                  alt={siteConfig.name}
                  width={176}
                  height={39}
                  className="nav-logo-image"
                  quality={70}
                />
              </Link>
            </div>

            {/* 2. CATÁLOGO PRINCIPAL (Centro) */}
            <div className="nav-menu-center" style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
              <NavMenuLinks
                items={navItems}
                className="nav-links"
                onItemClick={closeMobileMenu}
              />
            </div>

            {/* 3. UTILIDADES Y MOBILE (Derecha) */}
            <div className="nav-actions-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)' }}>
              
              {/* Separador visual sutil entre catálogo y utilidades en desktop */}
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-surface-2)', display: 'none' }} className="desktop-only-divider" />

              <div className="nav-lang-selector" ref={popoverRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowLangPopover(!showLangPopover)}
                  aria-expanded={showLangPopover}
                  aria-label={t('nav.localeDialog')}
                  title={t('nav.localeDialog')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#2b2b2b' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </button>

                {showLangPopover && (
                  <div className="lang-popover animate-fade-in" style={{ top: '100%', right: 0, marginTop: '8px', color: 'var(--color-dark)', position: 'absolute', background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, minWidth: '180px' }}>
                    <p className="lang-popover-section-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('common.language')}</p>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className="lang-row"
                        onClick={() => toggleLang(option.value)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <span className="lang-label" style={{ fontWeight: 500 }}>{option.label}</span>
                        <label className="switch" aria-hidden="true" style={{ pointerEvents: 'none' }}>
                          <input type="checkbox" checked={locale === option.value} readOnly tabIndex={-1} />
                          <span className="slider" />
                        </label>
                      </button>
                    ))}
                    <p className="lang-popover-section-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', marginTop: '16px' }}>{t('common.currency')}</p>
                    {CURRENCY_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className="lang-row"
                        onClick={() => selectCurrency(option.value)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <span className="lang-label" style={{ fontWeight: 500 }}>{option.label}</span>
                        <label className="switch" aria-hidden="true" style={{ pointerEvents: 'none' }}>
                          <input type="checkbox" checked={currency === option.value} readOnly tabIndex={-1} />
                          <span className="slider" />
                        </label>
                      </button>
                    ))}
                    <p
                      className="lang-popover-rates-hint"
                      style={{
                        fontSize: '0.7rem',
                        lineHeight: 1.45,
                        color: 'var(--color-text-muted)',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--color-border-light)',
                      }}
                    >
                      {formatTranslation(locale, 'nav.exchangeRatesHint', {
                        uf: formatMoney(rates.ufToClp, 'CLP', locale),
                        usd: formatMoney(rates.usdToClp, 'CLP', locale),
                      })}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t('common.menuClose') : t('common.menuOpen')}
                aria-expanded={mobileMenuOpen}
              >
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mobile-nav-welcome" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-dark)', letterSpacing: '-0.02em' }}>
            {t('nav.mobileWelcome')}
          </span>
          <div className="mobile-locale-minimal" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mobile-locale-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </span>
            <div className="mobile-locale-options" style={{ display: 'flex', gap: '4px' }}>
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`mobile-locale-text-btn ${locale === option.value ? 'active' : ''}`}
                  onClick={() => toggleLang(option.value)}
                  style={{
                    background: locale === option.value ? 'var(--color-primary)' : 'transparent',
                    color: locale === option.value ? '#fff' : 'var(--color-text-muted)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {option.value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mobile-nav-scroll-area">
          <ul className="mobile-nav-links">
            {navItemsMobile.map((item, i) => (
              <li key={item.href} className="mobile-nav-item">
                <div 
                  className="mobile-nav-row"
                  onClick={() => {
                    if (item.subItems) {
                      setExpandedItem(expandedItem === item.href ? null : item.href);
                    } else {
                      closeMobileMenu();
                    }
                  }}
                >
                  {item.subItems ? (
                    <button className="mobile-nav-link-btn" type="button">
                      <div className="mobile-nav-link-left">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <div className="mobile-nav-link-right">
                        {expandedItem === item.href ? <ChevronDown size={20} className="chevron" /> : <ChevronRight size={20} className="chevron" />}
                      </div>
                    </button>
                  ) : (
                    <Link href={item.href} className="mobile-nav-link-btn" onClick={closeMobileMenu}>
                      <div className="mobile-nav-link-left">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <div className="mobile-nav-link-right">
                        <ChevronRight size={20} className="chevron" />
                      </div>
                    </Link>
                  )}
                </div>

                {item.subItems && (
                  <div className={`mobile-nav-submenu-wrapper ${expandedItem === item.href ? 'open' : ''}`}>
                    <ul className="mobile-nav-submenu" role="list">
                      <li>
                        <Link href={item.href} className="mobile-nav-sub-link" onClick={closeMobileMenu}>
                          {t('nav.viewAll')}
                        </Link>
                      </li>
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link href={subItem.href} className="mobile-nav-sub-link" onClick={closeMobileMenu}>
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mobile-nav-footer" style={{ '--animation-order': navItemsMobile.length } as React.CSSProperties}>

              <NavSocialLinks className="mobile-social-links" linkClassName="mobile-social-link" />
            </div>
        </div>
      </div>
    </>
  );
}
