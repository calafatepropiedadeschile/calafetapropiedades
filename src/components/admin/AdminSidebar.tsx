'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  BarChart3, 
  Building2, 
  Home, 
  LogOut, 
  Mail, 
  Plus, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight,
  LayoutTemplate,
  FileText,
  Megaphone,
  Search,
  Users,
  Settings,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/inicio', label: 'Hero inicio', icon: LayoutTemplate },
  { href: '/admin/ajustes', label: 'Ajustes del sitio', icon: Settings },
  { href: '/admin/seo', label: 'SEO global', icon: Search },
  { href: '/admin/paginas', label: 'Paginas', icon: FileText },
  { href: '/admin/propiedades', label: 'Propiedades', icon: Home },
  { href: '/admin/propiedades/nueva', label: 'Nueva propiedad', icon: Plus },
  { href: '/admin/agentes', label: 'Agentes', icon: Users },
  { href: '/admin/leads', label: 'Consultas', icon: Mail },
  { href: '/admin/campanas', label: 'Campanas', icon: Megaphone },
];

interface Props {
  user: { name?: string | null; email?: string | null };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  function isActive(href: string) {
    if (href === '/admin') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Main Admin Header (Visible on both, but different content) */}
      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-logo">
          <Building2 size={24} className="text-primary" />
          <span className="admin-logo-text">Admin<span className="text-primary">.</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="admin-desktop-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-desktop-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop User Info & Logout */}
        <div className="admin-desktop-user">
          <div className="admin-user-info" style={{ textAlign: 'right' }}>
            <span className="admin-user-name">{user.name || 'Admin'}</span>
            <span className="admin-user-email" style={{ fontSize: '0.7rem' }}>{user.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="admin-desktop-logout"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="admin-menu-toggle"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (Sidebar) */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-inner">
          <div className="admin-sidebar-header">
            <Link href="/admin" className="admin-logo">
              <Building2 size={28} className="text-primary" />
              <div className="admin-logo-info">
                <span className="admin-logo-text">{siteConfig.adminName}</span>
                <span className="admin-logo-tagline">Management</span>
              </div>
            </Link>
          </div>

          <nav className="admin-nav">
            <div className="admin-nav-group">
              <span className="admin-nav-label">Navegación</span>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="admin-nav-item-icon">
                    <item.icon size={20} />
                  </div>
                  <span className="admin-nav-item-text">{item.label}</span>
                  {isActive(item.href) && <ChevronRight size={14} className="admin-nav-active-indicator" />}
                </Link>
              ))}
            </div>
          </nav>

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
