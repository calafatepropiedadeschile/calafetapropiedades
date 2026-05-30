import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { readCatalogPreferences } from '@/lib/catalog/catalog-preferences';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertySearch from '@/components/properties/PropertySearch';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import MasterplanInteractiveSection from '@/components/home/MasterplanInteractiveSection';
import TrustStatsSection from '@/components/home/TrustStatsSection';
import CtaBanner from '@/components/ui/CtaBanner';
import { getFeaturedProperties, getStaticPropertyCatalog } from '@/features/properties/property.service';
import { getHomeHeroContent } from '@/features/site-content/home-hero';
import { HOME_HERO_DEFAULTS } from '@/features/site-content/home-hero.defaults';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/i18n/config';
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

async function getSafePropertyCatalog() {
  if (!hasDatabaseUrl) return [];

  try {
    return await getStaticPropertyCatalog(DEFAULT_LOCALE);
  } catch (error) {
    console.warn('Skipping property catalog because the datasource is unavailable.', error);
    return [];
  }
}

const CATEGORY_LINKS = [
  { label: 'Terrenos', href: '/terrenos', primary: true },
  { label: 'Casas', href: '/propiedades?type=casa' },
];

const HOME_ACTIONS = [
  {
    title: 'Comprar parcelas',
    description: 'Compara loteos por ubicacion, superficie, precio desde, conectividad y condiciones comerciales.',
    href: '/proyectos',
    cta: 'Ver proyectos',
  },
  {
    title: 'Vender un terreno',
    description: 'Preparamos la publicacion, ordenamos la informacion clave y activamos consultas calificadas.',
    href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject),
    cta: 'Solicitar evaluacion',
  },
  {
    title: 'Trabajos de topografia',
    description: 'Apoyo tecnico para terrenos, loteos y proyectos que necesitan informacion clara antes de avanzar.',
    href: '/topografia',
    cta: 'Ver servicio',
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const catalogPreferences = readCatalogPreferences(cookieStore);

  const [featuredProperties, propertyCatalog, hero] = await Promise.all([
    getSafeFeaturedProperties(),
    getSafePropertyCatalog(),
    hasDatabaseUrl
      ? getHomeHeroContent(locale).catch(() => ({
          imageUrl: '/heroe.jpg',
          titleLine1: HOME_HERO_DEFAULTS.titleLine1Es,
          titleLine2: HOME_HERO_DEFAULTS.titleLine2Es,
          subtitle: HOME_HERO_DEFAULTS.subtitleEs,
        }))
      : Promise.resolve({
          imageUrl: '/heroe.jpg',
          titleLine1: HOME_HERO_DEFAULTS.titleLine1Es,
          titleLine2: HOME_HERO_DEFAULTS.titleLine2Es,
          subtitle: HOME_HERO_DEFAULTS.subtitleEs,
        }),
  ]);

  const featured = featuredProperties.length > 0 ? featuredProperties : propertyCatalog.slice(0, 6);

  return (
    <>
      <Navbar />
      <main>
        <HomeHeroSection hero={hero} />

        <div className="home-search-overlay-container">
          <PropertySearch
            initialType={catalogPreferences.type || 'terreno'}
            initialZone={catalogPreferences.zone}
          />
        </div>

        <section className="section container featured-properties-section">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 800, color: 'var(--color-dark)', lineHeight: '1.2', margin: '0 0 var(--space-xs)' }}>
              Propiedades y Loteos Destacados
            </h2>
            <p className="text-muted" style={{ maxWidth: '740px', margin: 'var(--space-xs) auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Revisa la cartera actual de Calafate: parcelas de 5.000 m2, loteos con tours 360 y terrenos disponibles en zonas con alta demanda.
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-xs)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              margin: 'var(--space-xl) auto 3rem',
              maxWidth: 'fit-content',
              backgroundColor: 'var(--color-surface-2)',
              padding: '6px',
              borderRadius: '100px',
              border: '1px solid var(--color-border-light)'
            }} aria-label="Filtro de categorias">
              {CATEGORY_LINKS.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: category.primary ? 'var(--color-primary)' : 'transparent',
                    color: category.primary ? '#ffffff' : 'var(--color-text-subtle)',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none'
                  }}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          {featured.length > 0 ? (
            <div className="property-grid">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Estamos ordenando el catalogo</h3>
              <p>Las propiedades reales se cargaran aqui cuando la base de datos este disponible.</p>
            </div>
          )}
        </section>

        <CtaBanner
          variant="subtle"
          eyebrow="Disponibilidad por lote"
          headline="Confirma valores, etapas y unidades antes de visitar."
          sub="Cada proyecto tiene condiciones distintas: precio desde, forma de pago, factibilidades y disponibilidad. Te ayudamos a revisar lo importante."
          ctas={[
            { label: 'Ver proyectos', href: '/proyectos', primary: true },
            { label: 'Consultar disponibilidad', href: '/contacto' },
          ]}
          id="cta-catalogo"
        />

        <MasterplanInteractiveSection allProperties={propertyCatalog} />

        <TrustStatsSection />

        <section className="section container guide-section">
          <div className="guide-grid">
            {HOME_ACTIONS.map((action) => (
              <div key={action.href} className="guide-card">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{action.title}</h3>
                <p className="text-muted" style={{ marginBottom: 'var(--space-lg)', flex: 1 }}>{action.description}</p>
                <Link href={action.href} className="btn btn-outline" style={{ width: 'fit-content' }}>{action.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        <ServicesSection />

        <CtaBanner
          variant="dark"
          eyebrow="Asesoria para terrenos"
          headline="Compara proyectos por ubicacion, acceso y forma de pago."
          sub="Te ayudamos a ordenar opciones de loteos y parcelas segun presupuesto, etapa del proyecto y tipo de uso que tienes en mente."
          ctas={[
            { label: 'Hablar con un asesor', href: '/contacto', primary: true },
            { label: 'Ver terrenos', href: '/terrenos' },
          ]}
          id="cta-asesoria"
        />

        <section className="section" style={{ backgroundColor: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', padding: 'var(--space-4xl) 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 'var(--space-3xl)', alignItems: 'center' }}>
            <div style={{ position: 'relative', height: '480px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }} className="discover-image-wrapper">
              <Image
                src={siteConfig.copy.discover.imageUrl}
                alt={`Casa de madera con vista al entorno natural — ${siteConfig.name}`}
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
