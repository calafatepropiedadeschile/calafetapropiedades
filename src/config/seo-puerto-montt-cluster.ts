export const PUERTO_MONTT_LANDING_PATHS = [
  '/parcelas-en-puerto-montt',
  '/terrenos-en-puerto-montt',
] as const;

export type PuertoMonttLandingPath = (typeof PUERTO_MONTT_LANDING_PATHS)[number];

export interface SeoRegionalPageLink {
  label: string;
  href: string;
  description: string;
}

const PUERTO_MONTT_CLUSTER_LINKS: SeoRegionalPageLink[] = [
  {
    label: 'Parcelas en Puerto Montt',
    href: '/parcelas-en-puerto-montt',
    description: 'Parcelas en venta en Puerto Montt y Las Quemas.',
  },
  {
    label: 'Terrenos en Puerto Montt',
    href: '/terrenos-en-puerto-montt',
    description: 'Terrenos y lotes en la Región de Los Lagos.',
  },
  {
    label: 'Altos del Tepual',
    href: '/proyectos/altos-del-tepual',
    description: 'Parcelas de 5.000 m² en Las Quemas, Puerto Montt.',
  },
  {
    label: 'Parcelas en Los Muermos',
    href: '/parcelas-en-los-muermos',
    description: 'Proyectos adicionales en Los Muermos, Región de Los Lagos.',
  },
];

export function getPuertoMonttClusterLinks(currentPath: string): SeoRegionalPageLink[] {
  return PUERTO_MONTT_CLUSTER_LINKS.filter((link) => link.href !== currentPath);
}

export const PUERTO_MONTT_BREADCRUMB_PARENT = {
  label: 'Proyectos',
  href: '/proyectos',
} as const;

export function getPuertoMonttRelatedPagesSection(currentPath: string) {
  return {
    title: 'Guías y proyectos en Puerto Montt',
    links: getPuertoMonttClusterLinks(currentPath),
  };
}
