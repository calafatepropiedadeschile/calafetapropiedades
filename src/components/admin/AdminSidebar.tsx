'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Building2,
  LogOut,
  Menu,
  Plus,
  User as UserIcon,
  X,
  ChevronRight,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS, isAdminNavItemActive } from '@/config/admin-nav';
import { siteConfig } from '@/config/site';

interface Props {
  user: { name?: string | null; email?: string | null };
}

function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="admin-nav" aria-label="Administración">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label} className="admin-nav-group">
          <span className="admin-nav-label">{group.label}</span>
          {group.items.map((item) => {
            const active = isAdminNavItemActive(pathname, item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${active ? ' active' : ''}`}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
              >
                <div className="admin-nav-item-icon">
                  <Icon size={20} />
                </div>
                <span className="admin-nav-item-text">{item.label}</span>
                {active ? <ChevronRight size={14} className="admin-nav-active-indicator" aria-hidden /> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const isMobileMenuOpen = mobileMenuPath === pathname;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuPath(null);
  }

  function toggleMobileMenu() {
    setMobileMenuPath(isMobileMenuOpen ? null : pathname);
  }

  return (
    <>
      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-logo">
          <Building2 size={24} className="text-primary" />
          <span className="admin-logo-text">
            Admin<span className="text-primary">.</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleMobileMenu}
          className="admin-menu-toggle"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isMobileMenuOpen ? (
        <div
          className="admin-sidebar-overlay"
          onClick={closeMobileMenu}
          aria-hidden
        />
      ) : null}

      <aside
        className={`admin-sidebar${isMobileMenuOpen ? ' open' : ''}`}
        aria-label="Menú de administración"
      >
        <div className="admin-sidebar-inner">
          <div className="admin-sidebar-header">
            <Link href="/admin" className="admin-logo" onClick={closeMobileMenu}>
              <Building2 size={28} className="text-primary" />
              <div className="admin-logo-info">
                <span className="admin-logo-text">{siteConfig.adminName}</span>
                <span className="admin-logo-tagline">Panel comercial</span>
              </div>
            </Link>
          </div>

          <Link
            href="/admin/propiedades/nueva"
            className="btn btn-primary admin-sidebar-cta"
            onClick={closeMobileMenu}
          >
            <Plus size={18} />
            Nueva propiedad
          </Link>

          <AdminNav pathname={pathname} onNavigate={closeMobileMenu} />

          <div className="admin-sidebar-footer">
            <div className="admin-user-profile">
              <div className="admin-user-avatar">
                <UserIcon size={20} />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user.name || 'Administrador'}</span>
                <span className="admin-user-email">{user.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="admin-logout-btn"
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
