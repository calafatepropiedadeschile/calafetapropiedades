import type { PriceType } from '@/types/property';

export const PRICE_TYPES = ['venta', 'arriendo'] as const satisfies readonly PriceType[];

export function isPriceType(value: string): value is PriceType {
  return (PRICE_TYPES as readonly string[]).includes(value);
}

export function isRentalPriceType(priceType: string | null | undefined) {
  return priceType === 'arriendo';
}
