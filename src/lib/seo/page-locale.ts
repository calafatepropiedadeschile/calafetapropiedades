import type { SeoLandingKey } from '@/config/seo-pages';
import { getStaticPageEnglishSeoAvailable } from '@/features/site-content/static-page';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';
import {
  hasPropertyEnglishSeo,
  hasSiteEnglishSeo,
  seoLandingHasEnglishConfig,
} from '@/lib/seo/english-index';

export async function resolvePageIncludeEnglish(options: {
  seo: SiteSeoSettingsView | null;
  cmsSlug?: string;
  landingKey?: SeoLandingKey;
  property?: {
    seoTitleEn?: string | null;
    seoDescriptionEn?: string | null;
  };
}): Promise<boolean> {
  if (options.property) {
    return hasPropertyEnglishSeo(options.property) || hasSiteEnglishSeo(options.seo);
  }

  if (options.landingKey) {
    const cmsEnglish = await getStaticPageEnglishSeoAvailable(options.landingKey);
    return cmsEnglish || seoLandingHasEnglishConfig(options.landingKey) || hasSiteEnglishSeo(options.seo);
  }

  if (options.cmsSlug) {
    const cmsEnglish = await getStaticPageEnglishSeoAvailable(options.cmsSlug);
    return cmsEnglish || hasSiteEnglishSeo(options.seo);
  }

  return hasSiteEnglishSeo(options.seo);
}
