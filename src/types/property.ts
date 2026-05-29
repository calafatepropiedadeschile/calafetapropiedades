export type PropertyType = 'casa' | 'apartamento' | 'local' | 'oficina' | 'terreno';
export type PropertyStatus = 'disponible' | 'vendido' | 'alquilado';
export type PriceType = 'venta' | 'alquiler';
export type Currency = 'USD' | 'EUR' | 'MXN';
export type PropertyMarketRegion = 'espana_europa' | 'mexico' | 'latam' | 'centroamerica' | 'estados_unidos';

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
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
  services: string[];
  amenities: string[];
  images: string[];
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  price: number;
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
  bedrooms?: number;
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
