import type { Locale, SupportedCurrency } from '@/lib/i18n/config';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import type { Property } from '@/types/property';
import type { ExchangeRates } from '@/lib/currency/types';
import { formatArea, formatPropertyPrice } from '@/lib/utils/formatters';
import { shouldShowPriceFrom } from './property-land-options';

export type CommercialHighlight = {
  id: string;
  label: string;
  value: string;
  emphasis?: boolean;
};

export function buildCommercialHighlights(
  property: Property,
  locale: Locale,
  options?: {
    displayCurrency?: SupportedCurrency;
    rates?: ExchangeRates;
  },
): CommercialHighlight[] {
  const t = (key: TranslationKey) => translate(locale, key);
  const items: CommercialHighlight[] = [];

  if (property.type === 'terreno') {
    if (property.lotSurfaceM2) {
      items.push({
        id: 'surface',
        label: t('property.lotSurface'),
        value: formatArea(property.lotSurfaceM2),
      });
    }

    if (property.availableLots != null) {
      items.push({
        id: 'available',
        label: t('property.availableLots'),
        value: `${property.availableLots}`,
        emphasis: property.availableLots > 0,
      });
    } else if (property.totalLots != null) {
      items.push({
        id: 'total-lots',
        label: t('property.totalLots'),
        value: `${property.totalLots}`,
      });
    }

    if (property.waterStatus) {
      items.push({ id: 'water', label: t('property.waterLabel'), value: property.waterStatus });
    }

    if (property.electricityStatus) {
      items.push({ id: 'electricity', label: t('property.electricityLabel'), value: property.electricityStatus });
    }

    if (property.roadType) {
      items.push({ id: 'road', label: t('property.roadLabel'), value: property.roadType });
    }

    if (property.accessType) {
      items.push({ id: 'access', label: t('property.accessLabel'), value: property.accessType });
    }

    if (property.hasOwnRol) {
      items.push({ id: 'rol', label: 'Rol', value: 'Rol propio' });
    }
  } else {
    if (property.bedrooms != null) {
      items.push({
        id: 'bedrooms',
        label: t('property.bedrooms'),
        value: `${property.bedrooms}`,
      });
    }

    if (property.bathrooms != null) {
      items.push({
        id: 'bathrooms',
        label: t('property.bathrooms'),
        value: `${property.bathrooms}`,
      });
    }

    const surface = property.builtArea ?? property.area;
    if (surface) {
      items.push({
        id: 'built',
        label: t('property.builtArea'),
        value: formatArea(surface),
      });
    }
  }

  items.push({
    id: 'zone',
    label: t('property.zone'),
    value: [property.zone, property.city].filter(Boolean).join(', '),
  });

  if (items.length < 4) {
    items.unshift({
      id: 'price',
      label: property.priceType === 'arriendo' ? t('property.forRent') : t('property.forSale'),
      value: formatPropertyPrice(property.price, property.currency, {
        priceFrom: shouldShowPriceFrom(property),
        locale,
        priceType: property.priceType,
        displayCurrency: options?.displayCurrency,
        rates: options?.rates,
      }),
      emphasis: true,
    });
  }

  return items;
}
