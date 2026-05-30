import type { Metadata } from 'next';
import SiteSeoSettingsForm from '@/components/admin/SiteSeoSettingsForm';
import { getSiteSeoSettingsForAdmin } from '@/features/site-content/seo-settings';

export const metadata: Metadata = {
  title: 'SEO global',
};

export default async function AdminSeoPage() {
  const settings = await getSiteSeoSettingsForAdmin();

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SEO global</h1>
          <p className="admin-page-subtitle text-muted">
            Configura dominio canónico, indexación, metadatos por defecto, Search Console y scripts de medición sin tocar código.
          </p>
        </div>
      </header>

      <SiteSeoSettingsForm initialValues={settings} />
    </div>
  );
}
