import Link from 'next/link';
import { AlertCircle, CheckCircle2, FilePenLine, Home, ImageIcon, Mail, Plus } from 'lucide-react';
import { withDatabaseRole } from '@/lib/db/rls';

type RecentLead = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  property: { titleEs: string } | null;
};

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

export default async function AdminDashboard() {
  const { totalProps, publishedProps, totalLeads, pendingLeads, recentLeads, databaseError } = await getDashboardData();

  const stats = [
    { label: 'Total propiedades', value: totalProps, icon: Home, href: '/admin/propiedades' },
    { label: 'Publicadas', value: publishedProps, icon: CheckCircle2, href: '/admin/propiedades?published=publicadas' },
    { label: 'Consultas recibidas', value: totalLeads, icon: Mail, href: '/admin/leads' },
    { label: 'Borradores', value: totalProps - publishedProps, icon: FilePenLine, href: '/admin/propiedades?published=borradores' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Dashboard</h1>
          <p className="text-muted text-sm">Resumen general de la plataforma</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <Link href="/admin/inicio" className="btn btn-outline">
            <ImageIcon size={18} />
            Hero inicio
          </Link>
          <Link href="/admin/paginas" className="btn btn-outline">
            Paginas
          </Link>
          <Link href="/admin/campanas" className="btn btn-outline">
            Campanas
          </Link>
          <Link href="/admin/propiedades/nueva" className="btn btn-primary">
            <Plus size={18} />
            Nueva propiedad
          </Link>
        </div>
      </div>

      {databaseError && (
        <div className="admin-empty-state compact" style={{ marginBottom: 'var(--space-lg)', alignItems: 'flex-start', textAlign: 'left' }}>
          <strong>No se pudo conectar con la base de datos de produccion.</strong>
          <span className="text-muted text-sm">
            Revisa en Vercel las variables DATABASE_URL y las credenciales de Supabase. El panel cargo, pero los datos no estan disponibles.
          </span>
        </div>
      )}

      {pendingLeads > 0 && (
        <div className="admin-empty-state compact" style={{ marginBottom: 'var(--space-lg)', alignItems: 'flex-start', textAlign: 'left', borderColor: 'var(--color-gold)' }}>
          <AlertCircle size={22} style={{ color: 'var(--color-gold)' }} />
          <div>
            <strong>{pendingLeads} consulta{pendingLeads === 1 ? '' : 's'} pendiente{pendingLeads === 1 ? '' : 's'} de respuesta</strong>
            <p className="text-muted text-sm" style={{ marginTop: 'var(--space-xs)' }}>
              Revisa y marca el estado cuando contactes al cliente.
            </p>
            <Link href="/admin/leads?status=pendiente" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-sm)' }}>
              Ver pendientes
            </Link>
          </div>
        </div>
      )}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-stat-card" style={{ textDecoration: 'none' }}>
            <stat.icon size={26} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }} />
            <p className="admin-stat-value">{stat.value}</p>
            <p className="admin-stat-label">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="admin-table-shell">
        <div className="admin-section-header">
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Consultas recientes</h2>
          <Link href="/admin/leads" className="btn btn-ghost btn-sm">Ver todas</Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="admin-empty-state compact">
            No hay consultas todavia.
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
                    <Link href={`/admin/leads/${lead.id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline' }}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${lead.status === 'pendiente' ? 'badge-gold' : lead.status === 'contactada' ? 'badge-green' : 'badge-red'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.property?.titleEs ?? '-'}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
