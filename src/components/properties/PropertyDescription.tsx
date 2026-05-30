'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PropertyDescriptionBlocks from '@/components/properties/PropertyDescriptionBlocks';
import type { ParsedPropertyDescription } from '@/features/properties/property-description-content';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Props {
  parsed: ParsedPropertyDescription;
  sectionTitle: string;
  hint?: string;
}

export default function PropertyDescription({ parsed, sectionTitle, hint }: Props) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  if (parsed.blocks.length === 0 && !parsed.lead) {
    return null;
  }

  const showCollapsed = parsed.isCollapsible && !expanded;
  const visibleBlockCount = showCollapsed ? parsed.previewBlockCount : parsed.blocks.length;

  return (
    <section className="property-description-section" aria-labelledby="property-description-heading">
      <div className="property-description-header">
        <h2 id="property-description-heading" className="property-description-title">
          {sectionTitle}
        </h2>
        {hint ? <p className="property-description-hint">{hint}</p> : null}
      </div>

      {parsed.lead ? (
        <p className="property-description-lead">{parsed.lead}</p>
      ) : null}

      <PropertyDescriptionBlocks blocks={parsed.blocks} limit={visibleBlockCount} />

      {parsed.isCollapsible ? (
        <div className="property-description-actions">
          <button
            type="button"
            className="property-description-toggle"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <span>
              {expanded ? t('property.readLess') : t('property.readMore')}
            </span>
            <ChevronDown
              size={18}
              aria-hidden
              style={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}
