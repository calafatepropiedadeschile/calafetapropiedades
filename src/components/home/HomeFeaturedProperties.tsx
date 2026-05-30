'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/properties/PropertyCard';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  SCROLL_REVEAL_VIEWPORT,
  STAGGER_CARD_FADE_ONLY,
  STAGGER_GRID_CONTAINER,
} from '@/lib/motion/gpu-safe-variants';
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
        <motion.div
          key={selectedType}
          className="property-grid"
          role="list"
          variants={STAGGER_GRID_CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
        >
          {visibleProperties.map((property) => (
            <motion.div
              key={property.id}
              role="listitem"
              variants={STAGGER_CARD_FADE_ONLY}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <h3>{selectedType === 'terreno' ? t('home.featuredEmptyLots') : t('home.featuredEmptyHouses')}</h3>
          <p>{t('home.featuredEmptyCopy')}</p>
        </div>
      )}
    </>
  );
}
