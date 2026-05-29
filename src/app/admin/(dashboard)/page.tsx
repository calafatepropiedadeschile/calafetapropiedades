import Link from 'next/link';
import { CheckCircle2, FilePenLine, Home, Mail, Plus } from 'lucide-react';
import { withDatabaseRole } from '@/lib/db/rls';

type RecentLead = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  property: { titleEs: string } | null;
};

async function getDashboardData(): Promise<{
  totalProps: number;
  publishedProps: number;
  totalLeads: number;
  recentLeads: RecentLead[];
  databaseError: boolean;
}> {
  try {
    const [propertyPublicationCounts, totalLeads, recentLeads] = await withDatabaseRole('admin', async (db) => (
      Promise.all([
        db.property.groupBy({
          by: ['published'],
          _count: { _all: true },
        }),
        db.lead.count(),
        db.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
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
      recentLeads,
      databaseError: false,
    };
  } catch (error) {
    console.error('Admin dashboard failed while loading datasource.', error);

    return {
      totalProps: 0,
      publishedProps: 0,
      totalLeads: 0,
      recentLeads: [],
      databaseError: true,
    };
  }
}

export default async function AdminDashboard() {
  const { totalProps, publishedProps, totalLeads, recentLeads, databaseError } = await getDashboardData();

  const stats = [
    { label: 'Total propiedades', value: totalProps, icon: Home },
    { label: 'Publicadas', value: publishedProps, icon: CheckCircle2 },
    { label: 'Consultas recibidas', value: totalLeads, icon: Mail },
    { label: 'Borradores', value: totalProps - publishedProps, icon: FilePenLine },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Dashboard</h1>
          <p className="text-muted text-sm">Resumen general de la plataforma</p>
        </div>
        <Link href="/admin/propiedades/nueva" className="btn btn-primary">
          <Plus size={18} />
          Nueva propiedad
        </Link>
      </div>

      {databaseError && (
        <div className="admin-empty-state compact" style={{ marginBottom: 'var(--space-lg)', alignItems: 'flex-start', textAlign: 'left' }}>
          <strong>No se pudo conectar con la base de datos de produccion.</strong>
          <span className="text-muted text-sm">
            Revisa en Vercel las variables DATABASE_URL y las credenciales de Supabase. El panel cargo, pero los datos no estan disponibles.
          </span>
        </div>
      )}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <stat.icon size={26} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }} />
            <p className="admin-stat-value">{stat.value}</p>
            <p className="admin-stat-label">{stat.label}</p>
          </div>
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
                <th>Email</th>
                <th>Propiedad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ color: 'var(--color-text)' }}>{lead.name}</td>
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
