'use client';

import LeadForm from '@/components/forms/LeadForm';
import WhatsAppButton from '@/components/marketing/WhatsAppButton';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  locale?: Locale;
  pageLabel?: string;
}

export default function PropertyLeadPanel({
  propertyId,
  propertyTitle,
  propertySlug,
  locale = 'es',
  pageLabel,
}: Props) {
  const isEs = locale === 'es';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <LeadForm
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        propertySlug={propertySlug}
        locale={locale}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--color-border-light)' }} />
        <span className="text-muted text-xs">{isEs ? 'o escribe directo' : 'or chat directly'}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--color-border-light)' }} />
      </div>

      <WhatsAppButton
        propertyTitle={propertyTitle}
        pageLabel={pageLabel ?? `/proyectos/${propertySlug}`}
        locale={locale}
        variant="primary"
      />
    </div>
  );
}
