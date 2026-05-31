import type { SeoLandingKey } from '@/config/seo-pages';
import { seoLandingPagesEn } from '@/config/seo-pages-en';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';

export function hasSiteEnglishSeo(seo: SiteSeoSettingsView | null | undefined): boolean {
  return Boolean(seo?.defaultTitleEn?.trim() && seo?.defaultDescriptionEn?.trim());
}

export function hasPropertyEnglishSeo(property: {
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
}): boolean {
  return Boolean(property.seoTitleEn?.trim() || property.seoDescriptionEn?.trim());
}

export function hasStaticPageEnglishSeoFields(page: {
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
} | null | undefined): boolean {
  if (!page) return false;
  return Boolean(page.seoTitleEn?.trim() || page.seoDescriptionEn?.trim());
}

export function seoLandingHasEnglishConfig(key: SeoLandingKey): boolean {
  const localized = seoLandingPagesEn[key];
  return Boolean(localized?.metadataTitle?.trim() && localized?.metadataDescription?.trim());
}
