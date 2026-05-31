'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import { useRentalsNav } from '@/components/layout/RentalsNavProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { PROPERTY_LOCATION_FILTERS } from '@/features/properties/property-zone-filters';
import {
  buildCatalogFilterSearchParams,
  DEFAULT_CATALOG_FILTERS,
  normalizeCatalogFilters,
  type CatalogFilterState,
} from '@/features/properties/property-filtering';
import type { PropertyCard as PropertyCardType, PropertyType } from '@/types/property';
import { persistCatalogPreferencesClient } from '@/lib/catalog/catalog-preferences';

const PROPERTY_TYPES: Array<{ value: PropertyType | ''; labelKey: TranslationKey }> = [
  { value: '', labelKey: 'catalog.landAndHouses' },
  { value: 'terreno', labelKey: 'property.lot' },
  { value: 'casa', labelKey: 'property.house' },
];

const QUERY_DEBOUNCE_MS = 400;

export interface CatalogPagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

type CatalogPriceMode = 'venta' | 'arriendo';

interface CustomCatalogSelectProps {
  value: string;
  options: { value: string; label: string; description?: string }[];
  onChange: (value: string) => void;
}

function CustomCatalogSelect({ value, options, onChange }: CustomCatalogSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className={`select${isOpen ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((c) => !c)}
        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
          {selectedOption?.label || ''}
        </span>
      </button>

      {isOpen && (
        <div className="property-search-dropdown" role="listbox" id={listboxId} style={{ top: 'calc(100% + 8px)', width: '100%', zIndex: 50, padding: '8px' }}>
          {options.map((option) => {
            const isSelected = option.value === selectedOption?.value;
            return (
              <button
                key={option.value || 'empty'}
                type="button"
                className={`property-search-option${isSelected ? ' is-selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{ padding: '8px 12px' }}
              >
                <span className="property-search-option-copy">
                  <span className="property-search-option-label" style={{ fontSize: '0.9rem' }}>{option.label}</span>
                  {option.description && (
                    <span className="property-search-option-description" style={{ fontSize: '0.8rem' }}>{option.description}</span>
                  )}
                </span>
                {isSelected && (
                  <svg className="property-search-option-check" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Props {
  properties: PropertyCardType[];
  zoneOptions: string[];
  initialFilters?: Partial<CatalogFilterState>;
  pagination: CatalogPagination;
  showPriceModeTabs?: boolean;
  catalogPriceMode?: CatalogPriceMode;
}

export default function PropertyCatalog({
  properties,
  zoneOptions,
  initialFilters: providedFilters,
  pagination,
  showPriceModeTabs = false,
  catalogPriceMode = 'venta',
}: Props) {
  const { t } = useI18n();
  const { hasPublishedRentals } = useRentalsNav();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<CatalogFilterState>(() => normalizeCatalogFilters({
    ...DEFAULT_CATALOG_FILTERS,
    ...providedFilters,
  }));
  const [queryDraft, setQueryDraft] = useState(() => filters.query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filtersRef = useRef(filters);
  const providedFiltersJson = JSON.stringify(providedFilters);

  useEffect(() => {
    const next = normalizeCatalogFilters({
      ...DEFAULT_CATALOG_FILTERS,
      ...JSON.parse(providedFiltersJson || '{}'),
    });
    setFilters(next);
    setQueryDraft((current) => current !== next.query ? next.query : current);
  }, [providedFiltersJson]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const applyFilters = useCallback((nextFilters: CatalogFilterState, page = pagination.page) => {
    const normalized = normalizeCatalogFilters(nextFilters);
    setFilters(normalized);
    setQueryDraft(normalized.query);
    persistCatalogPreferencesClient({
      type: normalized.type === 'terreno' || normalized.type === 'casa' ? normalized.type : '',
      zone: normalized.zone,
    });
    const params = buildCatalogFilterSearchParams(normalized, page);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [pagination.page, pathname, router]);

  useEffect(() => {
    if (queryDraft === filters.query) return;

    const timeout = window.setTimeout(() => {
      applyFilters({ ...filtersRef.current, query: queryDraft }, 1);
    }, QUERY_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [queryDraft, filters.query, applyFilters]);

  const zones = useMemo(() => {
    const groupedZones = PROPERTY_LOCATION_FILTERS.filter((location) => location.value);
    const normalizedGroupLabels = new Set(groupedZones.map((location) => location.label.toLowerCase()));

    const extraZones = zoneOptions
      .filter((zone) => zone && !normalizedGroupLabels.has(zone.toLowerCase()))
      .sort();

    return [
      ...groupedZones,
      ...extraZones.map((zone) => ({ value: zone, label: zone })),
    ];
  }, [zoneOptions]);

  const pageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    if (totalPages <= 1) return [] as number[];

    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [pagination]);

  const activeFilters = useMemo(() => [
    filters.query,
    filters.type,
    filters.zone,
    filters.minPrice,
    filters.maxPrice,
    filters.minSurface,
    filters.hasAvailableLots ? 'available' : '',
  ].filter(Boolean).length, [filters]);

  function updateFilter<K extends keyof CatalogFilterState>(key: K, value: CatalogFilterState[K]) {
    if (key === 'query') {
      setQueryDraft(String(value));
      return;
    }
    applyFilters({ ...filters, [key]: value }, 1);
  }

  function clearFilters() {
    setQueryDraft('');
    applyFilters(DEFAULT_CATALOG_FILTERS, 1);
    setIsFilterOpen(false);
  }

  function goToPage(page: number) {
    applyFilters(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <div className="catalog-mobile-filter-bar">
        <div>
          <span className="catalog-mobile-filter-kicker">{t('catalog.filtersTitle')}</span>
          <strong>{pagination.total} {pagination.total === 1 ? t('catalog.oneResult') : t('catalog.manyResults')}</strong>
        </div>
        <button
          type="button"
          className="catalog-filter-toggle"
          aria-expanded={isFilterOpen}
          onClick={() => setIsFilterOpen((current) => !current)}
        >
          {isFilterOpen ? <X size={18} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
          <span>{isFilterOpen ? t('catalog.closeFilters') : t('catalog.mobileFilterButton')}</span>
          {activeFilters > 0 && <span className="catalog-filter-count">{activeFilters}</span>}
        </button>
      </div>

      <div className={`property-filter-overlay ${isFilterOpen ? 'is-open' : ''}`} onClick={() => setIsFilterOpen(false)} aria-hidden="true" />
      <div className={`property-filter-panel ${isFilterOpen ? 'is-open' : ''}`}>
        <div className="catalog-filter-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <span className="catalog-filter-eyebrow">{t('catalog.resultsEyebrow')}</span>
            <h2 style={{ fontSize: '1.4rem', margin: 0, marginTop: '4px' }}>
              {pagination.total} {pagination.total === 1 ? t('catalog.oneResult') : t('catalog.manyResults')}
            </h2>
            {pagination.totalPages > 1 && (
              <p className="text-muted" style={{ margin: 0, marginTop: '4px', fontSize: '0.9rem' }}>
                {t('catalog.page')} {pagination.page} / {pagination.totalPages}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm catalog-clear-filters catalog-clear-filters-desktop"
              onClick={clearFilters}
              disabled={activeFilters === 0}
            >
              {t('catalog.clearFilters')}
            </button>
            <button
              type="button"
              className="mobile-menu-close-btn catalog-filter-close"
              onClick={() => setIsFilterOpen(false)}
              aria-label="Cerrar filtros"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="property-filter-scroll-area">

        {showPriceModeTabs && hasPublishedRentals && (
          <div className="search-tabs catalog-tabs">
            <button
              type="button"
              className={`search-tab ${catalogPriceMode === 'venta' ? 'active' : ''}`}
              onClick={() => router.push('/propiedades')}
            >
              {t('catalog.buyTab')}
            </button>
            <button
              type="button"
              className={`search-tab ${catalogPriceMode === 'arriendo' ? 'active' : ''}`}
              onClick={() => router.push('/arriendos')}
            >
              {t('catalog.rentTab')}
            </button>
          </div>
        )}

        <div className="catalog-filter-grid">
          <div className="input-group">
            <label className="input-label">{t('catalog.search')}</label>
            <input
              className="input"
              placeholder={t('catalog.searchPlaceholder')}
              value={queryDraft}
              onChange={(event) => updateFilter('query', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.propertyType')}</label>
            <CustomCatalogSelect
              value={filters.type}
              onChange={(value) => updateFilter('type', value as CatalogFilterState['type'])}
              options={PROPERTY_TYPES.map((type) => ({
                value: type.value,
                label: t(type.labelKey),
                description: type.value === 'terreno' ? 'Parcelas y loteos' : type.value === 'casa' ? 'Casas con terreno' : 'Todas las propiedades',
              }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.zone')}</label>
            <CustomCatalogSelect
              value={filters.zone}
              onChange={(value) => updateFilter('zone', value)}
              options={[
                { value: '', label: t('catalog.allZones') },
                ...zones.map((zone) => ({ value: zone.value, label: zone.label })),
              ]}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.minPrice')}</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="$ 0"
              value={filters.minPrice}
              onChange={(event) => updateFilter('minPrice', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.maxPrice')}</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder={t('catalog.noLimit')}
              value={filters.maxPrice}
              onChange={(event) => updateFilter('maxPrice', event.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('catalog.minSurface')}</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder={t('catalog.minSurfacePlaceholder')}
              value={filters.minSurface}
              onChange={(event) => updateFilter('minSurface', event.target.value)}
            />
          </div>

          <label className="form-check catalog-availability-filter">
            <input
              type="checkbox"
              checked={filters.hasAvailableLots}
              onChange={(event) => updateFilter('hasAvailableLots', event.target.checked)}
            />
            {t('catalog.availableLotsOnly')}
          </label>
        </div>
        </div>

        <div className="property-filter-footer-mobile">
          <button
            type="button"
            className="btn btn-ghost catalog-clear-filters"
            onClick={clearFilters}
            disabled={activeFilters === 0}
          >
            {t('catalog.clearFilters')}
          </button>
          <button
            type="button"
            className="btn btn-primary catalog-apply-filters"
            onClick={() => setIsFilterOpen(false)}
          >
            Ver {pagination.total} {pagination.total === 1 ? 'resultado' : 'resultados'}
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="catalog-empty-state">
          <h3>{catalogPriceMode === 'arriendo' ? t('catalog.noRentalsTitle') : t('catalog.noResultsTitle')}</h3>
          <p>{catalogPriceMode === 'arriendo' ? t('catalog.noRentalsCopy') : t('catalog.noResultsCopy')}</p>
          {catalogPriceMode === 'arriendo' ? (
            <Link href="/contacto" className="btn btn-primary btn-sm">
              {t('catalog.rentalContactCta')}
            </Link>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>
              {t('catalog.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="properties-grid" style={{ paddingTop: 'var(--space-sm)' }}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <nav className="catalog-pagination" aria-label={t('catalog.paginationLabel')}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
              >
                {t('catalog.prevPage')}
              </button>
              {pageNumbers.map((pageNumber, index) => {
                const prev = pageNumbers[index - 1];
                const showEllipsis = prev !== undefined && pageNumber - prev > 1;

                return (
                  <span key={pageNumber} className="catalog-pagination-group">
                    {showEllipsis && <span className="text-muted" aria-hidden="true">...</span>}
                    <button
                      type="button"
                      className={`btn btn-sm ${pageNumber === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                      aria-current={pageNumber === pagination.page ? 'page' : undefined}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
              >
                {t('catalog.nextPage')}
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
