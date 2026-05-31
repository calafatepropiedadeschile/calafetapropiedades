import { projectLandingSlugs } from '@/config/seo-pages';

const projectLandingSlugSet = new Set<string>(projectLandingSlugs);

export function isProjectLandingSlug(slug: string): boolean {
  return projectLandingSlugSet.has(slug);
}

/** URL canónica preferida para proyectos de parcelas (evita duplicar con /propiedades). */
export function getPreferredProjectCanonicalPath(slug: string): `/proyectos/${string}` | `/propiedades/${string}` {
  return isProjectLandingSlug(slug) ? `/proyectos/${slug}` : `/propiedades/${slug}`;
}
