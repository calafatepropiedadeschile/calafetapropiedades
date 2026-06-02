import type { Prisma } from '@prisma/client';

export const ADMIN_PROPERTIES_PAGE_SIZE = 20;

export type AdminPropertyPublishedFilter = 'todas' | 'publicadas' | 'borradores';
export type AdminPropertyTypeFilter = 'todos' | 'terreno' | 'casa';
export type AdminPropertyProjectFilter = 'todos' | 'proyectos' | 'individuales';
export type AdminPropertyOperationFilter = 'todas' | 'venta' | 'arriendo';

export interface AdminPropertiesListParams {
  q?: string;
  published?: string;
  type?: string;
  project?: string;
  operation?: string;
  page?: string;
}

export function parseAdminPropertiesPage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parsePublishedFilter(value: string | undefined): AdminPropertyPublishedFilter {
  if (value === 'publicadas' || value === 'borradores') return value;
  return 'todas';
}

export function parseTypeFilter(value: string | undefined): AdminPropertyTypeFilter {
  if (value === 'terreno' || value === 'casa') return value;
  return 'todos';
}

export function parseProjectFilter(value: string | undefined): AdminPropertyProjectFilter {
  if (value === 'proyectos' || value === 'individuales') return value;
  return 'todos';
}

export function parseOperationFilter(value: string | undefined): AdminPropertyOperationFilter {
  if (value === 'venta' || value === 'arriendo') return value;
  return 'todas';
}

export function buildAdminPropertiesWhere(params: {
  q: string;
  published: AdminPropertyPublishedFilter;
  type: AdminPropertyTypeFilter;
  project: AdminPropertyProjectFilter;
  operation: AdminPropertyOperationFilter;
}): Prisma.PropertyWhereInput {
  const filters: Prisma.PropertyWhereInput[] = [];

  if (params.published === 'publicadas') {
    filters.push({ published: true });
  } else if (params.published === 'borradores') {
    filters.push({ published: false });
  }

  if (params.type !== 'todos') {
    filters.push({ type: params.type });
  }

  if (params.operation !== 'todas') {
    filters.push({ priceType: params.operation });
  }

  if (params.project === 'proyectos') {
    filters.push({ type: 'terreno', totalLots: { gt: 1 } });
  } else if (params.project === 'individuales') {
    filters.push({
      OR: [
        { type: { not: 'terreno' } },
        { totalLots: null },
        { totalLots: { lte: 1 } },
      ],
    });
  }

  if (params.q) {
    const textMatch = {
      contains: params.q,
      mode: 'insensitive' as const,
    };

    filters.push({
      OR: [
        { titleEs: textMatch },
        { titleEn: textMatch },
        { internalCode: textMatch },
        { zoneEs: textMatch },
        { cityEs: textMatch },
        { slug: textMatch },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : {};
}

export function createAdminPropertiesQueryString(params: {
  q: string;
  published: AdminPropertyPublishedFilter;
  type: AdminPropertyTypeFilter;
  project: AdminPropertyProjectFilter;
  operation: AdminPropertyOperationFilter;
  page?: number;
}) {
  const nextParams = new URLSearchParams();

  if (params.q) nextParams.set('q', params.q);
  if (params.published !== 'todas') nextParams.set('published', params.published);
  if (params.type !== 'todos') nextParams.set('type', params.type);
  if (params.project !== 'todos') nextParams.set('project', params.project);
  if (params.operation !== 'todas') nextParams.set('operation', params.operation);
  if (params.page && params.page > 1) nextParams.set('page', String(params.page));

  const queryString = nextParams.toString();
  return queryString ? `/admin/propiedades?${queryString}` : '/admin/propiedades';
}

export const adminPropertyListSelect = {
  id: true,
  slug: true,
  titleEs: true,
  internalCode: true,
  type: true,
  zoneEs: true,
  cityEs: true,
  price: true,
  priceType: true,
  currency: true,
  country: true,
  lotSurfaceM2: true,
  availableLots: true,
  totalLots: true,
  published: true,
  featured: true,
  status: true,
  coverImage: true,
  images: true,
} as const satisfies Prisma.PropertySelect;

export type AdminPropertyListItem = Prisma.PropertyGetPayload<{
  select: typeof adminPropertyListSelect;
}>;

export function isAdminLandProject(property: Pick<AdminPropertyListItem, 'type' | 'totalLots'>) {
  return property.type === 'terreno' && (property.totalLots ?? 0) > 1;
}
