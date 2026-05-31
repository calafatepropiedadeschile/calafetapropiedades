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
            Contacto, redes, textos del inicio y dirección de oficina (footer y JSON-LD de Google). El resto del SEO técnico está en SEO avanzado.
          </p>
        </div>
      </header>

      <SiteSettingsForm initialValues={initialValues} />
    </div>
  );
}
