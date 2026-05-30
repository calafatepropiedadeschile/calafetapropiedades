/**
 * Convierte URLs de Google Maps (incl. maps.app.goo.gl) a un src usable en iframe embed.
 */
export function buildGoogleMapsEmbedUrl(mapUrl: string): string {
  const trimmed = mapUrl.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const isGoogleMaps = parsed.hostname.includes('google.')
      && (parsed.pathname.includes('/maps') || parsed.hostname === 'maps.google.com');

    if (isGoogleMaps) {
      const embed = new URL(trimmed);
      embed.searchParams.set('output', 'embed');
      return embed.toString();
    }
  } catch {
    // URLs sin esquema u otros formatos caen al fallback.
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&hl=es&z=15&output=embed`;
}

export function isEmbeddableMapUrl(mapUrl: string | null | undefined): mapUrl is string {
  return Boolean(mapUrl?.trim());
}
