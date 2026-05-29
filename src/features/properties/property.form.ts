import type { PropertyInput } from './property.schemas';
import { PropertySchema } from './property.schemas';
import { getMarketRegionForCountry, isPropertyMarketRegion } from './property-markets';

function optionalString(value: FormDataEntryValue | null): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

function optionalFloat(value: FormDataEntryValue | null): number | null {
  const text = optionalString(value);
  return text ? Number.parseFloat(text) : null;
}

function optionalInt(value: FormDataEntryValue | null): number | null {
  const text = optionalString(value);
  return text ? Number.parseInt(text, 10) : null;
}

function commaList(value: FormDataEntryValue | null): string[] {
  return typeof value === 'string'
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
}

function formList(formData: FormData, name: string): string[] {
  const values = formData.getAll(name).filter((value): value is string => typeof value === 'string');

  if (values.length > 1) {
    return values.map((item) => item.trim()).filter(Boolean);
  }

  return commaList(values[0] ?? null);
}

function newlineList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split('\n')
    .map((item) => item.trim().replace(/\s+/g, ''))
    .filter(Boolean)
    .reduce<string[]>((items, item) => {
      if (item.startsWith('/') && items.length > 0) {
        items[items.length - 1] = `${items[items.length - 1]}${item}`;
        return items;
      }

      items.push(item);
      return items;
    }, []);
}

function optionalUrl(value: FormDataEntryValue | null): string | null {
  const text = optionalString(value);
  return text ? text.replace(/\s+/g, '') : null;
}

export function parsePropertyFormData(formData: FormData): PropertyInput {
  const country = optionalString(formData.get('country')) ?? 'Espana';
  const marketRegion = optionalString(formData.get('marketRegion'));

  const parsed = PropertySchema.safeParse({
    titleEs: formData.get('titleEs'),
    titleEn: optionalString(formData.get('titleEn')),
    descriptionEs: formData.get('descriptionEs'),
    descriptionEn: optionalString(formData.get('descriptionEn')),
    price: Number.parseFloat(String(formData.get('price') ?? '')),
    priceType: formData.get('priceType'),
    currency: optionalString(formData.get('currency')) ?? 'USD',
    zoneEs: formData.get('zoneEs'),
    zoneEn: optionalString(formData.get('zoneEn')),
    cityEs: formData.get('cityEs'),
    cityEn: optionalString(formData.get('cityEn')),
    address: optionalString(formData.get('address')),
    province: optionalString(formData.get('province')),
    country,
    marketRegion: isPropertyMarketRegion(marketRegion) ? marketRegion : getMarketRegionForCountry(country),
    postalCode: optionalString(formData.get('postalCode')),
    addressVisibility: optionalString(formData.get('addressVisibility')) ?? 'zona',
    latitude: optionalFloat(formData.get('latitude')),
    longitude: optionalFloat(formData.get('longitude')),
    type: formData.get('type'),
    status: optionalString(formData.get('status')) ?? 'disponible',
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    bedrooms: optionalInt(formData.get('bedrooms')),
    bathrooms: optionalInt(formData.get('bathrooms')),
    area: optionalFloat(formData.get('area')),
    totalArea: optionalFloat(formData.get('totalArea')),
    builtArea: optionalFloat(formData.get('builtArea')),
    yearBuilt: optionalInt(formData.get('yearBuilt')),
    expenses: optionalFloat(formData.get('expenses')),
    parking: optionalInt(formData.get('parking')),
    internalCode: optionalString(formData.get('internalCode')),
    agentName: optionalString(formData.get('agentName')),
    agentPhone: optionalString(formData.get('agentPhone')),
    agentEmail: optionalString(formData.get('agentEmail')),
    frontage: optionalFloat(formData.get('frontage')),
    depth: optionalFloat(formData.get('depth')),
    zoning: optionalString(formData.get('zoning')),
    services: formList(formData, 'services'),
    amenities: formList(formData, 'amenities'),
    images: newlineList(formData.get('images')),
    coverImage: optionalUrl(formData.get('coverImage')),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.');
    const message = issue?.message ?? 'Datos de propiedad invalidos';

    throw new Error(path ? `${path}: ${message}` : message);
  }

  return parsed.data;
}

export function toPropertyPersistenceData(input: PropertyInput) {
  return {
    ...input,
    area: input.builtArea ?? input.totalArea ?? input.area,
    coverImage: input.coverImage ?? input.images[0] ?? null,
    services: JSON.stringify(input.services),
    amenities: JSON.stringify(input.amenities),
    images: JSON.stringify(input.images),
  };
}
