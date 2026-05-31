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
  /** Si false, no expone hreflang `en` (evita indexar ingles sin contenido). */
  includeEnglish?: boolean;
};

export type PageAlternates = {
  canonical: string;
  languages: Record<string, string>;
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

  const languages: Record<string, string> = {
    'es-CL': esUrl,
  };

  if (options?.includeEnglish) {
    languages.en = enUrl;
  }

  return {
    canonical,
    languages,
  };
}

export function buildSitemapLanguageAlternates(
  siteUrl: string,
  pathname: string,
  options?: { includeEnglish?: boolean },
) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const esUrl = `${siteUrl}${path}`;
  const languages: Record<string, string> = {
    'es-CL': esUrl,
  };

  if (options?.includeEnglish) {
    languages.en = `${esUrl}?lang=en`;
  }

  return { languages };
}
