import { unstable_cache } from 'next/cache';
import {
  buildGoogleMapsEmbedFromCoordinates,
  buildGoogleMapsEmbedUrl,
  extractGoogleMapsCoordinates,
  isShortGoogleMapsRedirectUrl,
} from './google-maps-embed';

export type ResolvedGoogleMapLink = {
  embedUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  resolvedUrl: string | null;
};

async function fetchResolvedGoogleMapsUrl(mapUrl: string): Promise<string> {
  const response = await fetch(mapUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'User-Agent': 'CalafatePropiedades/1.0 (+https://calafatepropiedades.vercel.app)',
      Accept: 'text/html,application/xhtml+xml',
    },
    cache: 'no-store',
  });

  return response.url;
}

export async function resolveGoogleMapsLink(mapUrl: string): Promise<ResolvedGoogleMapLink> {
  const trimmed = mapUrl.trim();
  if (!trimmed) {
    return { embedUrl: null, latitude: null, longitude: null, resolvedUrl: null };
  }

  let finalUrl = trimmed;

  if (isShortGoogleMapsRedirectUrl(trimmed)) {
    try {
      finalUrl = await fetchResolvedGoogleMapsUrl(trimmed);
    } catch (error) {
      console.warn('No se pudo resolver enlace corto de Google Maps:', trimmed, error);
      return { embedUrl: null, latitude: null, longitude: null, resolvedUrl: null };
    }
  }

  const coords = extractGoogleMapsCoordinates(finalUrl);
  const embedUrl = coords
    ? buildGoogleMapsEmbedFromCoordinates(coords.lat, coords.lng)
    : buildGoogleMapsEmbedUrl(finalUrl);

  return {
    embedUrl,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    resolvedUrl: finalUrl,
  };
}

export function getResolvedGoogleMapsLink(mapUrl: string | null | undefined) {
  const trimmed = mapUrl?.trim();
  if (!trimmed) {
    return Promise.resolve<ResolvedGoogleMapLink>({
      embedUrl: null,
      latitude: null,
      longitude: null,
      resolvedUrl: null,
    });
  }

  return unstable_cache(
    () => resolveGoogleMapsLink(trimmed),
    ['google-maps-resolve', trimmed],
    { revalidate: 86400, tags: ['google-maps', `map-url-${encodeURIComponent(trimmed)}`] },
  )();
}
