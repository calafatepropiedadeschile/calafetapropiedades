/** Dígitos de teléfono/WhatsApp para enlaces wa.me / tel: */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function buildWhatsAppHref(number: string, fallback = 'https://wa.me/56995417524') {
  const digits = digitsOnly(number);
  return digits ? `https://wa.me/${digits}` : fallback;
}

export function buildTelHref(phone: string, fallback = 'tel:+56995417524') {
  const digits = digitsOnly(phone);
  if (!digits) return fallback;
  return `tel:+${digits}`;
}
