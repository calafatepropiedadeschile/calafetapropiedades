import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyLeadPanel from '@/components/marketing/PropertyLeadPanel';
import PropertyCommercialHighlights from '@/components/properties/PropertyCommercialHighlights';
import PropertyDescription from '@/components/properties/PropertyDescription';
import PropertyLandProjectSections from '@/components/properties/PropertyLandProjectSections';
import { parsePropertyDescription } from '@/features/properties/property-description-content';
import { formatPropertyPrice } from '@/lib/utils/formatters';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import { getStaticPropertyBySlug } from '@/features/properties/property.service';
import { isRentalPriceType } from '@/features/properties/price-type';
import { shouldShowPriceFrom } from '@/features/properties/property-land-options';
import { getServerLocale } from '@/lib/i18n/server';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import { projectLandingSlugs } from '@/config/seo-pages';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

interface Props {
  params: Promise<{ slug: string }>;
}

async function getSafeProject(slug: string, locale: 'es' | 'en') {
  if (!hasDatabaseUrl) return null;

  try {
    const property = await getStaticPropertyBySlug(slug, locale);
    if (property?.type !== 'terreno' || isRentalPriceType(property.priceType)) {
      return null;
    }
    return property;
  } catch (error) {
    console.warn(`Skipping project landing for "${slug}" because the datasource is unavailable.`, error);
    return null;
  }
}

export function generateStaticParams() {
  return projectLandingSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const project = await getSafeProject(slug, locale);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = siteSeo?.canonicalBaseUrl ?? 'https://calafetapropiedades.vercel.app';

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

  const title = project.seoTitleEs || `${project.title} | Proyecto de parcelas`;
  const description = project.seoDescriptionEs
    || `${project.title} en ${project.city}, ${project.province ?? project.country ?? 'Chile'}. Revisa precio, superficie, imagenes y consulta disponibilidad con Calafate Propiedades.`;
  const canonical = `${baseUrl}/proyectos/${project.slug}`;
  const image = project.ogImage || project.coverImage || siteSeo?.defaultOgImage || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProjectLandingPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const project = await getSafeProject(slug, locale);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = siteSeo?.canonicalBaseUrl ?? 'https://calafetapropiedades.vercel.app';

  if (!project) notFound();
  const t = (key: TranslationKey) => translate(locale, key);
  const parsedDescription = parsePropertyDescription(project.description);
  const heroImage = project.coverImage || getSiteImageUrl(
    'site/project-fallback.webp',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop'
  );
  const canonical = `${baseUrl}/proyectos/${project.slug}`;
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.title,
    description: project.description.slice(0, 260),
    url: canonical,
    image: project.coverImage ? [project.coverImage] : undefined,
    offers: {
      '@type': 'Offer',
      price: project.price,
      priceCurrency: project.currency,
      availability: project.status === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.city,
      addressRegion: project.province ?? project.zone,
      addressCountry: project.country ?? 'Chile',
    },
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', background: 'var(--color-surface-2)' }}>
        <section className="container section" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'var(--space-3xl)',
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              color: 'var(--color-primary)',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
              marginBottom: 'var(--space-sm)',
            }}>
              Proyecto inmobiliario
            </span>
            <h1 className="heading-2 heading-display" style={{ marginBottom: 'var(--space-md)' }}>
              {project.title}
            </h1>
            <p className="detail-price" style={{ marginBottom: 'var(--space-md)' }}>
              {formatPropertyPrice(project.price, project.currency, {
                priceFrom: shouldShowPriceFrom(project),
                locale,
              })}
            </p>
            <p className="text-muted" style={{ fontSize: '1.06rem', lineHeight: 1.75 }}>
              {[project.zone, project.city, project.province].filter(Boolean).join(', ')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-xl)' }}>
              <Link href={`/propiedades/${project.slug}`} className="btn btn-primary">
                Ver ficha completa
              </Link>
              <Link href="/proyectos" className="btn btn-outline">
                Ver mas proyectos
              </Link>
            </div>
          </div>

          <div style={{
            position: 'relative',
            minHeight: '360px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            background: 'var(--color-surface)',
          }}>
            <Image
              src={heroImage}
              alt={project.title}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </section>

        <section className="container" style={{ paddingBottom: 'var(--space-4xl)' }}>
          <div className="property-detail-layout">
            <div>
              <PropertyCommercialHighlights property={project} locale={locale} title={t('property.commercialSnapshot')} />

              <PropertyDescription
                parsed={parsedDescription}
                sectionTitle={t('property.about')}
                hint={t('property.descriptionHint')}
              />

              <h2 className="property-technical-heading">{t('property.technicalDetailsBelow')}</h2>
              <PropertyLandProjectSections
                property={project}
                locale={locale}
                showProjectBadge={false}
                showTopHighlights={false}
              />
            </div>

            <aside className="property-contact-panel">
              <PropertyLeadPanel
                propertyId={project.id}
                propertyTitle={project.title}
                propertySlug={project.slug}
                locale={locale}
                pageLabel={`/proyectos/${project.slug}`}
              />
            </aside>
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <Footer />
    </>
  );
}
