import { createProperty } from '../actions';
import PropertyForm from '@/components/admin/PropertyForm';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';

export default async function NuevaPropiedadPage() {
  await requireAdminSession();

  const agents = await withDatabaseRole('admin', async (db) =>
    db.agent.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ).catch(() => []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Nueva Propiedad</h1>
          <p className="text-muted text-sm">Completa todos los campos requeridos</p>
        </div>
      </div>
      <PropertyForm action={createProperty} agents={agents} />
    </div>
  );
}
