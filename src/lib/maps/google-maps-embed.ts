/**
 * Convierte URLs de Google Maps a src de iframe. No usa enlaces cortos (goo.gl / maps.app).
 */

const SHORT_MAP_REDIRECT_HOSTS = new Set([
  'goo.gl',
  'maps.app.goo.gl',
  'g.co',
]);

function parseMapUrl(mapUrl: string): URL | null {
  const trimmed = mapUrl.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

export function isShortGoogleMapsRedirectUrl(mapUrl: string): boolean {
  const parsed = parseMapUrl(mapUrl);
  if (!parsed) return true;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  return SHORT_MAP_REDIRECT_HOSTS.has(host);
}

/**
 * Devuelve URL embed o null si no es seguro embeber (p. ej. maps.app.goo.gl).
 */
export function buildGoogleMapsEmbedUrl(mapUrl: string): string | null {
  if (isShortGoogleMapsRedirectUrl(mapUrl)) {
    return null;
  }

  const parsed = parseMapUrl(mapUrl);
  if (!parsed) return null;

  const host = parsed.hostname.toLowerCase();
  const isGoogleMaps = host.includes('google.')
    && (parsed.pathname.includes('/maps') || host.startsWith('maps.'));

  if (!isGoogleMaps) {
    return null;
  }

  if (parsed.pathname.includes('/embed')) {
    return parsed.toString();
  }

  const embed = new URL(parsed.toString());
  embed.searchParams.set('output', 'embed');
  return embed.toString();
}

export function isEmbeddableMapUrl(mapUrl: string | null | undefined): mapUrl is string {
  if (!mapUrl?.trim()) return false;
  return buildGoogleMapsEmbedUrl(mapUrl) !== null;
}

export function hasExternalMapUrl(mapUrl: string | null | undefined): boolean {
  return Boolean(mapUrl?.trim());
}
