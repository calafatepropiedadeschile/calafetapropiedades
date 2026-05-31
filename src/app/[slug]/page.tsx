import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import StaticPageShell from '@/components/site/StaticPageShell';
import { getPublishedStaticPageBySlug, mapStaticPageView } from '@/features/site-content/static-page';
import { STATIC_PAGE_INTEGRATED_SLUGS, STATIC_PAGE_RESERVED_SLUGS } from '@/features/site-content/static-page.schemas';
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/config/site';
import { withDatabaseRole } from '@/lib/db/rls';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { resolvePageIncludeEnglish } from '@/lib/seo/page-locale';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

function getLocaleFromParam(value: string | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

function isBlockedSlug(slug: string) {
  return STATIC_PAGE_RESERVED_SLUGS.has(slug)
    || STATIC_PAGE_INTEGRATED_SLUGS.includes(slug as (typeof STATIC_PAGE_INTEGRATED_SLUGS)[number]);
}

async function getPageForMetadata(slug: string, locale: Locale, isAdmin: boolean) {
  if (isAdmin) {
    const page = await withDatabaseRole('admin', async (db) => db.staticPage.findUnique({ where: { slug } }));
    return page ? mapStaticPageView(page, locale) : null;
  }

  return getPublishedStaticPageBySlug(slug, locale);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const search = await searchParams;
  const locale = getLocaleFromParam(search.lang);

  if (isBlockedSlug(slug)) {
    return { title: siteConfig.name };
  }

  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const page = await getPageForMetadata(slug, locale, isAdmin);
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  if (!page) {
    return { title: 'Pagina no encontrada' };
  }

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.content.replace(/<[^>]+>/g, ' ').slice(0, 160);
  const includeEnglish = await resolvePageIncludeEnglish({ seo: siteSeo, cmsSlug: slug });
  const alternates = buildPageAlternates(`/${slug}`, {
    baseUrl,
    locale,
    customCanonical: page.customCanonical,
    includeEnglish,
  });
  const image = page.ogImage || siteSeo?.defaultOgImage || undefined;

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

export default async function CmsStaticPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const locale = getLocaleFromParam(search.lang);

  if (isBlockedSlug(slug)) {
    notFound();
  }

  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const page = await getPageForMetadata(slug, locale, isAdmin);

  if (!page || (!page.published && !isAdmin)) {
    notFound();
  }

  return <StaticPageShell page={page} />;
}
