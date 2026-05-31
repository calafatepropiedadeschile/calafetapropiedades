'use client';

import { MessageCircle } from 'lucide-react';
import { primaryContact } from '@/config/contact';
import { trackWhatsAppClick } from '@/lib/marketing/analytics';
import { buildDefaultWhatsAppMessage, buildWhatsAppUrl } from '@/lib/marketing/whatsapp';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  propertyTitle?: string;
  pageLabel?: string;
  locale?: Locale;
  className?: string;
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
  message?: string;
  label?: string;
}

export default function WhatsAppButton({
  propertyTitle,
  pageLabel,
  locale = 'es',
  className = '',
  variant = 'outline',
  fullWidth = true,
  message,
  label,
}: Props) {
  const isEs = locale === 'es';

  function handleClick() {
    trackWhatsAppClick({
      property_title: propertyTitle,
      page_label: pageLabel,
    });

    const url = buildWhatsAppUrl({
      message: message ?? buildDefaultWhatsAppMessage({ propertyTitle, pageLabel, locale }),
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      type="button"
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-outline'} ${className}`.trim()}
      onClick={handleClick}
      style={{
        width: fullWidth ? '100%' : undefined,
        justifyContent: 'center',
        gap: '0.5rem',
        backgroundColor: variant === 'primary' ? '#25D366' : undefined,
        borderColor: variant === 'primary' ? '#25D366' : undefined,
      }}
    >
      <MessageCircle size={18} />
      {label ?? (isEs ? `WhatsApp ${primaryContact.displayPhone}` : `WhatsApp ${primaryContact.displayPhone}`)}
    </button>
  );
}
