import { projectLandingSlugs } from '@/config/project-landing-slugs';
import { seoLandingPages } from '@/config/seo-pages';

/** Enlaces públicos de descubrimiento SEO (panel admin → verificar tras guardar). */
export const ADMIN_SEO_DISCOVERY_LINKS = [
  { label: 'robots.txt', path: '/robots.txt' },
  { label: 'sitemap.xml', path: '/sitemap.xml' },
  { label: 'llms.txt', path: '/llms.txt' },
  { label: 'llms-full.txt', path: '/llms-full.txt' },
  { label: 'Guía para IA', path: '/sobre-calafate' },
] as const;

export const ADMIN_REGIONAL_LANDING_PATHS = Object.values(seoLandingPages)
  .map((page) => page.path)
  .filter((path) => path.includes('-en-') || path.includes('baratas'));

export const ADMIN_PROJECT_LANDING_SLUGS = [...projectLandingSlugs];
