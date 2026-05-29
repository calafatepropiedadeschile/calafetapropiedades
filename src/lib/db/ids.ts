const CUID_PATTERN = /^c[a-z0-9]{24}$/i;

export function isCuid(value: string): boolean {
  return CUID_PATTERN.test(value);
}

export function assertCuid(value: string, label = 'ID'): void {
  if (!isCuid(value)) {
    throw new Error(`${label} invalido.`);
  }
}
