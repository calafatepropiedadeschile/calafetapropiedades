export type PropertyType = 'casa' | 'terreno';
export type PropertyStatus = 'disponible' | 'vendido';
export type PriceType = 'venta' | 'arriendo';
export type Currency = 'CLP' | 'CLF' | 'USD';
export type PropertyMarketRegion = 'latam';

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceFrom: boolean;
  priceType: PriceType;
  currency: Currency;
  zone: string;
  city: string;
  address: string | null;
  province: string | null;
  country: string | null;
  marketRegion: PropertyMarketRegion;
  postalCode: string | null;
  addressVisibility: 'exacta' | 'aproximada' | 'zona';
  latitude: number | null;
  longitude: number | null;
  type: PropertyType;
  status: PropertyStatus;
  published: boolean;
  featured: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  totalArea: number | null;
  builtArea: number | null;
  yearBuilt: number | null;
  expenses: number | null;
  parking: number | null;
  internalCode: string | null;
  agentName: string | null;
  agentPhone: string | null;
  agentEmail: string | null;
  frontage: number | null;
  depth: number | null;
  zoning: string | null;
  mapUrl: string | null;
  virtualTourUrl: string | null;
  lotSurfaceM2: number | null;
  totalLots: number | null;
  availableLots: number | null;
  stageName: string | null;
  paymentTerms: string | null;
  commissionPercent: number | null;
  operationalExpenses: string | null;
  reservationAmount: number | null;
  waterStatus: string | null;
  electricityStatus: string | null;
  accessType: string | null;
  roadType: string | null;
  hasOwnRol: boolean;
  availabilityNotes: string | null;
  commercialNotes: string | null;
  distanceHighlights: string[];
  services: string[];
  amenities: string[];
  images: string[];
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  seoTitleEs?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionEs?: string | null;
  seoDescriptionEn?: string | null;
  customCanonical?: string | null;
  ogImage?: string | null;
}

export interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  price: number;
  priceFrom: boolean;
  priceType: PriceType;
  currency: Currency;
  zone: string;
  city: string;
  country: string | null;
  marketRegion: PropertyMarketRegion;
  type: PropertyType;
  status: PropertyStatus;
  featured: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  lotSurfaceM2: number | null;
  totalLots: number | null;
  availableLots: number | null;
  coverImage: string | null;
}

export interface PropertyFilters {
  query?: string;
  type?: PropertyType | '';
  priceType?: PriceType | '';
  marketRegion?: PropertyMarketRegion | '';
  country?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  hasAvailableLots?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: 'pendiente' | 'contactada' | 'cerrada';
  propertyId: string | null;
  createdAt: Date;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
