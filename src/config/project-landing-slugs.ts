/** Slugs de proyectos con landing canónica en /proyectos/[slug]. */
export const projectLandingSlugs = [
  'praderas-del-maule',
  'portal-los-muermos',
  'vive-puquila',
  'altos-del-tepual',
  'parcelas-quillahua',
  'parcelas-putrautrao',
] as const;

export type ProjectLandingSlug = (typeof projectLandingSlugs)[number];
