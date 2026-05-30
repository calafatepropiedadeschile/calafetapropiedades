/**
 * Framer Motion variants limited to GPU-composited properties (opacity + transform).
 * Avoid animating layout-affecting properties (width, height, margin, padding).
 */

export const STAGGER_GRID_CONTAINER = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

/** Fade-up via translateY (composited transform layer). */
export const STAGGER_CARD_FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

/** Reduced-motion fallback: opacity only (no translate). */
export const STAGGER_CARD_FADE_ONLY = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
} as const;

export const SCROLL_REVEAL_VIEWPORT = {
  once: true,
  amount: 0.1,
} as const;
