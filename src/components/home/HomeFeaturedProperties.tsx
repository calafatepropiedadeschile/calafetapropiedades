'use client';

import { useMemo, useState } from 'react';
import PropertyCard from '@/components/properties/PropertyCard';
import type { PropertyCard as PropertyCardType, PropertyType } from '@/types/property';

const FEATURED_TABS: Array<{ value: PropertyType; label: string }> = [
  { value: 'terreno', label: 'Terrenos' },
  { value: 'casa', label: 'Casas' },
];

interface Props {
  properties: PropertyCardType[];
}

export default function HomeFeaturedProperties({ properties }: Props) {
  const [selectedType, setSelectedType] = useState<PropertyType>('terreno');

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
      <div className="home-featured-tabs" role="tablist" aria-label="Filtro de categorias destacadas">
        {FEATURED_TABS.map((tab) => {
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
          <h3>No hay {selectedType === 'terreno' ? 'terrenos' : 'casas'} destacados por ahora</h3>
          <p>Cuando el equipo publique propiedades de esta categoria apareceran automaticamente en esta seccion.</p>
        </div>
      )}
    </>
  );
}
