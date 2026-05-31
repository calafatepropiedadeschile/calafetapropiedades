import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import { isLandProject } from '@/features/properties/property-land-options';
import { localizedHref } from '@/lib/i18n/localized-href';
import { translate, type TranslationKey } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { PriceType, Property, PropertyCard as PropertyCardType, PropertyType } from '@/types/property';

interface Props {
  properties: PropertyCardType[];
  property: Pick<Property, 'type' | 'priceType' | 'zone' | 'city' | 'totalLots'>;
  locale: Locale;
}

function getSimilarSubtitleKey(property: Pick<Property, 'type' | 'totalLots'>): TranslationKey {
  if (isLandProject(property)) return 'property.similarSubtitleProject';
  if (property.type === 'terreno') return 'property.similarSubtitleLot';
  return 'property.similarSubtitleHouse';
}

function getSimilarCatalogHref(type: PropertyType, priceType: PriceType, zone: string, locale: Locale) {
  const query = encodeURIComponent(zone);

  if (priceType === 'arriendo') {
    return localizedHref(`/arriendos?type=${type}&query=${query}`, locale);
  }

  if (type === 'terreno') {
    return localizedHref(`/terrenos?query=${query}`, locale);
  }

  return localizedHref(`/propiedades?type=${type}&priceType=venta&query=${query}`, locale);
}

export default function SimilarPropertiesSection({ properties, property, locale }: Props) {
  if (properties.length === 0) return null;

  const t = (key: TranslationKey) => translate(locale, key);
  const subtitleKey = getSimilarSubtitleKey(property);
  const subtitle = t(subtitleKey)
    .replace('{zone}', property.zone)
    .replace('{city}', property.city);
  const catalogHref = getSimilarCatalogHref(property.type, property.priceType, property.zone, locale);

  return (
    <section className="pdp-similar-section" aria-labelledby="pdp-similar-title">
      <div className="container section-padding">
        <header className="pdp-similar-header">
          <h2 id="pdp-similar-title">{t('property.similarTitle')}</h2>
          <p>{subtitle}</p>
        </header>

        <div className="property-grid" role="list">
          {properties.map((item) => (
            <div key={item.id} role="listitem">
              <PropertyCard property={item} />
            </div>
          ))}
        </div>

        <div className="pdp-similar-footer">
          <Link href={catalogHref} className="btn btn-outline">
            {t('property.similarViewMore')}
          </Link>
        </div>
      </div>
    </section>
  );
}
