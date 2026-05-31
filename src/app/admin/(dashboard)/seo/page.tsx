import type { Metadata } from 'next';
import SeoAdminGuide from '@/components/admin/SeoAdminGuide';
import SiteOrganizationSeoForm from '@/components/admin/SiteOrganizationSeoForm';
import SiteSeoSettingsForm from '@/components/admin/SiteSeoSettingsForm';
import { getSiteSeoSettingsForAdmin } from '@/features/site-content/seo-settings';
import { getSiteSettingsAdminValues } from '@/features/site-content/site-settings';

export const metadata: Metadata = {
  title: 'SEO global',
};

export default async function AdminSeoPage() {
  const [seoSettings, siteSettings] = await Promise.all([
    getSiteSeoSettingsForAdmin(),
    getSiteSettingsAdminValues(),
  ]);

  const organizationValues = {
    officeAddress: siteSettings.officeAddress,
    officeStreetAddress: siteSettings.officeStreetAddress,
    officeLocality: siteSettings.officeLocality,
    officeRegion: siteSettings.officeRegion,
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SEO avanzado</h1>
          <p className="admin-page-subtitle text-muted">
            Dominio canonico, indexacion, hreflang, datos estructurados, medicion y metadatos globales. Las fichas y paginas CMS tienen su propio bloque SEO.
          </p>
        </div>
      </header>

      <SeoAdminGuide />
      <SiteSeoSettingsForm initialValues={seoSettings} />
      <SiteOrganizationSeoForm initialValues={organizationValues} />
    </div>
  );
}
