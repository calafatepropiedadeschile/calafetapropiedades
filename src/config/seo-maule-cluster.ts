export const MAULE_LANDING_PATHS = ['/parcelas-en-maule'] as const;

export type MauleLandingPath = (typeof MAULE_LANDING_PATHS)[number];

export interface SeoRegionalPageLink {
  label: string;
  href: string;
  description: string;
}

const MAULE_CLUSTER_LINKS: SeoRegionalPageLink[] = [
  {
    label: 'Parcelas en Maule',
    href: '/parcelas-en-maule',
    description: 'Parcelas en venta en San Rafael y la Región del Maule.',
  },
  {
    label: 'Praderas del Maule',
    href: '/proyectos/praderas-del-maule',
    description: 'Parcelas de 5.000 m² en San Rafael, cerca de Talca.',
  },
  {
    label: 'Parcelas en Valdivia',
    href: '/parcelas-en-valdivia',
    description: 'Proyectos en Los Ríos, cerca de Valdivia.',
  },
];

export function getMauleClusterLinks(currentPath: string): SeoRegionalPageLink[] {
  return MAULE_CLUSTER_LINKS.filter((link) => link.href !== currentPath);
}

export const MAULE_BREADCRUMB_PARENT = {
  label: 'Proyectos',
  href: '/proyectos',
} as const;

export function getMauleRelatedPagesSection(currentPath: string) {
  return {
    title: 'Guías y proyectos en el sur y centro de Chile',
    links: getMauleClusterLinks(currentPath),
  };
}
