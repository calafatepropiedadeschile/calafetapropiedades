import { getSiteImageUrl } from '@/lib/storage/public-images';

export function isValidImageSource(src: string) {
  if (src.startsWith('/')) return true;

  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function cleanImageSources(images: string[]) {
  return images
    .map((image) => image.trim())
    .filter((image) => image.length > 0 && isValidImageSource(image));
}

export function buildPropertyGalleryImages(coverImage: string | null, images: string[]) {
  const allImages = coverImage && isValidImageSource(coverImage)
    ? [coverImage, ...images.filter((img) => img !== coverImage)]
    : images;
  const fallbackImage = getSiteImageUrl(
    'site/property-detail-fallback.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop'
  );
  const cleanGalleryImages = cleanImageSources(allImages);
  return cleanGalleryImages.length > 0 ? cleanGalleryImages : [fallbackImage];
}
