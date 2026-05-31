import { seoLandingPages, type SeoLandingKey } from '@/config/seo-pages';
import { getStaticPageEnglishSeoAvailable } from '@/features/site-content/static-page';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';
import {
  hasPropertyEnglishSeo,
  hasSiteEnglishSeo,
  seoLandingHasEnglishConfig,
} from '@/lib/seo/english-index';

const LANDING_KEY_BY_PATH = new Map<string, SeoLandingKey>(
  (Object.keys(seoLandingPages) as SeoLandingKey[]).map((key) => [seoLandingPages[key].path, key]),
);

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export async function resolveSitemapIncludeEnglish(
  pathname: string,
  seo: SiteSeoSettingsView | null,
  property?: { seoTitleEn?: string | null; seoDescriptionEn?: string | null },
): Promise<boolean> {
  if (property) {
    return hasPropertyEnglishSeo(property) || hasSiteEnglishSeo(seo);
  }

  const path = normalizePathname(pathname);
  if (path === '/') {
    return hasSiteEnglishSeo(seo);
  }

  const slug = path.slice(1);
  const landingKey = LANDING_KEY_BY_PATH.get(path);

  if (landingKey) {
    const cmsEnglish = await getStaticPageEnglishSeoAvailable(landingKey);
    return cmsEnglish || seoLandingHasEnglishConfig(landingKey) || hasSiteEnglishSeo(seo);
  }

  if (slug === 'propiedades' || slug === 'nosotros' || slug === 'contacto') {
    const cmsEnglish = await getStaticPageEnglishSeoAvailable(slug);
    return cmsEnglish || hasSiteEnglishSeo(seo);
  }

  if (slug.startsWith('proyectos/') || slug.startsWith('propiedades/')) {
    return hasSiteEnglishSeo(seo);
  }

  const cmsEnglish = await getStaticPageEnglishSeoAvailable(slug);
  return cmsEnglish || hasSiteEnglishSeo(seo);
}
