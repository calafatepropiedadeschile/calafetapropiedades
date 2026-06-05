import type { PropertyCard } from '@/types/property';

export const PROPERTY_LOCATION_FILTERS = [
  { value: '', label: 'Todas las zonas' },
  { value: 'valdivia', label: 'Valdivia / Los Rios' },
  { value: 'los-muermos', label: 'Los Muermos' },
  { value: 'puerto-montt', label: 'Puerto Montt' },
  { value: 'maule', label: 'Maule / San Rafael' },
  { value: 'los-lagos', label: 'Los Lagos' },
  { value: 'la-araucania', label: 'La Araucania' },
  { value: 'patagonia', label: 'Toda la Patagonia' },
] as const;

const ZONE_ALIASES: Record<string, string[]> = {
  valdivia: ['Valdivia', 'Mariquina', 'San Jose de la Mariquina', 'Los Rios', 'Region de Los Rios'],
  'los-muermos': ['Los Muermos', 'Putrautrao', 'Quillahua'],
  'puerto-montt': ['Puerto Montt', 'Las Quemas'],
  maule: ['San Rafael', 'Region del Maule', 'Maule'],
  'los-lagos': ['Los Muermos', 'Putrautrao', 'Quillahua', 'Las Quemas', 'Puerto Montt'],
  'la-araucania': ['La Araucania', 'Araucania'],
  patagonia: ['Los Muermos', 'Putrautrao', 'Quillahua', 'Las Quemas', 'Puerto Montt', 'San Jose de la Mariquina', 'Mariquina'],
};

export function normalizeZoneFilter(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getPropertyZoneFilterValues(zone: string) {
  const normalized = normalizeZoneFilter(zone);
  return ZONE_ALIASES[normalized] ?? [zone];
}

export function propertyMatchesZoneFilter(property: PropertyCard, zone: string) {
  if (!zone) return true;

  const acceptedValues = getPropertyZoneFilterValues(zone).map((value) => value.toLowerCase());
  const propertyValues = [property.zone, property.city, property.country ?? ''].map((value) => value.toLowerCase());

  return acceptedValues.some((acceptedValue) => propertyValues.includes(acceptedValue));
}
