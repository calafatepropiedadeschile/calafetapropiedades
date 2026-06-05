'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRentalsNav } from '@/components/layout/RentalsNavProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { siteConfig } from '@/config/site';
import { useSiteSettings } from '@/features/site-content/SiteSettingsProvider';

export default function Footer() {
  const { showRentalsLink } = useRentalsNav();
  const { locale, t } = useI18n();
  const currentYear = new Date().getFullYear();
  const settings = useSiteSettings();
  const primaryOffice = siteConfig.offices[0];

  const socialLinks = [];
  if (settings.instagramUrl) socialLinks.push({ label: 'Instagram', href: settings.instagramUrl, external: true });
  if (settings.facebookUrl) socialLinks.push({ label: 'Facebook', href: settings.facebookUrl, external: true });
  if (settings.linkedinUrl) socialLinks.push({ label: 'LinkedIn', href: settings.linkedinUrl, external: true });

  const propertyLinks = [
    { label: t('footerNav.lotsForSale'), href: '/propiedades?priceType=venta&type=terreno' },
    { label: t('footerNav.housesForSale'), href: '/propiedades?priceType=venta&type=casa' },
    { label: t('footerNav.lotProjects'), href: '/propiedades?priceType=venta' },
    ...(showRentalsLink ? [{ label: t('footerNav.rentals'), href: '/arriendos' }] : []),
    { label: t('footerNav.fullCatalog'), href: '/propiedades' },
  ];

  const footerColumns = [
    { title: t('footerNav.properties'), links: propertyLinks },
    {
      title: t('footerNav.regions'),
      links: [
        { label: t('footerNav.lotsValdivia'), href: '/parcelas-en-valdivia' },
        { label: t('footerNav.landValdivia'), href: '/terrenos-en-valdivia' },
        { label: t('footerNav.lotProjectsValdivia'), href: '/loteos-en-valdivia' },
        { label: t('footerNav.affordableLotsValdivia'), href: '/parcelas-baratas-valdivia' },
        { label: t('footerNav.lotsLosMuermos'), href: '/parcelas-en-los-muermos' },
        { label: t('footerNav.landLosMuermos'), href: '/terrenos-en-los-muermos' },
        { label: t('footerNav.lotsPuertoMontt'), href: '/parcelas-en-puerto-montt' },
        { label: t('footerNav.landPuertoMontt'), href: '/terrenos-en-puerto-montt' },
        { label: t('footerNav.lotsMaule'), href: '/parcelas-en-maule' },
      ],
    },
    {
      title: t('footerNav.company'),
      links: [
        { label: t('footerNav.about'), href: '/nosotros' },
        { label: t('footerNav.howWeWork'), href: '/nosotros#modelo' },
        { label: t('footerNav.aiGuide'), href: '/sobre-calafate' },
        { label: t('footerNav.contact'), href: '/contacto' },
      ],
    },
    {
      title: t('footerNav.social'),
      links: socialLinks,
    },
  ];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-bg-image" aria-hidden="true">
        <Image
          src="/site/volcano-footer-wide.png"
          alt={t('footerNav.volcanoAlt')}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
        <div className="footer-bg-overlay" />
      </div>

      <div className="footer-particles" aria-hidden="true">
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
        <span className="footer-particle" />
      </div>

      <div className="container footer-body">
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo-link" aria-label={t('footerNav.homeAria')}>
            <Image
              src="/brand/calafate-logo.png"
              alt={siteConfig.name}
              width={200}
              height={48}
              className="footer-logo-img"
              style={{ objectFit: 'contain', height: '44px', width: 'auto' }}
            />
          </Link>

          <p className="footer-brand-desc">{t('footerNav.brandDesc')}</p>

          <address className="footer-contact-info">
            <a href={`mailto:${settings.primaryEmail}`} className="footer-contact-link">
              {settings.primaryEmail}
            </a>
            <a href={settings.primaryPhoneHref} className="footer-contact-link">
              {settings.primaryPhone}
            </a>
            <p className="footer-address">
              {settings.officeAddress}
            </p>
          </address>
        </div>

        <nav className="footer-nav-columns" aria-label={t('footerNav.footerNavLabel')}>
          {footerColumns.map((col) => (
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

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            © {currentYear} {siteConfig.name}. {t('home.footerRights')} — {t('footerNav.copyright')}
          </p>
          <p className="footer-credit">
            {t('home.footerDevelopedBy')}{' '}
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
