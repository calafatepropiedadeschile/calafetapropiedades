import type { Locale } from './config';

/** Ruta interna con ?lang=en cuando el visitante está en inglés. */
export function localizedHref(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale !== 'en') return normalized;
  if (normalized.includes('lang=')) return normalized;
  const separator = normalized.includes('?') ? '&' : '?';
  return `${normalized}${separator}lang=en`;
}

/** mailto: y URLs externas se devuelven sin modificar. */
export function localizedNavHref(href: string, locale: Locale): string {
  if (href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  return localizedHref(href, locale);
}
