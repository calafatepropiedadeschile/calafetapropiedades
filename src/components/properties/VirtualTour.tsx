'use client';

import { useEffect, useRef, useState } from 'react';

interface VirtualTourProps {
  src: string;
  title: string;
  /** Mantiene el iframe montado pero oculto (evita flash negro al cambiar pestañas). */
  visible?: boolean;
  /** Precarga el tour aunque aún no esté visible. */
  eager?: boolean;
}

export default function VirtualTour({
  src,
  title,
  visible = true,
  eager = false,
}: VirtualTourProps) {
  const [shouldLoad, setShouldLoad] = useState(eager || visible);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager || visible) {
      setShouldLoad(true);
    }
  }, [eager, visible]);

  useEffect(() => {
    if (shouldLoad || !visible) return;

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
  }, [shouldLoad, visible]);

  return (
    <div
      ref={containerRef}
      className={`virtual-tour-root${visible ? ' is-visible' : ' is-hidden'}`}
      aria-hidden={!visible}
    >
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          className="virtual-tour-iframe"
          allowFullScreen
          loading="eager"
        />
      ) : (
        <div className="virtual-tour-placeholder">
          <div className="virtual-tour-spinner" aria-hidden />
          <span>Cargando tour virtual...</span>
        </div>
      )}
    </div>
  );
}
