import { primaryContact } from '@/config/contact';
import { getStoredAttribution } from '@/lib/marketing/attribution';

export function normalizeWhatsAppNumber(phone: string) {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export function buildWhatsAppUrl(options?: {
  message?: string;
  phone?: string;
}) {
  const phone = normalizeWhatsAppNumber(options?.phone ?? primaryContact.whatsappNumber);
  const base = `https://wa.me/${phone}`;
  const message = options?.message?.trim();

  if (!message) return base;

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildDefaultWhatsAppMessage(context?: {
  propertyTitle?: string;
  pageLabel?: string;
  locale?: 'es' | 'en';
}) {
  const isEs = context?.locale !== 'en';
  const attribution = getStoredAttribution();
  const lines = [
    isEs
      ? `Hola, me interesa ${context?.propertyTitle ?? 'una propiedad'} en Calafate Propiedades.`
      : `Hello, I am interested in ${context?.propertyTitle ?? 'a property'} at Calafate Propiedades.`,
  ];

  if (context?.pageLabel) {
    lines.push(isEs ? `Pagina: ${context.pageLabel}` : `Page: ${context.pageLabel}`);
  }

  if (attribution?.utmCampaign) {
    lines.push(`Campaña: ${attribution.utmCampaign}`);
  }

  return lines.join('\n');
}
