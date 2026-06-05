import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('parcelas-en-puerto-montt');

export default function ParcelasEnPuertoMonttPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="parcelas-en-puerto-montt" searchParams={searchParams} />;
}
