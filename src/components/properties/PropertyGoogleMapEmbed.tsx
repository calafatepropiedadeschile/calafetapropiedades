'use client';

import Link from 'next/link';
import { buildGoogleMapsEmbedUrl } from '@/lib/maps/google-maps-embed';

interface Props {
  mapUrl: string;
  openLabel: string;
}

export default function PropertyGoogleMapEmbed({ mapUrl, openLabel }: Props) {
  const embedSrc = buildGoogleMapsEmbedUrl(mapUrl);

  return (
    <div className="property-widget-embed">
      <iframe
        src={embedSrc}
        title={openLabel}
        className="property-widget-embed__iframe"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
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
