import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyDetailPageContent from '@/components/properties/PropertyDetailPageContent';
import PropertyViewContentTracker from '@/components/marketing/PropertyViewContentTracker';
import { getPropertyBySlug, getSimilarProperties } from '@/features/properties/property.service';
import { parsePropertyDescription } from '@/features/properties/property-description-content';
import { buildPropertyGalleryImages } from '@/features/properties/property-detail-page.shared';
import { isSupportedLocale, type Locale } from '@/lib/i18n/config';
import { getExchangeRates } from '@/lib/currency/exchange-rates';
import { getServerCurrency, getServerLocale } from '@/lib/i18n/server';
import { auth } from '@/lib/auth/auth';
import StructuredData from '@/components/seo/StructuredData';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getPreferredProjectCanonicalPath, isProjectLandingSlug } from '@/lib/seo/project-landings';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { getResolvedGoogleMapsLink } from '@/lib/maps/google-maps-resolve';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
}

async function resolvePageLocale(search?: { lang?: string }): Promise<Locale> {
  if (isSupportedLocale(search?.lang)) {
    return search.lang;
  }

  return getServerLocale(search);
}

async function getSafePropertyBySlug(slug: string, locale: Locale, showUnpublished = false) {
  try {
    return await getPropertyBySlug(slug, locale, showUnpublished);
  } catch (error) {
    console.error(`Unable to load property detail for slug "${slug}".`, error);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  if (!hasDatabaseUrl) return { title: 'Propiedad no encontrada' };

  const { slug } = await params;
  const search = await searchParams;
  const locale = await resolvePageLocale(search);
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const property = await getSafePropertyBySlug(slug, locale, isAdmin);
  if (!property) return { title: 'Propiedad no encontrada' };
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();
  const canonicalPath = getPreferredProjectCanonicalPath(slug);

  const seoTitle = locale === 'en'
    ? (property.seoTitleEn || property.seoTitleEs || property.title)
    : (property.seoTitleEs || property.title);

  const seoDescription = locale === 'en'
    ? (property.seoDescriptionEn || property.seoDescriptionEs || property.description.slice(0, 160))
    : (property.seoDescriptionEs || property.description.slice(0, 160));

  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, property });
  const alternates = buildPageAlternates(canonicalPath, {
    baseUrl,
    locale,
    customCanonical: property.customCanonical,
    includeEnglish,
  });
  const ogImageUrl = property.ogImage || property.coverImage || siteSeo?.defaultOgImage || '';

  return {
    title: seoTitle,
    description: seoDescription,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: alternates.canonical,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function PropertyDetailPage({ params, searchParams }: Props) {
  if (!hasDatabaseUrl) notFound();

  const { slug } = await params;
  const search = await searchParams;
  const [locale, displayCurrency, exchangeRates] = await Promise.all([
    resolvePageLocale(search),
    getServerCurrency(),
    getExchangeRates(),
  ]);

  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  if (isProjectLandingSlug(slug) && !isAdmin) {
    const langQuery = isSupportedLocale(search?.lang) ? `?lang=${search.lang}` : '';
    permanentRedirect(`/proyectos/${slug}${langQuery}`);
  }

  const property = await getSafePropertyBySlug(slug, locale, isAdmin);
  if (!property) notFound();

  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const pagePath = getPreferredProjectCanonicalPath(slug);
  const similarProperties = await getSimilarProperties(property.id, slug, locale).catch((error) => {
    console.error(`Unable to load similar properties for slug "${slug}".`, error);
    return [];
  });
  const parsedDescription = parsePropertyDescription(property.description);
  const galleryImages = buildPropertyGalleryImages(property.coverImage, property.images);
  const resolvedMap = property.mapUrl?.trim()
    ? await getResolvedGoogleMapsLink(property.mapUrl)
    : null;

  return (
    <>
      <PropertyViewContentTracker
        contentId={slug}
        contentName={property.title}
        value={property.price}
        currency={property.currency}
        contentCategory="property"
      />
      <Navbar />
      <PropertyDetailPageContent
        property={property}
        locale={locale}
        displayCurrency={displayCurrency}
        exchangeRates={exchangeRates}
        similarProperties={similarProperties}
        galleryImages={galleryImages}
        parsedDescription={parsedDescription}
        resolvedMap={resolvedMap}
        pagePath={pagePath}
        isProject={false}
      />
      <StructuredData property={property} locale={locale} baseUrl={siteSeo?.canonicalBaseUrl} />
      <BreadcrumbStructuredData
        baseUrl={siteSeo?.canonicalBaseUrl}
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Propiedades', path: '/propiedades' },
          { name: property.title, path: pagePath },
        ]}
      />
      <Footer />
    </>
  );
}
