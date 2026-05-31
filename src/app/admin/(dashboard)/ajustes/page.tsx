import type { Metadata } from 'next';
import { getSiteSettingsAdminValues } from '@/features/site-content/site-settings';
import SiteSettingsForm from '@/components/admin/SiteSettingsForm';

export const metadata: Metadata = {
  title: 'Ajustes Globales del Sitio',
};

export default async function AdminSiteSettingsPage() {
  const initialValues = await getSiteSettingsAdminValues();

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Ajustes Globales</h1>
          <p className="admin-page-subtitle text-muted">
            Cambia los textos principales, información de contacto y enlaces a redes sociales. Los campos vacíos mantienen el contenido por defecto.
          </p>
        </div>
      </header>

      <SiteSettingsForm initialValues={initialValues} />
    </div>
  );
}
