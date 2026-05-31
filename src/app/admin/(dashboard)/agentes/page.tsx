import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { Users } from 'lucide-react';
import AgentFormModal from '@/components/admin/AgentFormModal';
import DeleteAgentButton from '@/components/admin/DeleteAgentButton';

export default async function AdminAgentsPage() {
  await requireAdminSession();

  const agents = await withDatabaseRole('admin', async (db) => 
    db.agent.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { properties: true }
        }
      }
    })
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Directorio de Agentes</h1>
          <p className="text-muted text-sm">Gestiona el equipo de ventas para asignarlos a las propiedades</p>
        </div>
        <AgentFormModal />
      </div>

      <div className="admin-table-shell">
        {agents.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={42} />
            <p>No hay agentes registrados.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Propiedades asignadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td style={{ fontWeight: 600 }}>{agent.name}</td>
                  <td>{agent.email || '-'}</td>
                  <td>{agent.phone || '-'}</td>
                  <td>{agent._count.properties}</td>
                  <td>
                    <DeleteAgentButton id={agent.id} name={agent.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
