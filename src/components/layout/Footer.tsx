'use client';

import Link from 'next/link';
import TranslatedText from '@/components/i18n/TranslatedText';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="premium-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo" style={{ display: 'inline-flex', gap: '0.35rem' }}>
              <span className="secondary-logo-red">{siteConfig.logo.primary}</span>
              <span className="secondary-logo-dark">{siteConfig.logo.secondary}</span>
            </div>
            <p className="footer-description">
              <TranslatedText id="home.footerDescription" />
            </p>
          </div>
          <div>
            <h5 className="footer-column-title">
              <TranslatedText id="home.footerProperties" />
            </h5>
            <ul className="footer-links-list">
              <li>
                <Link href="/propiedades?priceType=venta" className="footer-link">
                  <TranslatedText id="home.footerSale" />
                </Link>
              </li>
              <li>
                <Link href="/propiedades?priceType=alquiler" className="footer-link">
                  Alquileres
                </Link>
              </li>
              <li>
                <Link href="/propiedades?priceType=venta&marketRegion=mexico" className="footer-link">
                  Preventas Mexico
                </Link>
              </li>
              <li>
                <Link href="/propiedades?priceType=venta&type=casa" className="footer-link">
                  <TranslatedText id="home.footerHouses" />
                </Link>
              </li>
              <li>
                <Link href="/propiedades?priceType=venta&type=apartamento" className="footer-link">
                  <TranslatedText id="home.footerApartments" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="footer-column-title">
              <TranslatedText id="home.footerCompany" />
            </h5>
            <ul className="footer-links-list">
              <li>
                <Link href="/nosotros" className="footer-link">
                  <TranslatedText id="home.footerAbout" />
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="footer-link">
                  <TranslatedText id="home.footerContact" />
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-contact-column">
            <h5 className="footer-column-title">
              <TranslatedText id="home.footerContactTitle" />
            </h5>
            <div className="footer-contact-list">
              {siteConfig.offices.map((office) => (
                <address key={office.id} className="footer-contact-block">
                  <strong>{office.country.es}</strong>
                  <span>{office.brandName}</span>
                  <span>{office.role.es}: {office.contactName}</span>
                  <a href={`mailto:${office.email}`} className="footer-link">
                    Correo: {office.email}
                  </a>
                  <a href={office.phoneHref} className="footer-link">
                    {office.phoneLabel}
                  </a>
                  {office.addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-divider">
          <p className="footer-copyright">
            © 2026 {siteConfig.name}. <TranslatedText id="home.footerRights" />
          </p>
          <p className="footer-credit">
            <TranslatedText id="home.footerDevelopedBy" />{' '}
            <a className="footer-credit-link" href="https://airconsulting-ten.vercel.app/">
              IrigoyenDev.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
