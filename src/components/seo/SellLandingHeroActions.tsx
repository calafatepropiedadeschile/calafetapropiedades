'use client';

import Link from 'next/link';
import WhatsAppButton from '@/components/marketing/WhatsAppButton';
import { buildSellWhatsAppMessage } from '@/lib/marketing/whatsapp';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  locale: Locale;
  primaryLabel: string;
  secondaryLabel: string;
}

export default function SellLandingHeroActions({ locale, primaryLabel, secondaryLabel }: Props) {
  return (
    <div className="sell-landing-hero__actions">
      <Link href="#vender-solicitud" className="btn btn-primary">
        {primaryLabel}
      </Link>
      <WhatsAppButton
        locale={locale}
        pageLabel="/vender"
        variant="outline"
        fullWidth={false}
        className="sell-landing-hero__whatsapp"
        message={buildSellWhatsAppMessage(locale)}
        label={secondaryLabel}
      />
    </div>
  );
}
