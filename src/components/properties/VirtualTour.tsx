'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface VirtualTourProps {
  src: string;
  title: string;
  /** Mantiene el iframe montado pero oculto (evita flash negro al cambiar pestañas). */
  visible?: boolean;
}

export default function VirtualTour({
  src,
  title,
  visible = true,
}: VirtualTourProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldRenderIframe = shouldLoad;

  useEffect(() => {
    if (shouldRenderIframe) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      const timeout = globalThis.setTimeout(() => setShouldLoad(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    const node = containerRef.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [shouldRenderIframe, visible]);

  return (
    <div
      ref={containerRef}
      className={`virtual-tour-root${visible ? ' is-visible' : ' is-hidden'}`}
      aria-hidden={!visible}
    >
      {shouldRenderIframe ? (
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          className="virtual-tour-iframe"
          allow="accelerometer; autoplay; fullscreen; gyroscope; magnetometer; xr-spatial-tracking"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="virtual-tour-placeholder">
          <div className="virtual-tour-spinner" aria-hidden />
          <span>{t('masterplan.loadingTour')}</span>
        </div>
      )}
    </div>
  );
}
