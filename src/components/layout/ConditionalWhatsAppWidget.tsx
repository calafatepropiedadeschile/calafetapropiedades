'use client';

import { usePathname } from 'next/navigation';
import WhatsAppWidget from '@/components/layout/WhatsAppWidget';

export default function ConditionalWhatsAppWidget() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <WhatsAppWidget />;
}
