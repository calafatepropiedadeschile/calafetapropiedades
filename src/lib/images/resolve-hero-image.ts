/** Prefer WebP default hero (see `public/heroe.webp` + `npm run optimize:hero`). */
export function resolveHeroImageUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (trimmed === '/heroe.jpg' || trimmed.endsWith('/heroe.jpg')) {
    return '/heroe.webp';
  }
  return trimmed;
}

export function isOptimizableLocalImage(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//');
}
