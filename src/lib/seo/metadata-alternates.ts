import type { Metadata } from 'next';
import {
  buildCanonicalUrl,
  getDefaultCanonicalBaseUrl,
  normalizeCanonicalBaseUrl,
  normalizeOptionalCanonicalUrl,
} from '@/config/seo-url';

export type PageAlternatesOptions = {
  baseUrl?: string;
  locale?: 'en' | 'es';
  customCanonical?: string | null;
};

export type PageAlternates = {
  canonical: string;
  languages: {
    'es-CL': string;
    en: string;
  };
};

/** hreflang + canonical alineados con `?lang=en` del sitemap. */
export function buildPageAlternates(
  pathname: string,
  options?: PageAlternatesOptions,
): PageAlternates {
  const base = normalizeCanonicalBaseUrl(options?.baseUrl ?? getDefaultCanonicalBaseUrl());
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const esUrl = buildCanonicalUrl(base, path);
  const enUrl = buildCanonicalUrl(base, path, { locale: 'en' });
  const canonical =
    normalizeOptionalCanonicalUrl(options?.customCanonical, base)
    ?? (options?.locale === 'en' ? enUrl : esUrl);

  return {
    canonical,
    languages: {
      'es-CL': esUrl,
      en: enUrl,
    },
  };
}

export function buildSitemapLanguageAlternates(siteUrl: string, pathname: string) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const esUrl = `${siteUrl}${path}`;
  return {
    languages: {
      'es-CL': esUrl,
      en: `${esUrl}?lang=en`,
    },
  };
}
