import type { Metadata } from 'next';
import { auth } from '@/lib/auth/auth';
import NosotrosView from './NosotrosView';
import { getPublishedStaticPageBySlug, getStaticPageBySlugForAdmin } from '@/features/site-content/static-page';
import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n/config';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

interface MetadataProps {
  searchParams: Promise<{ lang?: string }>;
}

function getLocaleFromParam(value: string | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

async function resolveNosotrosCms(locale: 'es' | 'en', isAdmin: boolean) {
  const published = await getPublishedStaticPageBySlug('nosotros', locale);
  if (published) return published;
  if (!isAdmin) return null;
  return getStaticPageBySlugForAdmin('nosotros', locale);
}

export async function generateMetadata({ searchParams }: MetadataProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocaleFromParam(params.lang);
  const [cms, siteSeo] = await Promise.all([
    getPublishedStaticPageBySlug('nosotros', locale).catch(() => null),
    getSiteSeoSettings().catch(() => null),
  ]);
  const baseUrl = await resolveCanonicalBaseUrl();
  const title = cms?.seoTitle || `Nosotros - ${siteConfig.name}`;
  const description = cms?.seoDescription || `Conoce a ${siteConfig.name}, nuestra forma de trabajo y el equipo que te acompaña en cada operación.`;
  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, cmsSlug: 'nosotros' });
  const alternates = buildPageAlternates('/nosotros', {
    baseUrl,
    locale,
    customCanonical: cms?.customCanonical,
    includeEnglish,
  });
  const image = cms?.ogImage || siteSeo?.defaultOgImage || undefined;

  return {
    title,
    description,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function NosotrosPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const [cmsEs, cmsEn] = await Promise.all([
    resolveNosotrosCms('es', isAdmin),
    resolveNosotrosCms('en', isAdmin),
  ]);

  return <NosotrosView cmsByLocale={{ es: cmsEs, en: cmsEn }} />;
}
