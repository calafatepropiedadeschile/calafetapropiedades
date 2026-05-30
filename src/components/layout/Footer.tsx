'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

// Columnas de navegación del footer
// Estructura inspirada en el layout de referencia: header en caps + lista de links
const FOOTER_COLUMNS = [
  {
    title: 'Propiedades',
    links: [
      { label: 'Parcelas en venta', href: '/propiedades?priceType=venta&type=terreno' },
      { label: 'Casas en venta', href: '/propiedades?priceType=venta&type=casa' },
      { label: 'Proyectos de loteo', href: '/propiedades?priceType=venta' },
      { label: 'Ver todo el catálogo', href: '/propiedades' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Quiénes somos', href: '/nosotros' },
      { label: 'Cómo trabajamos', href: '/nosotros#modelo' },
      { label: 'Contáctanos', href: '/contacto' },
    ],
  },
  {
    title: 'Redes sociales',
    links: [
      { label: 'Instagram', href: siteConfig.contact.social.instagram, external: true },
      { label: 'Facebook', href: siteConfig.contact.social.facebook, external: true },
      { label: 'LinkedIn', href: siteConfig.contact.social.linkedin, external: true },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">

      {/* ── Partículas decorativas de fondo (CSS-only) ── */}
      <div className="footer-particles" aria-hidden="true">
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
      </div>

      <div className="container footer-body">

        {/* ── Columna izquierda: Logo + descripción + contacto ── */}
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo-link" aria-label="Ir al inicio">
            <Image
              src="/brand/calafate-logo.png"
              alt={siteConfig.name}
              width={200}
              height={48}
              className="footer-logo-img"
              style={{ objectFit: 'contain', height: '44px', width: 'auto' }}
            />
          </Link>

          <p className="footer-brand-desc">
            Especialistas en parcelas y loteos en el sur de Chile.
            Te acompañamos desde la búsqueda hasta la escrituración.
          </p>

          <address className="footer-contact-info">
            <a
              href={`mailto:${siteConfig.contact.primaryEmail}`}
              className="footer-contact-link"
            >
              {siteConfig.contact.primaryEmail}
            </a>
            <a
              href={siteConfig.contact.primaryPhoneHref}
              className="footer-contact-link"
            >
              {siteConfig.contact.primaryPhoneLabel}
            </a>
          </address>
        </div>

        {/* ── Columnas de navegación ── */}
        <nav className="footer-nav-columns" aria-label="Links del footer">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="footer-nav-col">
              <h3 className="footer-nav-title">{col.title}</h3>
              <ul className="footer-nav-list" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="footer-nav-link"
                      {...('external' in link && link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

      </div>

      {/* ── Barra inferior de copyright ── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            © {currentYear} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p className="footer-credit">
            Desarrollado por{' '}
            <a
              href="https://airconsulting-ten.vercel.app/"
              className="footer-credit-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              IrigoyenDev
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}
