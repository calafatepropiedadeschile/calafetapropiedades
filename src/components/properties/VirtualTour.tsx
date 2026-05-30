'use client';

import { useEffect, useRef, useState } from 'react';

interface VirtualTourProps {
  src: string;
  title: string;
}

export default function VirtualTour({ src, title }: VirtualTourProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Return early if no browser support for IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      const timeout = globalThis.setTimeout(() => setShouldLoad(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // Disconnect once triggered
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before the element enters the viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          allowFullScreen
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--color-primary-light)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Cargando Tour Virtual interactivo...
          </span>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
