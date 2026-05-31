function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return match[1].trim() || null;
  }
}

export function createMetaEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getMetaBrowserIds() {
  return {
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
  };
}
