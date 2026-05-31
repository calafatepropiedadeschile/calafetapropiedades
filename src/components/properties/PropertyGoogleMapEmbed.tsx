'use client';

import Link from 'next/link';
import { buildGoogleMapsEmbedUrl } from '@/lib/maps/google-maps-embed';

interface Props {
  mapUrl: string;
  openLabel: string;
  fallbackHint?: string;
}

export default function PropertyGoogleMapEmbed({
  mapUrl,
  openLabel,
  fallbackHint = 'Abre el mapa en Google Maps para ver la ubicación exacta.',
}: Props) {
  const embedSrc = buildGoogleMapsEmbedUrl(mapUrl);

  return (
    <div className="property-widget-embed">
      {embedSrc ? (
        <iframe
          src={embedSrc}
          title={openLabel}
          className="property-widget-embed__iframe"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="property-widget-embed__fallback" role="note">
          <p className="text-muted">{fallbackHint}</p>
        </div>
      )}
      <div className="property-widget-embed__footer">
        <Link
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          {openLabel}
        </Link>
      </div>
    </div>
  );
}
