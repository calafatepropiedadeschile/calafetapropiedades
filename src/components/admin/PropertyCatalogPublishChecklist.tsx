'use client';

import { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  getCatalogPublishChecklist,
  summarizeCatalogPublishChecklist,
  type CatalogPublishChecklistInput,
} from '@/features/properties/property-catalog-checklist';

interface Props {
  values: CatalogPublishChecklistInput;
  showPublishWarning?: boolean;
}

export default function PropertyCatalogPublishChecklist({ values, showPublishWarning }: Props) {
  const items = useMemo(() => getCatalogPublishChecklist(values), [values]);
  const summary = useMemo(() => summarizeCatalogPublishChecklist(items), [items]);

  return (
    <aside className="catalog-publish-checklist" aria-label="Checklist del catalogo publico">
      <p className="catalog-publish-checklist-intro">
        Revisa estos puntos para que la propiedad se vea bien en el catalogo y responda a los filtros del sitio.
      </p>

      <p className="catalog-publish-checklist-summary">
        <strong>{summary.requiredDone}/{summary.requiredTotal}</strong> obligatorios
        {summary.recommendedTotal > 0 && (
          <> · <strong>{summary.recommendedDone}/{summary.recommendedTotal}</strong> recomendados</>
        )}
      </p>

      <ul className="catalog-publish-checklist-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`catalog-publish-checklist-item${item.ok ? ' is-done' : ''}${item.required ? ' is-required' : ''}`}
          >
            {item.ok ? (
              <CheckCircle2 size={18} className="catalog-publish-checklist-icon is-done" aria-hidden />
            ) : (
              <Circle size={18} className="catalog-publish-checklist-icon" aria-hidden />
            )}
            <div>
              <span className="catalog-publish-checklist-label">
                {item.label}
                {item.required ? ' *' : ''}
              </span>
              {item.hint && (
                <span className="catalog-publish-checklist-hint">{item.hint}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {showPublishWarning && !summary.isReadyToPublish && (
        <p className="form-error catalog-publish-checklist-warning">
          Faltan datos obligatorios para publicar con buena visibilidad en el catalogo.
        </p>
      )}

      {showPublishWarning && summary.isReadyToPublish && summary.missingRecommended.length > 0 && (
        <p className="catalog-publish-checklist-note">
          Puedes publicar, pero conviene completar los puntos recomendados para aprovechar todos los filtros.
        </p>
      )}
    </aside>
  );
}
