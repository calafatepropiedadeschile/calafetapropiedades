import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JsonLdScript from '@/components/seo/JsonLdScript';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import { getPropertyBySlug } from '@/features/properties/property.service';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { getPreferredProjectCanonicalPath, isProjectLandingSlug } from '@/lib/seo/project-landings';
import { getPropertyVideoWatchPath } from '@/lib/seo/property-media-pages';
import { buildVideoObjectJsonLd } from '@/lib/seo/video-structured-data';
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
  getYoutubeWatchUrl,
  parseYoutubeVideoId,
} from '@/lib/seo/youtube';
import { buildCanonicalUrl } from '@/config/seo-url';
import { getServerLocale } from '@/lib/i18n/server';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!hasDatabaseUrl) return { title: 'Video no encontrado' };

  const { slug } = await params;
  const locale = await getServerLocale();
  const property = await getPropertyBySlug(slug, locale).catch(() => null);
  const videoId = parseYoutubeVideoId(property?.youtubeUrl);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  if (!property || !videoId) {
    return { title: 'Video no encontrado' };
  }

  const pagePath = getPropertyVideoWatchPath(slug);
  const title = locale === 'en'
    ? `Project video | ${property.title}`
    : `Video del proyecto | ${property.title}`;
  const description = locale === 'en'
    ? `Watch the video for ${property.title} in ${property.city}. Review the project and contact Calafate Propiedades.`
    : `Mira el video de ${property.title} en ${property.city}. Revisa el proyecto y consulta con Calafate Propiedades.`;
  const alternates = buildPageAlternates(pagePath, { baseUrl, locale });

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
      images: [{ url: getYoutubeThumbnailUrl(videoId) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getYoutubeThumbnailUrl(videoId)],
    },
  };
}

export default async function PropertyVideoWatchPage({ params }: Props) {
  if (!hasDatabaseUrl) notFound();

  const { slug } = await params;
  const locale = await getServerLocale();
  const t = (key: TranslationKey) => translate(locale, key);
  const property = await getPropertyBySlug(slug, locale).catch(() => null);
  const videoId = parseYoutubeVideoId(property?.youtubeUrl);

  if (!property || !videoId) notFound();

  const baseUrl = await resolveCanonicalBaseUrl();
  const pagePath = getPropertyVideoWatchPath(slug);
  const watchPageUrl = buildCanonicalUrl(baseUrl, pagePath);
  const propertyPath = getPreferredProjectCanonicalPath(slug);
  const thumbnailUrl = getYoutubeThumbnailUrl(videoId);
  const embedUrl = getYoutubeEmbedUrl(videoId);
  const contentUrl = getYoutubeWatchUrl(videoId);
  const videoTitle = locale === 'en'
    ? `Video — ${property.title}`
    : `Video — ${property.title}`;
  const videoDescription = (property.seoDescriptionEs || property.description).slice(0, 240);

  return (
    <>
      <Navbar />
      <main
        className="property-watch-page"
        style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))', background: 'var(--color-surface-2)' }}
      >
        <article className="container section property-watch-page__inner">
          <header className="property-watch-page__header">
            <p className="property-watch-page__eyebrow">{t('property.watchVideoEyebrow')}</p>
            <h1 className="heading-2 heading-display">{property.title}</h1>
            <p className="text-muted property-watch-page__lead">{videoDescription}</p>
          </header>

          <div className="property-watch-page__player">
            <iframe
              src={embedUrl}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="property-watch-page__actions">
            <Link href={propertyPath} className="btn btn-primary">
              {t('property.backToProperty')}
            </Link>
            <a href={contentUrl} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
              {t('property.openOnYoutube')}
            </a>
          </div>

          <aside className="property-watch-page__aside">
            <div className="property-watch-page__thumb">
              <Image
                src={thumbnailUrl}
                alt={videoTitle}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <p className="text-muted property-watch-page__aside-text">{t('property.watchVideoAside')}</p>
          </aside>
        </article>
      </main>
      <Footer />
      <JsonLdScript
        id={`property-${slug}-video-json-ld`}
        data={buildVideoObjectJsonLd({
          name: videoTitle,
          description: videoDescription,
          watchPageUrl,
          thumbnailUrl,
          embedUrl,
          contentUrl,
          uploadDate: new Date(property.updatedAt).toISOString(),
        })}
      />
      <BreadcrumbStructuredData
        baseUrl={baseUrl}
        id={`property-${slug}-video-breadcrumb-json-ld`}
        items={[
          { name: 'Inicio', path: '/' },
          {
            name: isProjectLandingSlug(slug) ? 'Proyectos' : 'Propiedades',
            path: isProjectLandingSlug(slug) ? '/proyectos' : '/propiedades',
          },
          { name: property.title, path: propertyPath },
          { name: locale === 'en' ? 'Video' : 'Video', path: pagePath },
        ]}
      />
    </>
  );
}
