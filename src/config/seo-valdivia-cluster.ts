export const VALDIVIA_LANDING_PATHS = [
  '/parcelas-en-valdivia',
  '/terrenos-en-valdivia',
  '/loteos-en-valdivia',
  '/parcelas-baratas-valdivia',
] as const;

export type ValdiviaLandingPath = (typeof VALDIVIA_LANDING_PATHS)[number];

export interface SeoRelatedPageLink {
  label: string;
  href: string;
  description: string;
}

const VALDIVIA_CLUSTER_LINKS: SeoRelatedPageLink[] = [
  {
    label: 'Parcelas en Valdivia',
    href: '/parcelas-en-valdivia',
    description: 'Parcelas en venta cerca de Valdivia y en Los Ríos.',
  },
  {
    label: 'Terrenos en Valdivia',
    href: '/terrenos-en-valdivia',
    description: 'Terrenos rurales y lotes en la Región de Los Ríos.',
  },
  {
    label: 'Loteos en Valdivia',
    href: '/loteos-en-valdivia',
    description: 'Proyectos de loteo con lotes desde 5.000 m².',
  },
  {
    label: 'Parcelas baratas en Valdivia',
    href: '/parcelas-baratas-valdivia',
    description: 'Opciones económicas con precio publicado y asesoría comercial.',
  },
  {
    label: 'Proyecto Vive Puquila',
    href: '/proyectos/vive-puquila',
    description: 'Loteo rural en Mariquina, a minutos de Valdivia.',
  },
];

export function getValdiviaClusterLinks(currentPath: string): SeoRelatedPageLink[] {
  return VALDIVIA_CLUSTER_LINKS.filter((link) => link.href !== currentPath);
}

export function isValdiviaLandingPath(path: string): path is ValdiviaLandingPath {
  return (VALDIVIA_LANDING_PATHS as readonly string[]).includes(path);
}

export const VALDIVIA_BREADCRUMB_PARENT = {
  label: 'Proyectos',
  href: '/proyectos',
} as const;

export function getValdiviaRelatedPagesSection(currentPath: string) {
  return {
    title: 'Guías de propiedades en Valdivia y Los Ríos',
    links: getValdiviaClusterLinks(currentPath),
  };
}
