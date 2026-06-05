export function getPropertyVideoWatchPath(slug: string) {
  return `/propiedades/${slug}/video` as const;
}

export function getPropertyVirtualTourWatchPath(slug: string) {
  return `/propiedades/${slug}/tour-virtual` as const;
}
