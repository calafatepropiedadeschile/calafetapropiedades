import { z } from 'zod';
import { PROPERTY_MARKET_REGIONS } from './property-markets';

const requiredPositiveNumber = z.preprocess(
  (value) => typeof value === 'string' ? Number(value) : value,
  z.number().positive('El precio debe ser positivo')
);

const optionalNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isNaN(value)) return null;
    return typeof value === 'string' ? Number(value) : value;
  },
  z.number().min(0).nullable()
);

const optionalCoordinate = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isNaN(value)) return null;
    return typeof value === 'string' ? Number(value) : value;
  },
  z.number().nullable()
);

const optionalInt = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isNaN(value)) return null;
    return typeof value === 'string' ? Number(value) : value;
  },
  z.number().int().min(0).nullable()
);

const optionalEmail = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return typeof value === 'string' && value.trim() === '' ? null : value;
  },
  z.string().email('Email de agente invalido').nullable()
);

export const PropertySchema = z.object({
  titleEs: z.string().min(5, 'El titulo en espanol es requerido (min. 5 carac.)').max(120),
  titleEn: z.string().max(120).optional().nullable(),
  descriptionEs: z.string().min(20, 'La descripcion en espanol es requerida (min. 20 carac.)'),
  descriptionEn: z.string().optional().nullable(),
  price: requiredPositiveNumber,
  priceType: z.enum(['venta', 'alquiler'], { error: 'Selecciona la operacion' }),
  currency: z.enum(['USD', 'EUR', 'MXN']).default('USD'),
  zoneEs: z.string().min(2, 'La zona es requerida'),
  zoneEn: z.string().optional().nullable(),
  cityEs: z.string().min(2, 'La ciudad es requerida'),
  cityEn: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  marketRegion: z.enum(PROPERTY_MARKET_REGIONS).default('latam'),
  postalCode: z.string().optional().nullable(),
  addressVisibility: z.enum(['exacta', 'aproximada', 'zona']).default('zona'),
  latitude: optionalCoordinate.refine((value) => value === null || (value >= -90 && value <= 90), 'Latitud invalida'),
  longitude: optionalCoordinate.refine((value) => value === null || (value >= -180 && value <= 180), 'Longitud invalida'),
  type: z.enum(['casa', 'apartamento', 'local', 'oficina', 'terreno'], { error: 'Selecciona un tipo de inmueble' }),
  status: z.enum(['disponible', 'vendido', 'alquilado'], { error: 'Selecciona un estado' }).default('disponible'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  area: optionalNumber,
  totalArea: optionalNumber,
  builtArea: optionalNumber,
  yearBuilt: optionalInt.refine((value) => value === null || (value >= 1800 && value <= 2100), 'Ano de construccion invalido'),
  expenses: optionalNumber,
  parking: optionalInt,
  internalCode: z.string().optional().nullable(),
  agentName: z.string().optional().nullable(),
  agentPhone: z.string().optional().nullable(),
  agentEmail: optionalEmail,
  frontage: optionalNumber,
  depth: optionalNumber,
  zoning: z.string().optional().nullable(),
  services: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  coverImage: z.string().url().optional().nullable(),
}).superRefine((property, context) => {
  const hasImage = Boolean(property.coverImage) || property.images.length > 0;

  if (property.published && !hasImage) {
    context.addIssue({
      code: 'custom',
      path: ['coverImage'],
      message: 'Agrega al menos una foto antes de publicar.',
    });
  }

  if (property.featured && !property.published) {
    context.addIssue({
      code: 'custom',
      path: ['featured'],
      message: 'Solo puedes destacar una propiedad publicada.',
    });
  }
});

export const PropertyFiltersSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['casa', 'apartamento', 'local', 'oficina', 'terreno', '']).optional(),
  priceType: z.enum(['venta', 'alquiler', '']).optional(),
  marketRegion: z.enum(['espana_europa', 'mexico', 'latam', 'centroamerica', 'estados_unidos', '']).optional(),
  country: z.string().optional(),
  zone: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

export type PropertyInput = z.infer<typeof PropertySchema>;
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
