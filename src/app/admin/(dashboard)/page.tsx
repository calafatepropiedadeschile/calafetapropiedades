import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FilePenLine,
  Home,
  Mail,
  Megaphone,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { withDatabaseRole } from '@/lib/db/rls';

type RecentLead = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  property: { titleEs: string } | null;
};

type StatTone = 'default' | 'success' | 'attention' | 'neutral';

async function getDashboardData(): Promise<{
  totalProps: number;
  publishedProps: number;
  totalLeads: number;
  pendingLeads: number;
  recentLeads: RecentLead[];
  databaseError: boolean;
}> {
  try {
    const [propertyPublicationCounts, totalLeads, pendingLeads, recentLeads] = await withDatabaseRole('admin', async (db) => (
      Promise.all([
        db.property.groupBy({
          by: ['published'],
          _count: { _all: true },
        }),
        db.lead.count(),
        db.lead.count({ where: { status: 'pendiente' } }),
        db.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            property: { select: { titleEs: true } },
          },
        }),
      ])
    ));

    const totalProps = propertyPublicationCounts.reduce((sum, group) => sum + group._count._all, 0);
    const publishedProps = propertyPublicationCounts.find((group) => group.published)?._count._all ?? 0;

    return {
      totalProps,
      publishedProps,
      totalLeads,
      pendingLeads,
      recentLeads,
      databaseError: false,
    };
  } catch (error) {
    console.error('Admin dashboard failed while loading datasource.', error);

    return {
      totalProps: 0,
      publishedProps: 0,
      totalLeads: 0,
      pendingLeads: 0,
      recentLeads: [],
      databaseError: true,
    };
  }
}

function getStatTone(id: string, context: {
  totalLeads: number;
  pendingLeads: number;
  drafts: number;
}): StatTone {
  if (id === 'leads') {
    if (context.pendingLeads > 0) return 'attention';
    if (context.totalLeads === 0) return 'neutral';
    return 'default';
  }

  if (id === 'published') {
    return 'success';
  }

  if (id === 'drafts' && context.drafts > 0) {
    return 'attention';
  }

  return 'default';
}

export default async function AdminDashboard() {
  const {
    totalProps,
    publishedProps,
    totalLeads,
    pendingLeads,
    recentLeads,
    databaseError,
  } = await getDashboardData();

  const drafts = totalProps - publishedProps;

  const stats: Array<{
    id: string;
    label: string;
    value: number;
    href: string;
    icon: LucideIcon;
    meta: string;
    tone: StatTone;
  }> = [
    {
      id: 'total',
      label: 'Total propiedades',
      value: totalProps,
      icon: Home,
      href: '/admin/propiedades',
      meta: `${publishedProps} publicadas en el sitio`,
      tone: getStatTone('total', { totalLeads, pendingLeads, drafts }),
    },
    {
      id: 'published',
      label: 'Publicadas',
      value: publishedProps,
      icon: CheckCircle2,
      href: '/admin/propiedades?published=publicadas',
      meta: drafts > 0 ? `${drafts} borrador${drafts === 1 ? '' : 'es'} restante${drafts === 1 ? '' : 's'}` : 'Catálogo visible al público',
      tone: getStatTone('published', { totalLeads, pendingLeads, drafts }),
    },
    {
      id: 'leads',
      label: 'Consultas recibidas',
      value: totalLeads,
      icon: Mail,
      href: '/admin/leads',
      meta: pendingLeads > 0
        ? `${pendingLeads} pendiente${pendingLeads === 1 ? '' : 's'} de respuesta`
        : totalLeads === 0
          ? 'Aún sin consultas del sitio'
          : 'Todas respondidas o cerradas',
      tone: getStatTone('leads', { totalLeads, pendingLeads, drafts }),
    },
    {
      id: 'drafts',
      label: 'Borradores',
      value: drafts,
      icon: FilePenLine,
      href: '/admin/propiedades?published=borradores',
      meta: drafts > 0 ? 'Revisar antes de publicar' : 'Sin borradores pendientes',
      tone: getStatTone('drafts', { totalLeads, pendingLeads, drafts }),
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle text-muted">Resumen operativo del sitio y las consultas comerciales.</p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/campanas" className="btn btn-outline">
            <Megaphone size={18} />
            Campañas
          </Link>
          <Link href="/admin/propiedades/nueva" className="btn btn-primary">
            <Plus size={18} />
            Nueva propiedad
          </Link>
        </div>
      </div>

      {databaseError ? (
        <div className="admin-empty-state compact admin-alert-banner admin-alert-banner--error">
          <strong>No se pudo conectar con la base de datos de producción.</strong>
          <span className="text-muted text-sm">
            Revisa en Vercel las variables DATABASE_URL y las credenciales de Supabase. El panel cargó, pero los datos no están disponibles.
          </span>
        </div>
      ) : null}

      <div
        className={`admin-priority-banner${pendingLeads > 0 ? ' admin-priority-banner--alert' : ''}`}
        role="status"
      >
        <div className="admin-priority-banner__copy">
          <strong>
            {pendingLeads > 0
              ? `${pendingLeads} consulta${pendingLeads === 1 ? '' : 's'} pendiente${pendingLeads === 1 ? '' : 's'} de respuesta`
              : 'Consultas pendientes: 0'}
          </strong>
          <p className="text-muted text-sm">
            {pendingLeads > 0
              ? 'Responde pronto para no perder inversión publicitaria.'
              : 'Cuando llegue una consulta desde el sitio, aparecerá aquí y en Consultas.'}
          </p>
        </div>
        <Link
          href={pendingLeads > 0 ? '/admin/leads?status=pendiente' : '/admin/leads'}
          className={`btn btn-sm ${pendingLeads > 0 ? 'btn-primary' : 'btn-outline'}`}
        >
          {pendingLeads > 0 ? 'Ver pendientes' : 'Ver consultas'}
        </Link>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <Link
            key={stat.id}
            href={stat.href}
            className={`admin-stat-card admin-stat-card--${stat.tone}`}
          >
            <div className="admin-stat-card__top">
              <stat.icon size={22} className="admin-stat-card__icon" aria-hidden />
              <ArrowUpRight size={16} className="admin-stat-card__arrow" aria-hidden />
            </div>
            <p className="admin-stat-value">{stat.value}</p>
            <p className="admin-stat-label">{stat.label}</p>
            <p className="admin-stat-meta">{stat.meta}</p>
          </Link>
        ))}
      </div>

      <div className="admin-table-shell">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Consultas recientes</h2>
            <p className="admin-section-subtitle text-muted text-sm">
              Últimas solicitudes con origen de campaña cuando corresponda.
            </p>
          </div>
          <Link href="/admin/leads" className="btn btn-ghost btn-sm">Ver todas</Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="admin-guided-empty">
            <div className="admin-guided-empty__icon" aria-hidden>
              <Mail size={28} />
            </div>
            <h3 className="admin-guided-empty__title">Aún no hay consultas</h3>
            <p className="admin-guided-empty__text text-muted">
              Cuando un visitante envíe el formulario de contacto o una ficha de propiedad, verás aquí el nombre,
              la propiedad y la campaña UTM de origen.
            </p>
            <div className="admin-guided-empty__actions">
              <Link href="/admin/campanas" className="btn btn-primary">
                Preparar campaña Meta
              </Link>
              <Link href="/admin/propiedades?published=publicadas" className="btn btn-outline">
                Ver propiedades publicadas
              </Link>
            </div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Email</th>
                <th>Propiedad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link href={`/admin/leads/${lead.id}`} className="admin-table-link">
                      {lead.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${lead.status === 'pendiente' ? 'badge-gold' : lead.status === 'contactada' ? 'badge-green' : 'badge-red'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.property?.titleEs ?? '—'}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {publishedProps === 0 && !databaseError ? (
        <div className="admin-alert-banner admin-alert-banner--warning">
          <AlertCircle size={20} aria-hidden />
          <div>
            <strong>No hay propiedades publicadas todavía.</strong>
            <p className="admin-alert-banner__text text-muted text-sm">
              Publica al menos una ficha antes de invertir en campañas pagadas.
            </p>
          </div>
          <Link href="/admin/propiedades/nueva" className="btn btn-primary btn-sm">
            Crear propiedad
          </Link>
        </div>
      ) : null}
    </div>
  );
}
