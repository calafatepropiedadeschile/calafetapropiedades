import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('terrenos-en-los-muermos');

export default function TerrenosEnLosMuermosPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="terrenos-en-los-muermos" searchParams={searchParams} />;
}
