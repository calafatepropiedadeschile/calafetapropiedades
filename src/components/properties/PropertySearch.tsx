'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_ROUTES } from '@/config/api';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { formatPrice } from '@/lib/utils/formatters';
import { getSiteImageUrl } from '@/lib/storage/public-images';
import type { ApiResponse, PaginatedResponse, PropertyCard } from '@/types/property';

type SearchResult = Pick<PropertyCard, 'id' | 'title' | 'slug' | 'city' | 'zone' | 'price' | 'priceType' | 'currency' | 'coverImage'>;

const PRICE_TYPE_KEYS = {
  venta: 'property.sale',
  alquiler: 'property.rent',
} as const;

export default function PropertySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, locale } = useI18n();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fallbackImage = getSiteImageUrl(
    'site/property-search-fallback.webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=100&auto=format&fit=crop'
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsLoading(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedQuery = query.trim();
  const hasSearchQuery = normalizedQuery.length >= 2;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: '6' });
        params.set('locale', locale);

        if (hasSearchQuery) {
          params.set('query', normalizedQuery);
        }

        const res = await fetch(`${API_ROUTES.properties}?${params.toString()}`, {
          cache: 'no-store',
          credentials: 'include',
          signal: controller.signal,
        });

        if (res.ok) {
          const json = await res.json() as ApiResponse<PaginatedResponse<PropertyCard>>;
          setResults(json.data?.data ?? []);
          setIsOpen(true);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Search error:', error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, hasSearchQuery ? 300 : 0);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [hasSearchQuery, isOpen, locale, normalizedQuery]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setIsLoading(true);
    setIsOpen(true);
  }

  function openSuggestions() {
    setIsLoading(true);
    setIsOpen(true);
  }

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    router.push(locale === 'en' ? `/propiedades/${slug}?lang=en` : `/propiedades/${slug}`);
  };

  function handleSearchSubmit() {
    const params = new URLSearchParams({ priceType: 'venta' });

    if (normalizedQuery) {
      params.set('query', normalizedQuery);
    }

    setIsOpen(false);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <div className={`search-container-wrapper ${isOpen ? 'is-open' : ''}`} ref={dropdownRef} style={{ width: '100%', position: 'relative' }}>
      <div className="hero-search-pill">
        <input
          type="text"
          className="hero-search-input"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={openSuggestions}
          onPointerDown={openSuggestions}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
        />
        <button type="button" className="hero-search-btn-realtor" onClick={handleSearchSubmit}>
          {t('search.button')}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>

      {isOpen && (
        <div className="search-dropdown animate-fade-in">
          {isLoading ? (
            <div className="search-dropdown-loading">{t('search.loading')}</div>
          ) : results.length === 0 ? (
            <div className="search-dropdown-empty">{t('search.noResults')}</div>
          ) : (
            <>
              <div className="search-dropdown-header">
                {hasSearchQuery ? t('search.topResults') : t('search.recentResults')}
              </div>
              <div className="search-results-list">
                {results.map((prop) => (
                  <button
                    type="button"
                    key={prop.id}
                    className="search-result-item"
                    onClick={() => handleSelect(prop.slug)}
                  >
                    <div className="search-result-img">
                      <Image
                        src={prop.coverImage || fallbackImage}
                        alt={prop.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title">{prop.title}</div>
                      <div className="search-result-meta">
                        {t(PRICE_TYPE_KEYS[prop.priceType])} <span>{prop.city}</span> <span>{prop.zone}</span> <span>{formatPrice(prop.price, prop.currency)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
