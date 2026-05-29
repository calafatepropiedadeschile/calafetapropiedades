import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertySearch from '@/components/properties/PropertySearch';
import ServicesSection from '@/components/home/ServicesSection';
import TranslatedText from '@/components/i18n/TranslatedText';
import { getFeaturedProperties } from '@/features/properties/property.service';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { buildMailto, siteConfig } from '@/config/site';

export const revalidate = 300;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function getSafeFeaturedProperties() {
  if (!hasDatabaseUrl) return [];

  try {
    return await getFeaturedProperties(DEFAULT_LOCALE);
  } catch (error) {
    console.warn('Skipping featured properties because the datasource is unavailable.', error);
    return [];
  }
}

const SALE_HERO_LINKS = [
  {
    href: '/propiedades?priceType=venta',
    image: getSiteImageUrl('site/chip-new.webp', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop'),
    labelKey: 'home.chipNew',
    alt: 'Nuevas propiedades',
  },
  {
    href: '/propiedades?priceType=venta&type=casa',
    image: getSiteImageUrl('site/chip-houses.webp', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'),
    labelKey: 'home.chipHouses',
    alt: 'Casas en venta',
  },
  {
    href: '/propiedades?priceType=venta&type=apartamento',
    image: getSiteImageUrl('site/chip-apartments.webp', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop'),
    labelKey: 'home.chipApartments',
    alt: 'Apartamentos',
  },
  {
    href: '/propiedades?priceType=venta&type=terreno',
    image: getSiteImageUrl('site/chip-lots.webp', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=600&auto=format&fit=crop'),
    labelKey: 'home.chipLots',
    alt: 'Terrenos',
  },
  {
    href: '/propiedades?priceType=venta&marketRegion=mexico',
    image: getSiteImageUrl('site/chip-mexico.webp', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=600&auto=format&fit=crop'),
    labelKey: 'catalog.marketMexico',
    alt: 'Preventas Mexico',
  },
] satisfies Array<{ href: string; image: string; labelKey: TranslationKey; alt: string }>;

const SALE_GUIDES = [
  {
    titleKey: 'home.guideBuyTitle',
    descriptionKey: 'home.guideBuyDescription',
    href: '/propiedades?priceType=venta',
    ctaKey: 'home.guideBuyCta',
  },
  {
    titleKey: 'home.guideSellTitle',
    descriptionKey: 'home.guideSellDescription',
    href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject),
    ctaKey: 'home.guideSellCta',
  },
] satisfies Array<{ titleKey: TranslationKey; descriptionKey: TranslationKey; href: string; ctaKey: TranslationKey }>;

export default async function HomePage() {
  const featured = await getSafeFeaturedProperties();
  const heroImage = getSiteImageUrl(
    'site/home-hero.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop'
  );

  return (
    <>
      <Navbar />
      <main>
        <section id="hero" className="hero home-hero">
          <div className="hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} />
          <div className="container" style={{ position: 'relative', zIndex: 20 }}>
            <div className="hero-content" style={{ maxWidth: '900px', margin: 'var(--space-3xl) auto 0', textAlign: 'center' }}>
              <h1 className="hero-title" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginBottom: 'var(--space-3xl)', textAlign: 'center', lineHeight: '1.2' }}>
                <TranslatedText id="home.heroTitleLine1" /><br />
                <TranslatedText id="home.heroTitleLine2" />
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PropertySearch />
              </div>

              <div style={{ marginTop: 'var(--space-4xl)', textAlign: 'left' }}>
                <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                  <TranslatedText id="home.heroExplore" />
                </h2>

                <div className="hero-chip-grid">
                  {SALE_HERO_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} className="hero-chip">
                      <Image src={item.image} width={600} height={360} className="hero-chip-img" alt={item.alt} />
                      <div className="hero-chip-content">
                        <span className="hero-chip-label"><TranslatedText id={item.labelKey} /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 className="heading-2" style={{ fontWeight: 800 }}>
              <TranslatedText id="home.featuredTitle" />
            </h2>
            <p className="text-muted"><TranslatedText id="home.featuredSubtitle" /></p>
          </div>

          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
            <Link href="/propiedades?priceType=venta" className="btn btn-primary btn-lg"><TranslatedText id="home.viewProperties" /></Link>
          </div>
        </section>

        <section className="section container guide-section">
          <div className="guide-grid">
            {SALE_GUIDES.map((guide) => (
              <div key={guide.href} className="guide-card">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}><TranslatedText id={guide.titleKey} /></h3>
                <p className="text-muted" style={{ marginBottom: 'var(--space-lg)', flex: 1 }}><TranslatedText id={guide.descriptionKey} /></p>
                <Link href={guide.href} className="btn btn-outline" style={{ width: 'fit-content' }}><TranslatedText id={guide.ctaKey} /></Link>
              </div>
            ))}
          </div>
        </section>

        <ServicesSection />

        <section className="section" style={{ backgroundColor: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', padding: 'var(--space-4xl) 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 'var(--space-3xl)', alignItems: 'center' }}>
            <div style={{ position: 'relative', height: '480px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }} className="discover-image-wrapper">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
                alt={`${siteConfig.name} propiedad destacada`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div>
                <span style={{
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  display: 'block',
                  marginBottom: 'var(--space-xs)'
                }}>
                  {siteConfig.copy.discover.eyebrow}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.5rem',
                  color: 'var(--color-text)',
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  {siteConfig.copy.discover.title}
                </h2>
                <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-primary)', marginTop: 'var(--space-md)', borderRadius: '2px' }} />
              </div>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
                {siteConfig.copy.discover.paragraphs[0]}
              </p>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0, fontWeight: 500 }}>
                {siteConfig.copy.discover.paragraphs[1]}
              </p>

              <div style={{ marginTop: 'var(--space-sm)' }}>
                <Link href="/contacto" className="btn btn-primary btn-lg" style={{ width: 'fit-content' }}>
                  Contactanos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
