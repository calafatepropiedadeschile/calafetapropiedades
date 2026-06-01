export type CatalogPublishChecklistInput = {
  type?: string;
  price?: number | null;
  titleEs?: string;
  descriptionEs?: string;
  descriptionEn?: string | null;
  cityEs?: string;
  zoneEs?: string;
  lotSurfaceM2?: number | null;
  totalArea?: number | null;
  area?: number | null;
  builtArea?: number | null;
  totalLots?: number | null;
  availableLots?: number | null;
  images?: string[];
  coverImage?: string | null;
};

export type CatalogPublishChecklistItem = {
  id: string;
  label: string;
  hint?: string;
  ok: boolean;
  required: boolean;
};

function hasPositiveNumber(...values: Array<number | null | undefined>) {
  return values.some((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
}

function hasText(value: string | undefined, minLength: number) {
  return (value?.trim().length ?? 0) >= minLength;
}

export function getCatalogPublishChecklist(
  values: CatalogPublishChecklistInput
): CatalogPublishChecklistItem[] {
  const hasPhotos = (values.images?.length ?? 0) > 0 || Boolean(values.coverImage?.trim());
  const hasSurface = hasPositiveNumber(
    values.lotSurfaceM2,
    values.totalArea,
    values.area,
    values.builtArea
  );
  const isTerreno = values.type === 'terreno';
  const isProject = isTerreno && hasPositiveNumber(values.totalLots);

  const items: CatalogPublishChecklistItem[] = [
    {
      id: 'photos',
      label: 'Al menos una fotografia o imagen de portada',
      ok: hasPhotos,
      required: true,
    },
    {
      id: 'title',
      label: 'Titulo en espanol',
      hint: 'Aparece en búsqueda del catálogo',
      ok: hasText(values.titleEs, 5),
      required: true,
    },
    {
      id: 'type',
      label: 'Tipo de propiedad (terreno o casa)',
      hint: 'Filtro "Tipo" en el catálogo',
      ok: values.type === 'terreno' || values.type === 'casa',
      required: true,
    },
    {
      id: 'price',
      label: 'Precio desde',
      hint: 'Filtros de precio minimo y maximo',
      ok: hasPositiveNumber(values.price),
      required: true,
    },
    {
      id: 'location',
      label: 'Localidad y zona en espanol',
      hint: 'Filtro por zona y búsqueda por ubicación',
      ok: hasText(values.cityEs, 2) && hasText(values.zoneEs, 2),
      required: true,
    },
    {
      id: 'surface',
      label: 'Superficie en m2 (lote, total, construida o area)',
      hint: 'Filtro "Superficie mínima" del catálogo',
      ok: hasSurface,
      required: false,
    },
    {
      id: 'description',
      label: 'Descripcion en espanol',
      hint: 'Mejora la búsqueda por texto en el catálogo',
      ok: hasText(values.descriptionEs, 20),
      required: false,
    },
    {
      id: 'descriptionEn',
      label: 'Descripcion en ingles (opcional)',
      hint: 'Evita el aviso en la ficha cuando el visitante usa English',
      ok: hasText(values.descriptionEn ?? undefined, 20),
      required: false,
    },
  ];

  if (isProject) {
    items.push({
      id: 'availableLots',
      label: 'Cantidad de lotes disponibles',
      hint: 'Filtro "Solo con lotes disponibles" (puede ser 0 si esta agotado)',
      ok: typeof values.availableLots === 'number' && Number.isFinite(values.availableLots) && values.availableLots >= 0,
      required: false,
    });
  }

  return items;
}

export function summarizeCatalogPublishChecklist(items: CatalogPublishChecklistItem[]) {
  const required = items.filter((item) => item.required);
  const recommended = items.filter((item) => !item.required);
  const requiredDone = required.filter((item) => item.ok).length;
  const recommendedDone = recommended.filter((item) => item.ok).length;

  return {
    requiredDone,
    requiredTotal: required.length,
    recommendedDone,
    recommendedTotal: recommended.length,
    missingRequired: required.filter((item) => !item.ok),
    missingRecommended: recommended.filter((item) => !item.ok),
    isReadyToPublish: required.every((item) => item.ok),
  };
}
