/**
 * Control de visibilidad del menú / footer de arriendos.
 *
 * NEXT_PUBLIC_RENTALS_NAV:
 * - auto (default): enlace a /arriendos siempre visible; el catálogo con fichas aparece al publicar en admin
 * - always: igual que auto (compatibilidad)
 * - hidden: sin enlace en menú ni footer; /arriendos sigue accesible por URL directa
 */
export type RentalsNavMode = 'auto' | 'always' | 'hidden';

export function getRentalsNavMode(): RentalsNavMode {
  const raw = process.env.NEXT_PUBLIC_RENTALS_NAV?.trim().toLowerCase();

  if (raw === 'always' || raw === 'true' || raw === '1') return 'always';
  if (raw === 'hidden' || raw === 'false' || raw === '0') return 'hidden';
  return 'auto';
}
