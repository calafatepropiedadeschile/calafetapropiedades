import AdminSidebar from '@/components/admin/AdminSidebar';
import { requireAdminSession } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="admin-layout">
      <AdminSidebar user={session.user} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
