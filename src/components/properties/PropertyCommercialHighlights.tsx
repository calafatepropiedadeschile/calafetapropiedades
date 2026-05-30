import type { Locale } from '@/lib/i18n/config';
import { buildCommercialHighlights } from '@/features/properties/property-commercial-highlights';
import type { Property } from '@/types/property';

interface Props {
  property: Property;
  locale: Locale;
  title?: string;
}

export default function PropertyCommercialHighlights({ property, locale, title }: Props) {
  const highlights = buildCommercialHighlights(property, locale);

  if (highlights.length === 0) {
    return null;
  }

  return (
    <section className="property-commercial-strip" aria-label={title ?? 'Datos clave'}>
      {title ? <p className="property-commercial-strip-eyebrow">{title}</p> : null}
      <ul className="property-commercial-strip-list">
        {highlights.map((item) => (
          <li
            key={item.id}
            className={`property-commercial-strip-item${item.emphasis ? ' is-emphasis' : ''}`}
          >
            <span className="property-commercial-strip-label">{item.label}</span>
            <strong className="property-commercial-strip-value">{item.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
