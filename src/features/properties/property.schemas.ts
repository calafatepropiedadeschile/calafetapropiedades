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

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') return value === 'true' || value === '1' || value === 'on';
    return value;
  },
  z.boolean().optional()
);

const optionalUrl = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return typeof value === 'string' && value.trim() === '' ? null : value;
  },
  z.string().url('URL invalida').nullable()
);

export const PropertySchema = z.object({
  titleEs: z.string().min(5, 'El titulo en espanol es requerido (min. 5 carac.)').max(120),
  titleEn: z.string().max(120).optional().nullable(),
  descriptionEs: z.string().min(20, 'La descripcion en espanol es requerida (min. 20 carac.)'),
  descriptionEn: z.string().optional().nullable(),
  price: requiredPositiveNumber,
  priceFrom: z.boolean().default(false),
  priceType: z.enum(['venta', 'arriendo'], { error: 'Selecciona la operacion' }).default('venta'),
  currency: z.enum(['CLP', 'CLF', 'USD']).default('CLP'),
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
  type: z.enum(['terreno', 'casa'], { error: 'Selecciona un tipo de inmueble' }),
  status: z.enum(['disponible', 'vendido'], { error: 'Selecciona un estado' }).default('disponible'),
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
  mapUrl: optionalUrl,
  virtualTourUrl: optionalUrl,
  lotSurfaceM2: optionalNumber,
  totalLots: optionalInt,
  availableLots: optionalInt,
  stageName: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  commissionPercent: optionalNumber,
  operationalExpenses: z.string().optional().nullable(),
  reservationAmount: optionalNumber,
  waterStatus: z.string().optional().nullable(),
  electricityStatus: z.string().optional().nullable(),
  accessType: z.string().optional().nullable(),
  roadType: z.string().optional().nullable(),
  hasOwnRol: z.boolean().default(false),
  availabilityNotes: z.string().optional().nullable(),
  commercialNotes: z.string().optional().nullable(),
  distanceHighlights: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  coverImage: z.string().url().optional().nullable(),
  seoTitleEs: z.string().max(70, 'El titulo SEO debe tener maximo 70 caracteres').optional().nullable(),
  seoTitleEn: z.string().max(70, 'El titulo SEO en ingles debe tener maximo 70 caracteres').optional().nullable(),
  seoDescriptionEs: z.string().max(170, 'La descripcion SEO debe tener maximo 170 caracteres').optional().nullable(),
  seoDescriptionEn: z.string().max(170, 'La descripcion SEO en ingles debe tener maximo 170 caracteres').optional().nullable(),
  customCanonical: optionalUrl,
  ogImage: optionalUrl,
}).superRefine((property, context) => {
  const hasImage = Boolean(property.coverImage) || property.images.length > 0;

  if (property.country && property.country !== 'Chile') {
    context.addIssue({
      code: 'custom',
      path: ['country'],
      message: 'La version v1 solo permite propiedades en Chile.',
    });
  }

  if (property.type === 'terreno' && !property.lotSurfaceM2 && !property.totalArea) {
    context.addIssue({
      code: 'custom',
      path: ['lotSurfaceM2'],
      message: 'Agrega la superficie por lote para publicar terrenos o loteos.',
    });
  }

  if (property.availableLots !== null && property.totalLots !== null && property.availableLots > property.totalLots) {
    context.addIssue({
      code: 'custom',
      path: ['availableLots'],
      message: 'Los lotes disponibles no pueden superar el total de lotes.',
    });
  }

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
  type: z.enum(['casa', 'terreno', '']).optional(),
  priceType: z.enum(['venta', 'arriendo', '']).optional(),
  marketRegion: z.enum(['latam', '']).optional(),
  country: z.string().optional(),
  zone: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(),
  hasAvailableLots: optionalBoolean,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

export type PropertyInput = z.infer<typeof PropertySchema>;
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
