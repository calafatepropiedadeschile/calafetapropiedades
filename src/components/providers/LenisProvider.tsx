'use client';

import { ReactLenis } from 'lenis/react';
import type { LenisOptions } from 'lenis';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import 'lenis/dist/lenis.css';

interface LenisProviderProps {
  children: React.ReactNode;
}

const LENIS_OPTIONS: LenisOptions = {
  autoRaf: true,
  lerp: 0.08,
  duration: 1.15,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.8,
  infinite: false,
};

/**
 * Global smooth-scroll provider (Lenis).
 * Successor to the deprecated `@studio-freight/react-lenis` — uses `lenis/react`.
 */
export default function LenisProvider({ children }: LenisProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
