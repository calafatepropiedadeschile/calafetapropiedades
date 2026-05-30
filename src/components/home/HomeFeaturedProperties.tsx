'use client';

import { useMemo, useState } from 'react';
import PropertyCard from '@/components/properties/PropertyCard';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { PropertyCard as PropertyCardType, PropertyType } from '@/types/property';

interface Props {
  properties: PropertyCardType[];
}

export default function HomeFeaturedProperties({ properties }: Props) {
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<PropertyType>('terreno');

  const tabs = useMemo(() => ([
    { value: 'terreno' as const, label: t('property.lot') },
    { value: 'casa' as const, label: t('property.house') },
  ]), [t]);

  const counts = useMemo(() => ({
    terreno: properties.filter((property) => property.type === 'terreno').length,
    casa: properties.filter((property) => property.type === 'casa').length,
  }), [properties]);

  const visibleProperties = useMemo(
    () => properties
      .filter((property) => property.type === selectedType)
      .slice(0, 6),
    [properties, selectedType],
  );

  return (
    <>
      <div className="home-featured-tabs" role="tablist" aria-label={t('home.featuredTabsLabel')}>
        {tabs.map((tab) => {
          const isActive = selectedType === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              className={`home-featured-tab ${isActive ? 'active' : ''}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedType(tab.value)}
            >
              <span>{tab.label}</span>
              <small>{counts[tab.value]}</small>
            </button>
          );
        })}
      </div>

      {visibleProperties.length > 0 ? (
        <div className="property-grid">
          {visibleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>{selectedType === 'terreno' ? t('home.featuredEmptyLots') : t('home.featuredEmptyHouses')}</h3>
          <p>{t('home.featuredEmptyCopy')}</p>
        </div>
      )}
    </>
  );
}
