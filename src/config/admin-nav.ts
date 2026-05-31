import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  FileText,
  Home,
  LayoutTemplate,
  Mail,
  Megaphone,
  Search,
  Settings,
  Users,
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Operación',
    items: [
      { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
      { href: '/admin/leads', label: 'Consultas', icon: Mail },
      { href: '/admin/campanas', label: 'Campañas', icon: Megaphone },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/admin/propiedades', label: 'Propiedades', icon: Home },
      { href: '/admin/agentes', label: 'Agentes', icon: Users },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { href: '/admin/inicio', label: 'Hero inicio', icon: LayoutTemplate },
      { href: '/admin/paginas', label: 'Páginas', icon: FileText },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { href: '/admin/ajustes', label: 'Ajustes del sitio', icon: Settings },
      { href: '/admin/seo', label: 'SEO avanzado', icon: Search },
    ],
  },
];

export function isAdminNavItemActive(pathname: string, href: string, exact = false) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  if (href === '/admin/propiedades') {
    return pathname === '/admin/propiedades' || pathname.startsWith('/admin/propiedades/');
  }

  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
