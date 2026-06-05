import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VirtualTour from '@/components/properties/VirtualTour';
import JsonLdScript from '@/components/seo/JsonLdScript';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import { getPropertyBySlug } from '@/features/properties/property.service';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { getPropertyVirtualTourWatchPath } from '@/lib/seo/property-media-pages';
import { buildVideoObjectJsonLd } from '@/lib/seo/video-structured-data';
import { buildCanonicalUrl } from '@/config/seo-url';
import { getServerLocale } from '@/lib/i18n/server';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!hasDatabaseUrl) return { title: 'Tour no encontrado' };

  const { slug } = await params;
  const locale = await getServerLocale();
  const property = await getPropertyBySlug(slug, locale).catch(() => null);
  const tourUrl = property?.virtualTourUrl?.trim();
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  if (!property || !tourUrl) {
    return { title: 'Tour no encontrado' };
  }

  const pagePath = getPropertyVirtualTourWatchPath(slug);
  const title = locale === 'en'
    ? `360 virtual tour | ${property.title}`
    : `Tour virtual 360 | ${property.title}`;
  const description = locale === 'en'
    ? `Explore ${property.title} with an interactive 360 tour before scheduling a visit.`
    : `Recorre ${property.title} con un tour virtual 360 antes de coordinar una visita.`;
  const alternates = buildPageAlternates(pagePath, { baseUrl, locale });
  const thumbnailUrl = property.coverImage || property.ogImage || undefined;

  return {
    title,
    description,
    alternates,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'video.other',
      images: thumbnailUrl ? [{ url: thumbnailUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: thumbnailUrl ? [thumbnailUrl] : [],
    },
  };
}

export default async function PropertyVirtualTourWatchPage({ params }: Props) {
  if (!hasDatabaseUrl) notFound();

  const { slug } = await params;
  const locale = await getServerLocale();
  const t = (key: TranslationKey) => translate(locale, key);
  const property = await getPropertyBySlug(slug, locale).catch(() => null);
  const tourUrl = property?.virtualTourUrl?.trim();

  if (!property || !tourUrl) notFound();

  const baseUrl = await resolveCanonicalBaseUrl();
  const pagePath = getPropertyVirtualTourWatchPath(slug);
  const watchPageUrl = buildCanonicalUrl(baseUrl, pagePath);
  const propertyPath = `/propiedades/${slug}`;
  const thumbnailUrl = property.coverImage || property.ogImage || buildCanonicalUrl(baseUrl, '/brand/calafate-logo.png');
  const tourTitle = locale === 'en'
    ? `360 virtual tour — ${property.title}`
    : `Tour virtual 360 — ${property.title}`;
  const tourDescription = (property.seoDescriptionEs || property.description).slice(0, 240);

  return (
    <>
      <Navbar />
      <main
        className="property-watch-page"
        style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', background: 'var(--color-surface-2)' }}
      >
        <article className="container section property-watch-page__inner">
          <header className="property-watch-page__header">
            <p className="property-watch-page__eyebrow">{t('property.virtualTourWatchEyebrow')}</p>
            <h1 className="heading-2 heading-display">{property.title}</h1>
            <p className="text-muted property-watch-page__lead">{tourDescription}</p>
          </header>

          <div className="property-watch-page__player property-watch-page__player--tour">
            <VirtualTour src={tourUrl} title={tourTitle} />
          </div>

          <div className="property-watch-page__actions">
            <Link href={propertyPath} className="btn btn-primary">
              {t('property.backToProperty')}
            </Link>
            <a href={tourUrl} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              {t('property.openTourFullscreen')}
            </a>
          </div>

          {property.coverImage ? (
            <aside className="property-watch-page__aside">
              <div className="property-watch-page__thumb">
                <Image
                  src={property.coverImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className="text-muted">{t('property.virtualTourWatchAside')}</p>
            </aside>
          ) : null}
        </article>
      </main>
      <Footer />
      <JsonLdScript
        id={`property-${slug}-tour-json-ld`}
        data={buildVideoObjectJsonLd({
          name: tourTitle,
          description: tourDescription,
          watchPageUrl,
          thumbnailUrl,
          embedUrl: tourUrl,
          contentUrl: tourUrl,
          uploadDate: new Date(property.updatedAt).toISOString(),
        })}
      />
      <BreadcrumbStructuredData
        baseUrl={baseUrl}
        id={`property-${slug}-tour-breadcrumb-json-ld`}
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Propiedades', path: '/propiedades' },
          { name: property.title, path: propertyPath },
          { name: locale === 'en' ? '360 tour' : 'Tour 360', path: pagePath },
        ]}
      />
    </>
  );
}
