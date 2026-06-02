/** Host canónico de marca (Calafate, no "Calafeta"). */
export const CANONICAL_BRAND_HOST = 'calafatepropiedades.com';

/** Dominios erróneos detectados en migraciones / Vercel legacy. */
const CANONICAL_TYPO_HOSTS = [
  'calafetapropiedades.vercel.app',
  'calafatepropiedades.vercel.app',
] as const;

export function getDefaultCanonicalBaseUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL
    || process.env.APP_ORIGIN
    || process.env.AUTH_URL
    || process.env.NEXTAUTH_URL
    || `https://${CANONICAL_BRAND_HOST}`
  ).trim();

  return normalizeCanonicalBaseUrl(raw);
}

/** Corrige typos conocidos y normaliza a origin sin barra final. */
export function normalizeCanonicalBaseUrl(url: string): string {
  const trimmed = fixCanonicalTypoInUrl(url.trim());
  if (!trimmed) return getDefaultCanonicalBaseUrl();

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    parsed.hostname = fixCanonicalTypoInUrl(parsed.hostname);
    return parsed.origin;
  } catch {
    return getDefaultCanonicalBaseUrl();
  }
}

/** Reemplaza hosts mal escritos dentro de cualquier URL canónica. */
export function fixCanonicalTypoInUrl(url: string): string {
  let result = url;
  for (const typo of CANONICAL_TYPO_HOSTS) {
    result = result.replaceAll(typo, CANONICAL_BRAND_HOST);
  }
  return result.replace(/\/$/, '');
}

export function normalizeOptionalCanonicalUrl(
  url: string | null | undefined,
  baseUrl?: string,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const fixed = fixCanonicalTypoInUrl(trimmed);
  if (/^https?:\/\//i.test(fixed)) {
    try {
      const parsed = new URL(fixed);
      const normalizedBase = normalizeCanonicalBaseUrl(parsed.origin);
      return `${normalizedBase}${parsed.pathname}${parsed.search}`.replace(/\/$/, '');
    } catch {
      return null;
    }
  }

  const base = normalizeCanonicalBaseUrl(baseUrl ?? getDefaultCanonicalBaseUrl());
  const path = fixed.startsWith('/') ? fixed : `/${fixed}`;
  return `${base}${path}`;
}

export function buildCanonicalUrl(
  baseUrl: string,
  pathname: string,
  options?: { locale?: 'en' | 'es' },
): string {
  const base = normalizeCanonicalBaseUrl(baseUrl);
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const url = `${base}${path}`;
  return options?.locale === 'en' ? `${url}?lang=en` : url;
}
