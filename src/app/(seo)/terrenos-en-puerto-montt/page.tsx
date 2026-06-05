import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('terrenos-en-puerto-montt');

export default function TerrenosEnPuertoMonttPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="terrenos-en-puerto-montt" searchParams={searchParams} />;
}
