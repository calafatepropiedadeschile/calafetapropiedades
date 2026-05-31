/**
 * Convierte URLs de Google Maps a src de iframe.
 * Enlaces cortos (maps.app.goo.gl) requieren resolveGoogleMapsLink() en servidor.
 */

const SHORT_MAP_REDIRECT_HOSTS = new Set([
  'goo.gl',
  'maps.app.goo.gl',
  'g.co',
]);

const COORDINATE_PATTERNS = [
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
];

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

export function extractGoogleMapsCoordinates(
  mapUrl: string,
): { lat: number; lng: number } | null {
  for (const pattern of COORDINATE_PATTERNS) {
    const match = pattern.exec(mapUrl);
    if (!match) continue;

    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

export function buildGoogleMapsEmbedFromCoordinates(lat: number, lng: number, zoom = 15): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=${zoom}&output=embed`;
}

/**
 * Devuelve URL embed o null. Para goo.gl usar resolveGoogleMapsLink en servidor.
 */
export function buildGoogleMapsEmbedUrl(mapUrl: string): string | null {
  const coords = extractGoogleMapsCoordinates(mapUrl);
  if (coords) {
    return buildGoogleMapsEmbedFromCoordinates(coords.lat, coords.lng);
  }

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
