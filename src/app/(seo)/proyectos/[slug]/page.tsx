import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyDetailPageContent from '@/components/properties/PropertyDetailPageContent';
import PropertyViewContentTracker from '@/components/marketing/PropertyViewContentTracker';
import StructuredData from '@/components/seo/StructuredData';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import { parsePropertyDescription } from '@/features/properties/property-description-content';
import { buildPropertyGalleryImages } from '@/features/properties/property-detail-page.shared';
import { getPropertyBySlug, getSimilarProperties } from '@/features/properties/property.service';
import { isRentalPriceType } from '@/features/properties/price-type';
import { projectLandingSlugs } from '@/config/seo-pages';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getPreferredProjectCanonicalPath } from '@/lib/seo/project-landings';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { getResolvedGoogleMapsLink } from '@/lib/maps/google-maps-resolve';
import { getExchangeRates } from '@/lib/currency/exchange-rates';
import { getServerCurrency, getServerLocale } from '@/lib/i18n/server';
import { isSupportedLocale, type Locale } from '@/lib/i18n/config';

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

async function getSafeProject(slug: string, locale: Locale) {
  if (!hasDatabaseUrl) return null;

  try {
    const property = await getPropertyBySlug(slug, locale);
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const search = await searchParams;
  const locale = await resolvePageLocale(search);
  const project = await getSafeProject(slug, locale);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  if (!project) {
    return { title: 'Proyecto no encontrado' };
  }

  const title = locale === 'en'
    ? (project.seoTitleEn || project.seoTitleEs || `${project.title} | Land project`)
    : (project.seoTitleEs || `${project.title} | Proyecto de parcelas`);
  const description = locale === 'en'
    ? (project.seoDescriptionEn || project.seoDescriptionEs
      || `${project.title} in ${project.city}, ${project.province ?? project.country ?? 'Chile'}. Review price, area, images and contact Calafate Propiedades.`)
    : (project.seoDescriptionEs
      || `${project.title} en ${project.city}, ${project.province ?? project.country ?? 'Chile'}. Revisa precio, superficie, imágenes y consulta disponibilidad con Calafate Propiedades.`);
  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, property: project });
  const alternates = buildPageAlternates(`/proyectos/${project.slug}`, {
    baseUrl,
    locale,
    customCanonical: project.customCanonical,
    includeEnglish,
  });
  const image = project.ogImage || project.coverImage || siteSeo?.defaultOgImage || undefined;

  return {
    title,
    description,
    alternates,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
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

export default async function ProjectLandingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const [locale, displayCurrency, exchangeRates] = await Promise.all([
    resolvePageLocale(search),
    getServerCurrency(),
    getExchangeRates(),
  ]);
  const project = await getSafeProject(slug, locale);
  const siteSeo = await getSiteSeoSettings().catch(() => null);

  if (!project) notFound();

  const pagePath = getPreferredProjectCanonicalPath(slug);
  const similarProperties = await getSimilarProperties(project.id, slug, locale).catch((error) => {
    console.error(`Unable to load similar properties for slug "${slug}".`, error);
    return [];
  });
  const parsedDescription = parsePropertyDescription(project.description);
  const galleryImages = buildPropertyGalleryImages(project.coverImage, project.images);
  const resolvedMap = project.mapUrl?.trim()
    ? await getResolvedGoogleMapsLink(project.mapUrl)
    : null;

  return (
    <>
      <PropertyViewContentTracker
        contentId={project.slug}
        contentName={project.title}
        value={project.price}
        currency={project.currency}
        contentCategory="project"
      />
      <Navbar />
      <PropertyDetailPageContent
        property={project}
        locale={locale}
        displayCurrency={displayCurrency}
        exchangeRates={exchangeRates}
        similarProperties={similarProperties}
        galleryImages={galleryImages}
        parsedDescription={parsedDescription}
        resolvedMap={resolvedMap}
        pagePath={pagePath}
        isProject
      />
      <StructuredData property={project} locale={locale} baseUrl={siteSeo?.canonicalBaseUrl} />
      <BreadcrumbStructuredData
        baseUrl={siteSeo?.canonicalBaseUrl}
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Proyectos', path: '/proyectos' },
          { name: project.title, path: pagePath },
        ]}
      />
      <Footer />
    </>
  );
}
