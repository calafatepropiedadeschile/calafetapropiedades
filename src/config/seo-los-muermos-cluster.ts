export const LOS_MUERMOS_LANDING_PATHS = [
  '/parcelas-en-los-muermos',
  '/terrenos-en-los-muermos',
] as const;

export type LosMuermosLandingPath = (typeof LOS_MUERMOS_LANDING_PATHS)[number];

export interface SeoRegionalPageLink {
  label: string;
  href: string;
  description: string;
}

const LOS_MUERMOS_CLUSTER_LINKS: SeoRegionalPageLink[] = [
  {
    label: 'Parcelas en Los Muermos',
    href: '/parcelas-en-los-muermos',
    description: 'Parcelas en venta en Los Muermos, Quillahua y Putrautrao.',
  },
  {
    label: 'Terrenos en Los Muermos',
    href: '/terrenos-en-los-muermos',
    description: 'Terrenos rurales y lotes en la Región de Los Lagos.',
  },
  {
    label: 'Portal Los Muermos',
    href: '/proyectos/portal-los-muermos',
    description: 'Proyecto principal con 81 parcelas de 5.000 m².',
  },
  {
    label: 'Parcelas Quillahua',
    href: '/proyectos/parcelas-quillahua',
    description: 'Terrenos con vista al mar y cercanía a la playa.',
  },
  {
    label: 'Parcelas Putrautrao',
    href: '/proyectos/parcelas-putrautrao',
    description: 'Lotes con vista a volcanes y río en Los Muermos.',
  },
];

export function getLosMuermosClusterLinks(currentPath: string): SeoRegionalPageLink[] {
  return LOS_MUERMOS_CLUSTER_LINKS.filter((link) => link.href !== currentPath);
}

export function isLosMuermosLandingPath(path: string): path is LosMuermosLandingPath {
  return (LOS_MUERMOS_LANDING_PATHS as readonly string[]).includes(path);
}

export const LOS_MUERMOS_BREADCRUMB_PARENT = {
  label: 'Proyectos',
  href: '/proyectos',
} as const;

export function getLosMuermosRelatedPagesSection(currentPath: string) {
  return {
    title: 'Guías y proyectos en Los Muermos',
    links: getLosMuermosClusterLinks(currentPath),
  };
}
