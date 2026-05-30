import SeoLandingPage, { metadataForSeoLanding } from '../seo-page';

export const metadata = metadataForSeoLanding('proyectos');

export default function ProyectosPage() {
  return <SeoLandingPage pageKey="proyectos" />;
}
