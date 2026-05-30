'use client';

import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROPERTY_LOCATION_FILTERS } from '@/features/properties/property-zone-filters';
import { persistCatalogPreferencesClient } from '@/lib/catalog/catalog-preferences';

type SearchOption = {
  value: string;
  label: string;
  description: string;
};

const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno', description: 'Parcelas, loteos y terrenos' },
  { value: 'casa', label: 'Casa', description: 'Casas o viviendas con terreno' },
] as const satisfies readonly SearchOption[];

const LOCATION_OPTIONS = PROPERTY_LOCATION_FILTERS.map((location) => ({
  ...location,
  description: location.value
    ? 'Filtrar propiedades por zona'
    : 'Ver todas las ubicaciones',
})) satisfies SearchOption[];

interface SearchSelectProps {
  label: string;
  value: string;
  options: readonly SearchOption[];
  icon: ReactNode;
  onChange: (value: string) => void;
}

function SearchSelect({ label, value, options, icon, onChange }: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="search-field search-field--custom" ref={wrapperRef}>
      <span className="search-label">
        {icon}
        {label}
      </span>
      <button
        type="button"
        className={`search-select-trigger${isOpen ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        <span className="search-select-value">{selectedOption.label}</span>
        <svg
          className="search-select-chevron"
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="property-search-dropdown" role="listbox" id={listboxId}>
          {options.map((option) => {
            const isSelected = option.value === selectedOption.value;
            return (
              <button
                key={option.value || 'empty'}
                type="button"
                className={`property-search-option${isSelected ? ' is-selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option.value)}
              >
                <span className="property-search-option-copy">
                  <span className="property-search-option-label">{option.label}</span>
                  <span className="property-search-option-description">{option.description}</span>
                </span>
                {isSelected && (
                  <svg
                    className="property-search-option-check"
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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

interface PropertySearchProps {
  initialType?: 'terreno' | 'casa';
  initialZone?: string;
}

export default function PropertySearch({
  initialType = 'terreno',
  initialZone = '',
}: PropertySearchProps) {
  const router = useRouter();
  const [type, setType] = useState<string>(initialType);
  const [zone, setZone] = useState(initialZone);
  const [isLoading, setIsLoading] = useState(false);

  function handleTypeChange(nextType: string) {
    setType(nextType);
    if (nextType === 'terreno' || nextType === 'casa') {
      persistCatalogPreferencesClient({ type: nextType });
    }
  }

  function handleZoneChange(nextZone: string) {
    setZone(nextZone);
    persistCatalogPreferencesClient({ zone: nextZone });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const catalogType = type === 'terreno' || type === 'casa' ? type : 'terreno';
    persistCatalogPreferencesClient({ type: catalogType, zone });

    const params = new URLSearchParams();

    if (catalogType) params.set('type', catalogType);
    if (zone) params.set('zone', zone);

    const queryString = params.toString();
    router.push(`/propiedades${queryString ? `?${queryString}` : ''}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="property-search-form"
      role="search"
      aria-label="Buscar propiedades"
    >
      <div className="search-field-group">
        <SearchSelect
          label="Que buscas?"
          value={type}
          options={PROPERTY_TYPES}
          onChange={handleTypeChange}
          icon={(
            <svg
              aria-hidden="true"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        />

        <div className="search-divider" aria-hidden="true" />

        <SearchSelect
          label="Donde?"
          value={zone}
          options={LOCATION_OPTIONS}
          onChange={handleZoneChange}
          icon={(
            <svg
              aria-hidden="true"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )}
        />

        <button
          type="submit"
          className={`search-action-btn${isLoading ? ' loading' : ''}`}
          disabled={isLoading}
          aria-label="Buscar propiedades"
        >
          {isLoading ? (
            <span className="search-spinner" aria-hidden="true" />
          ) : (
            <svg
              aria-hidden="true"
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
          <span>Buscar</span>
        </button>
      </div>
    </form>
  );
}
