import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('parcelas-en-los-muermos');

export default function ParcelasEnLosMuermosPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="parcelas-en-los-muermos" searchParams={searchParams} />;
}
