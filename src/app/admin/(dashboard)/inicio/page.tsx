import type { Metadata } from 'next';
import HomeHeroForm from '@/components/admin/HomeHeroForm';
import { getHomeHeroAdminValues } from '@/features/site-content/home-hero';

export const metadata: Metadata = {
  title: 'Hero del inicio',
};

export default async function AdminHomeHeroPage() {
  const initialValues = await getHomeHeroAdminValues().catch(() => ({
    imageUrl: '',
    titleLine1Es: '',
    titleLine2Es: '',
    subtitleEs: '',
    titleLine1En: '',
    titleLine2En: '',
    subtitleEn: '',
  }));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Hero de la pagina de inicio</h1>
          <p className="admin-page-subtitle text-muted">
            Cambia la imagen de fondo y los textos principales del banner. Los campos vacios mantienen el contenido por defecto del sitio.
          </p>
        </div>
      </header>

      <HomeHeroForm initialValues={initialValues} />
    </div>
  );
}
