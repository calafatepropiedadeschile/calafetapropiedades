import type { Locale } from '@/lib/i18n/config';
import { isRentalPriceType } from '@/features/properties/price-type';

export function formatPrice(price: number, currency: string = 'CLP'): string {
  if (currency === 'CLF') {
    return `${price.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF`;
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPropertyPrice(
  price: number,
  currency: string,
  options?: { priceFrom?: boolean; locale?: Locale; priceType?: string | null }
) {
  const formatted = formatPrice(price, currency);
  const rentalSuffix = isRentalPriceType(options?.priceType)
    ? (options?.locale === 'en' ? '/mo' : '/mes')
    : '';

  if (!options?.priceFrom) {
    return `${formatted}${rentalSuffix}`;
  }

  const prefix = options.locale === 'en' ? 'From ' : 'Desde ';
  return `${prefix}${formatted}${rentalSuffix}`;
}

export function formatArea(area: number | null): string {
  if (!area) return '';
  return `${area.toLocaleString('es-CL')} m2`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  local: 'Local Comercial',
  oficina: 'Oficina',
  terreno: 'Terreno',
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  vendido: 'Vendido',
  alquilado: 'Alquilado',
};

export const PRICE_TYPE_LABELS: Record<string, string> = {
  venta: 'Venta',
  arriendo: 'Arriendo',
};

export function getPropertyStatusLabel(status: string, priceType?: string | null) {
  if (status === 'vendido' && priceType === 'arriendo') {
    return 'Arrendado';
  }
  return PROPERTY_STATUS_LABELS[status] ?? status;
}
