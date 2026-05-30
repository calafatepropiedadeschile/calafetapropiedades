import type { TranslationKey } from '@/lib/i18n/dictionaries';
import type { Property, PropertyType } from '@/types/property';

export const LAND_SERVICE_OPTIONS = [
  { value: 'water', labelKey: 'property.serviceAguaPotable' },
  { value: 'electricity', labelKey: 'property.serviceElectricity' },
  { value: 'water_well', labelKey: 'property.serviceAguaPozo' },
  { value: 'gas', labelKey: 'property.serviceGas' },
  { value: 'sewer', labelKey: 'property.serviceSewer' },
  { value: 'internet', labelKey: 'property.serviceInternet' },
  { value: 'asphalt', labelKey: 'property.serviceAsphalt' },
  { value: 'street_lighting', labelKey: 'property.serviceStreetLighting' },
  { value: 'access', labelKey: 'property.serviceAcceso' },
] as const satisfies ReadonlyArray<{ value: string; labelKey: TranslationKey }>;

export const LAND_AMENITY_OPTIONS = [
  { value: 'automated_gate', labelKey: 'property.amenityPorton' },
  { value: 'internal_roads', labelKey: 'property.amenityCaminoInterior' },
  { value: 'stabilized_roads', labelKey: 'property.amenityCaminoEstabilizado' },
  { value: 'volcano_view', labelKey: 'property.amenityVistaVolcanes' },
  { value: 'ocean_view', labelKey: 'property.amenityVistaMar' },
  { value: 'river_view', labelKey: 'property.amenityVistaRio' },
  { value: 'natural_setting', labelKey: 'property.amenityEntornoNatural' },
  { value: 'near_beach', labelKey: 'property.amenityCercaniaPlaya' },
  { value: 'public_road_access', labelKey: 'property.amenityCaminoPublico' },
] as const satisfies ReadonlyArray<{ value: string; labelKey: TranslationKey }>;

const LAND_SERVICE_SLUGS = new Set(LAND_SERVICE_OPTIONS.map((option) => option.value));
const LAND_AMENITY_SLUGS = new Set(LAND_AMENITY_OPTIONS.map((option) => option.value));

const SERVICE_ALIASES: Record<string, string> = {
  electricidad: 'electricity',
  electricity: 'electricity',
  'agua-potable': 'water',
  agua: 'water',
  water: 'water',
  'agua-pozo': 'water_well',
  acceso: 'access',
  access: 'access',
  gas: 'gas',
  alcantarillado: 'sewer',
  sewer: 'sewer',
  internet: 'internet',
  asfalto: 'asphalt',
  asphalt: 'asphalt',
  alumbrado: 'street_lighting',
  'street-lighting': 'street_lighting',
};

const AMENITY_ALIASES: Record<string, string> = {
  porton: 'automated_gate',
  'porton-automatizado': 'automated_gate',
  automated_gate: 'automated_gate',
  'camino-interior': 'internal_roads',
  'camino-ripiado': 'internal_roads',
  internal_roads: 'internal_roads',
  'camino-estabilizado': 'stabilized_roads',
  stabilized_roads: 'stabilized_roads',
  'vista-volcanes': 'volcano_view',
  volcano_view: 'volcano_view',
  'vista-mar': 'ocean_view',
  ocean_view: 'ocean_view',
  'vista-rio': 'river_view',
  river_view: 'river_view',
  'entorno-natural': 'natural_setting',
  natural_setting: 'natural_setting',
  'cercania-playa': 'near_beach',
  near_beach: 'near_beach',
  'camino-publico': 'public_road_access',
  public_road_access: 'public_road_access',
  'rol-propio': 'public_road_access',
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
}

function normalizeList(values: string[], aliases: Record<string, string>, allowed: Set<string>) {
  const normalized = values
    .map((value) => normalizeSlug(value))
    .map((value) => aliases[value] ?? value.replace(/-/g, '_'))
    .filter((value) => allowed.has(value));

  return Array.from(new Set(normalized));
}

export function normalizeLandServices(values: string[]) {
  return normalizeList(values, SERVICE_ALIASES, LAND_SERVICE_SLUGS);
}

export function normalizeLandAmenities(values: string[]) {
  return normalizeList(values, AMENITY_ALIASES, LAND_AMENITY_SLUGS);
}

export function isLandProject(property: Pick<Property, 'type' | 'totalLots'>) {
  return property.type === 'terreno' && (property.totalLots ?? 0) > 1;
}

export function isLandParcel(property: Pick<Property, 'type'>) {
  return property.type === 'terreno';
}

export function shouldShowPriceFrom(property: {
  priceFrom?: boolean;
  type: PropertyType;
  currency: string;
}) {
  if (property.priceFrom) return true;
  return property.type === 'terreno' && property.currency === 'CLF';
}

export function getLandFeatureLabel(
  slug: string,
  kind: 'service' | 'amenity',
  t: (key: TranslationKey) => string
) {
  const options = kind === 'service' ? LAND_SERVICE_OPTIONS : LAND_AMENITY_OPTIONS;
  const match = options.find((option) => option.value === slug);

  if (match) return t(match.labelKey);

  return slug
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
