'use client';

import { useMemo, useState } from 'react';
import PropertyCard from '@/components/properties/PropertyCard';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import {
  PROPERTY_MARKET_REGIONS,
  PROPERTY_MARKET_REGION_TRANSLATION_KEYS,
  type PropertyMarketRegion,
} from '@/features/properties/property-markets';
import type { PropertyCard as PropertyCardType, PriceType, PropertyType } from '@/types/property';

const PROPERTY_TYPES: Array<{ value: PropertyType | ''; labelKey: TranslationKey }> = [
  { value: '', labelKey: 'catalog.allTypes' },
  { value: 'casa', labelKey: 'property.house' },
  { value: 'apartamento', labelKey: 'property.apartment' },
  { value: 'local', labelKey: 'property.retail' },
  { value: 'oficina', labelKey: 'property.office' },
  { value: 'terreno', labelKey: 'property.lot' },
];

interface Filters {
  query: string;
  type: PropertyType | '';
  priceType: PriceType | '';
  marketRegion: PropertyMarketRegion | '';
  country: string;
  zone: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  region: string;
}

interface Props {
  properties: PropertyCardType[];
  initialFilters?: Partial<Filters>;
  showPriceModeTabs?: boolean;
}

const initialFilters: Filters = {
  query: '',
  type: '',
  priceType: 'venta',
  marketRegion: '',
  country: '',
  zone: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  region: '',
};

export default function PropertyCatalog({
  properties,
  initialFilters: providedFilters,
  showPriceModeTabs = false,
}: Props) {
  const { t } = useI18n();
  const [filters, setFilters] = useState<Filters>({
    ...initialFilters,
    ...providedFilters,
  });

  const zones = useMemo(
    () => Array.from(new Set(properties.map((property) => property.zone))).sort(),
    [properties]
  );
  const countries = useMemo(
    () => Array.from(new Set(properties.map((property) => property.country).filter((country): country is string => Boolean(country)))).sort(),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const bedrooms = filters.bedrooms ? Number(filters.bedrooms) : null;

    // Helper to group property countries into broader regions
    const getPropertyRegion = (country: string | null): string => {
      if (!country) return '';
      const c = country.trim().toLowerCase();
      
      // España / Europa
      if (['españa', 'espana', 'spain', 'europa', 'europe', 'portugal', 'francia', 'france', 'italia', 'italy', 'alemania', 'germany'].includes(c)) {
        return 'europa';
      }
      
      // México
      if (['méxico', 'mexico'].includes(c)) {
        return 'mexico';
      }
      
      // Estados Unidos
      if (['estados unidos', 'eeuu', 'usa', 'united states', 'us'].includes(c)) {
        return 'usa';
      }
      
      // Centroamérica
      if (['panamá', 'panama', 'costa rica', 'guatemala', 'honduras', 'el salvador', 'nicaragua', 'república dominicana', 'caribe', 'caribbean'].includes(c)) {
        return 'centroamerica';
      }
      
      // LATAM (default for South America and fallback)
      if (['paraguay', 'argentina', 'uruguay', 'chile', 'colombia', 'perú', 'peru', 'ecuador', 'bolivia', 'venezuela', 'brasil', 'brazil', 'latam', 'sudamerica', 'south america'].includes(c)) {
        return 'latam';
      }
      
      return 'latam';
    };

    return properties.filter((property) => {
      const matchesQuery = !query || [property.title, property.zone, property.city]
        .some((value) => value.toLowerCase().includes(query));

      // Match selected region/country
      let matchesRegion = true;
      if (filters.region) {
        const countryLower = property.country?.trim().toLowerCase() ?? '';
        const regionType = getPropertyRegion(property.country);
        
        if (filters.region === 'europa') {
          matchesRegion = regionType === 'europa';
        } else if (filters.region === 'mexico') {
          matchesRegion = regionType === 'mexico';
        } else if (filters.region === 'paraguay') {
          matchesRegion = countryLower === 'paraguay';
        } else if (filters.region === 'latam_others') {
          matchesRegion = regionType === 'latam' && countryLower !== 'paraguay';
        } else if (filters.region === 'centroamerica') {
          matchesRegion = regionType === 'centroamerica';
        } else if (filters.region === 'usa') {
          matchesRegion = regionType === 'usa';
        }
      }

      return (
        matchesQuery &&
        matchesRegion &&
        (!filters.type || property.type === filters.type) &&
        (!filters.priceType || property.priceType === filters.priceType) &&
        (!filters.marketRegion || property.marketRegion === filters.marketRegion) &&
        (!filters.country || property.country === filters.country) &&
        (!filters.zone || property.zone === filters.zone) &&
        (minPrice === null || property.price >= minPrice) &&
        (maxPrice === null || property.price <= maxPrice) &&
        (bedrooms === null || (property.bedrooms ?? 0) >= bedrooms)
      );
    });
  }, [filters, properties]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <div className="property-filter-panel" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-2xl)',
      }}>
        {showPriceModeTabs && (
          <div className="search-tabs catalog-tabs" style={{ marginBottom: 'var(--space-lg)' }}>
            {(['venta', 'alquiler'] as const).map((priceType) => (
              <button
                key={priceType}
                className={`search-tab ${filters.priceType === priceType ? 'active' : ''}`}
                onClick={() => updateFilter('priceType', priceType)}
              >
                {priceType === 'venta' ? t('catalog.buyTab') : t('catalog.rentTab')}
              </button>
            ))}
            <button
              className={`search-tab ${filters.priceType === '' ? 'active' : ''}`}
              onClick={() => updateFilter('priceType', '')}
            >
              {t('catalog.allTab')}
            </button>
          </div>
        )}

        <div className="catalog-filter-grid">
          <div className="input-group">
            <label className="input-label">{t('catalog.search')}</label>
            <input
              className="input"
              placeholder={t('catalog.searchPlaceholder')}
              value={filters.query}
              onChange={(event) => updateFilter('query', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.destination')}</label>
            <select
              className="select"
              value={filters.region}
              onChange={(event) => updateFilter('region', event.target.value)}
            >
              <option value="">{t('catalog.allDestinations')}</option>
              <option value="europa">{t('catalog.regionEurope')}</option>
              <option value="mexico">{t('catalog.regionMexico')}</option>
              <option value="paraguay">{t('catalog.regionParaguay')}</option>
              <option value="latam_others">{t('catalog.regionLatamOthers')}</option>
              <option value="centroamerica">{t('catalog.regionCentralAmerica')}</option>
              <option value="usa">{t('catalog.regionUSA')}</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.propertyType')}</label>
            <select
              className="select"
              value={filters.type}
              onChange={(event) => updateFilter('type', event.target.value as Filters['type'])}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.marketRegion')}</label>
            <select
              className="select"
              value={filters.marketRegion}
              onChange={(event) => updateFilter('marketRegion', event.target.value as Filters['marketRegion'])}
            >
              <option value="">{t('catalog.allMarkets')}</option>
              {PROPERTY_MARKET_REGIONS.map((marketRegion) => (
                <option key={marketRegion} value={marketRegion}>
                  {t(PROPERTY_MARKET_REGION_TRANSLATION_KEYS[marketRegion])}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.country')}</label>
            <select
              className="select"
              value={filters.country}
              onChange={(event) => updateFilter('country', event.target.value)}
            >
              <option value="">{t('catalog.allCountries')}</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.zone')}</label>
            <select
              className="select"
              value={filters.zone}
              onChange={(event) => updateFilter('zone', event.target.value)}
            >
              <option value="">{t('catalog.allZones')}</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.minPrice')}</label>
            <input
              className="input"
              type="number"
              placeholder="US$ 0"
              value={filters.minPrice}
              onChange={(event) => updateFilter('minPrice', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.maxPrice')}</label>
            <input
              className="input"
              type="number"
              placeholder={t('catalog.noLimit')}
              value={filters.maxPrice}
              onChange={(event) => updateFilter('maxPrice', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.minBedrooms')}</label>
            <select
              className="select"
              value={filters.bedrooms}
              onChange={(event) => updateFilter('bedrooms', event.target.value)}
            >
              <option value="">{t('catalog.anyBedrooms')}</option>
              {[1, 2, 3, 4, 5].map((bedrooms) => (
                <option key={bedrooms} value={bedrooms}>{bedrooms}+</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('catalog.noResultsTitle')}</h3>
          <p>{t('catalog.noResultsCopy')}</p>
        </div>
      ) : (
        <>
          <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
            {filteredProperties.length} {filteredProperties.length === 1 ? t('catalog.oneResult') : t('catalog.manyResults')}
          </p>

          <div className="properties-grid">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
