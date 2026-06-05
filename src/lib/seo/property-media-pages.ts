import { getPreferredProjectCanonicalPath } from '@/lib/seo/project-landings';

export function getPropertyVideoWatchPath(slug: string) {
  return `${getPreferredProjectCanonicalPath(slug)}/video` as const;
}

export function getPropertyVirtualTourWatchPath(slug: string) {
  return `${getPreferredProjectCanonicalPath(slug)}/tour-virtual` as const;
}
